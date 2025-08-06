import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { LoaderCircle, AlertTriangle, Music, Sliders, Waves, TrendingUp, Activity, Sun, PieChart } from 'lucide-react';
import api from '../api/api.js'; // Adjust path if needed

// --- Helper Component for Detailed Info Lists ---
const InfoItem = ({ label, value, unit = '' }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-700/50 last:border-b-0">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-semibold">{String(value ?? 'N/A')}{unit}</span>
    </div>
);

// --- D3 Chart for Performance Graph (Handles null values) ---
const PerformanceLineChart = ({ graphData, title, gradientId }) => {
    const svgRef = useRef();
    useEffect(() => {
        if (!graphData?.values?.length || !graphData?.timestamps?.length) return;
        const data = graphData.timestamps.map((time, i) => ({ time, value: graphData.values[i] }));
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();
        const margin = { top: 20, right: 30, bottom: 40, left: 50 };
        const width = svg.node().getBoundingClientRect().width - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;
        const chart = svg.attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`).append("g").attr("transform", `translate(${margin.left},${margin.top})`);
        const x = d3.scaleLinear().domain(d3.extent(data, d => d.time)).range([0, width]);
        const y = d3.scaleLinear().domain([0, d3.max(data, d => d.value) * 1.1]).range([height, 0]);
        chart.append("g").attr("transform", `translate(0, ${height})`).call(d3.axisBottom(x).ticks(7).tickFormat(d => `${d.toFixed(0)}s`)).selectAll("text").style("fill", "#9ca3af");
        chart.append("g").call(d3.axisLeft(y).ticks(5)).selectAll("text").style("fill", "#9ca3af");
        
        // Use .defined() to handle gaps in data where value is null
        const line = d3.line().defined(d => d.value !== null).x(d => x(d.time)).y(d => y(d.value)).curve(d3.curveMonotoneX);

        chart.append("path").datum(data).attr("fill", "none").attr("stroke", "#22d3ee").attr("stroke-width", 2).attr("d", line);
    }, [graphData, gradientId]);
    
    return (
        <div className="w-full">
            <h4 className="text-xl font-semibold text-white mb-4 text-center">{title}</h4>
            <div className="bg-gray-900/50 rounded-lg p-4">
                <svg ref={svgRef} className="w-full"></svg>
            </div>
        </div>
    );
};


// --- Main Flute Component ---
const Flute = ({ splitsId }) => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!splitsId) {
            setIsLoading(false);
            setError("Analysis ID is missing.");
            return;
        }
        const fetchFluteData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await api.get(`/analytics/splits/flute/${splitsId}`);
                setData(response.data);
            } catch (err) {
                setError("Failed to load flute analysis.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFluteData();
    }, [splitsId]);

    if (isLoading) return <div className="flex items-center text-gray-400"><LoaderCircle size={20} className="animate-spin mr-2" />Loading Flute Details...</div>;
    if (error) return <div className="text-red-400 flex items-center"><AlertTriangle size={20} className="mr-2"/>{error}</div>;
    if (!data?.flute_description) {
        return <div className="text-gray-400">Data format from server is incorrect.</div>;
    }

    const { flute_description } = data;
    const { pitch, vibrato, performance_graph, articulation_and_timbre } = flute_description;

    return (
        <div className="space-y-10">
            {/* Detailed Metrics Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center"><Music size={22} className="mr-3 text-cyan-400"/>Pitch</h3>
                    <div className="space-y-2">
                        <InfoItem label="Average Pitch" value={pitch.average_pitch_hz?.toFixed(1)} unit="Hz" />
                        <InfoItem label="Pitch Range" value={pitch.pitch_range_semitones?.toFixed(1)} unit="semitones" />
                        <InfoItem label="Pitch Stability (Std Dev)" value={pitch.pitch_stability_hz_std?.toFixed(1)} unit="Hz" />
                    </div>
                </div>

                <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center"><Waves size={22} className="mr-3 text-cyan-400"/>Vibrato</h3>
                    <div className="space-y-2">
                        <InfoItem label="Vibrato Rate" value={vibrato.vibrato_rate_hz?.toFixed(2)} unit="Hz" />
                        <InfoItem label="Vibrato Depth" value={vibrato.vibrato_depth_cents?.toFixed(2)} unit="cents" />
                    </div>
                </div>
                
                <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center"><Sliders size={22} className="mr-3 text-cyan-400"/>Articulation & Timbre</h3>
                    <div className="space-y-2">
                        <InfoItem label="Legato Score" value={articulation_and_timbre.legato_score?.toFixed(3)} />
                        <InfoItem label="Attack Clarity" value={articulation_and_timbre.attack_clarity?.toFixed(3)} />
                        <InfoItem label="Breathiness/Scratchiness" value={articulation_and_timbre.breathiness_or_scratchiness?.toFixed(3)} />
                        <InfoItem label="HNR" value={articulation_and_timbre.harmonics_to_noise_ratio_db?.toFixed(1)} unit="dB" />
                        <InfoItem label="Brightness" value={articulation_and_timbre.brightness_spectral_centroid?.toFixed(0)} unit="Hz" />
                    </div>
                </div>
            </div>

            {/* Performance Graph Section */}
            <div className="w-full">
                <PerformanceLineChart 
                    graphData={performance_graph} 
                    title={`Flute ${performance_graph.value_type} Over Time`}
                    gradientId="flute-gradient"
                />
            </div>
        </div>
    );
};

export default Flute;