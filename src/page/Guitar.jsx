import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { LoaderCircle, AlertTriangle, Play, Pause, Clock, Zap, Sliders, Music, BarChart, TrendingUp, Waves, Activity } from 'lucide-react';
import api from '../api/api.js'; // Adjust path if needed

// --- Helper Component for Detailed Info Lists ---
const InfoItem = ({ label, value, unit = '' }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-700/50 last:border-b-0">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-semibold">{String(value ?? 'N/A')}{unit}</span>
    </div>
);

// --- D3 Chart for Performance Graph ---
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
        const area = d3.area().x(d => x(d.time)).y0(height).y1(d => y(d.value)).curve(d3.curveMonotoneX);
        const line = d3.line().x(d => x(d.time)).y(d => y(d.value)).curve(d3.curveMonotoneX);
        const defs = svg.append("defs");
        const gradient = defs.append("linearGradient").attr("id", gradientId).attr("x1", "0%").attr("y1", "0%").attr("x2", "0%").attr("y2", "100%");
        gradient.append("stop").attr("offset", "0%").attr("stop-color", "#f59e0b").attr("stop-opacity", 0.4);
        gradient.append("stop").attr("offset", "100%").attr("stop-color", "#f59e0b").attr("stop-opacity", 0);

        chart.append("path").datum(data).attr("fill", `url(#${gradientId})`).attr("d", area);
        chart.append("path").datum(data).attr("fill", "none").attr("stroke", "#f59e0b").attr("stroke-width", 2).attr("d", line);
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


// --- Main GuitarAnalysis Component ---
const Guitar = ({ splitsId }) => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!splitsId) {
            setIsLoading(false);
            setError("Analysis ID is missing.");
            return;
        }
        const fetchGuitarData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await api.get(`/analytics/splits/guitar/${splitsId}?`);
                setData(response.data);
            } catch (err) {
                setError("Failed to load guitar analysis.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchGuitarData();
    }, [splitsId]);

    if (isLoading) return <div className="flex items-center text-gray-400"><LoaderCircle size={20} className="animate-spin mr-2" />Loading Guitar Details...</div>;
    if (error) return <div className="text-red-400 flex items-center"><AlertTriangle size={20} className="mr-2"/>{error}</div>;
    if (!data?.guitar_description) {
        return <div className="text-gray-400">Data format from server is incorrect.</div>;
    }

    const { guitar_description } = data;
    const { rhythm, technique, harmony_and_style, performance_graph } = guitar_description;

    return (
        <div className="space-y-10">
            {/* Detailed Metrics Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center"><Clock size={22} className="mr-3 text-amber-400"/>Rhythm</h3>
                    <div className="space-y-2">
                        <InfoItem label="Picks per Second" value={rhythm.picks_per_second?.toFixed(2)} />
                        <InfoItem label="Strums per Second" value={rhythm.strums_per_second?.toFixed(2)} />
                        <InfoItem label="Estimated Tempo" value={rhythm.estimated_tempo_bpm?.toFixed(1)} unit="BPM" />
                    </div>
                </div>

                <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center"><Sliders size={22} className="mr-3 text-amber-400"/>Technique</h3>
                    <div className="space-y-2">
                        <InfoItem label="Sustain Factor" value={technique.sustain_factor?.toFixed(3)} />
                        <InfoItem label="Attack Noisiness" value={technique.attack_noisiness?.toFixed(3)} />
                        <InfoItem label="Dynamic Variation" value={technique.dynamic_variation?.toFixed(3)} />
                        <InfoItem label="Richness (Bandwidth)" value={technique.richness_spectral_bandwidth?.toFixed(0)} unit="Hz" />
                        <InfoItem label="Brightness (Centroid)" value={technique.brightness_spectral_centroid?.toFixed(0)} unit="Hz" />
                    </div>
                </div>
                
                <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center"><Music size={22} className="mr-3 text-amber-400"/>Harmony & Style</h3>
                    <div className="space-y-2">
                        <InfoItem label="Predicted Style" value={harmony_and_style.chord_style_prediction} />
                        <InfoItem label="Clarity (Harmonic Ratio)" value={harmony_and_style.clarity_harmonic_ratio?.toFixed(3)} />
                        <InfoItem label="Chord Complexity" value={harmony_and_style.estimated_chord_complexity?.toFixed(2)} />
                    </div>
                </div>
            </div>

            {/* Performance Graph Section */}
            <div className="w-full">
                <PerformanceLineChart 
                    graphData={performance_graph} 
                    title={`Guitar ${performance_graph.value_type} Over Time`}
                    gradientId="guitar-gradient"
                />
            </div>
        </div>
    );
};

export default Guitar;