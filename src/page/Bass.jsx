import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { LoaderCircle, AlertTriangle, TrendingUp, Music, BarChart, Zap, Play, Pause } from 'lucide-react';
import api from '../api/api.js'; // Adjust path if needed
import AudioPlayerWithVisualizer from '../compoments/AudioPlayerWithVisualizer.jsx';

// --- NEW: Detailed Stat Card Component ---
const StatCard = ({ icon, label, value, unit = '' }) => (
    <div className="bg-gray-800/60 border border-gray-700 p-6 rounded-2xl shadow-lg flex flex-col items-start justify-between">
        <div className="flex items-center text-gray-400">
            {icon}
            <span className="ml-3 text-lg font-medium">{label}</span>
        </div>
        <div className="mt-4">
            <span className="text-5xl font-bold text-white tracking-tight">{String(value ?? 'N/A')}</span>
            <span className="text-2xl text-gray-400 ml-2">{unit}</span>
        </div>
    </div>
);


// --- D3 Chart for Performance Graph ---
const PerformanceLineChart = ({ graphData, title }) => {
    const svgRef = useRef();

    useEffect(() => {
        if (!graphData?.values?.length || !graphData?.timestamps?.length) return;
        const data = graphData.timestamps.map((time, i) => ({ time, value: graphData.values[i] }));
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();
        const margin = { top: 20, right: 30, bottom: 40, left: 50 };
        // Adjusted width to be more responsive
        const width = svg.node().getBoundingClientRect().width - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;

        const chart = svg.attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`).append("g").attr("transform", `translate(${margin.left},${margin.top})`);
        const x = d3.scaleLinear().domain(d3.extent(data, d => d.time)).range([0, width]);
        const y = d3.scaleLinear().domain([0, d3.max(data, d => d.value) * 1.1]).range([height, 0]);
        chart.append("g").attr("transform", `translate(0, ${height})`).call(d3.axisBottom(x).ticks(7).tickFormat(d => `${d.toFixed(0)}s`)).selectAll("text").style("fill", "#9ca3af");
        chart.append("g").call(d3.axisLeft(y).ticks(5)).selectAll("text").style("fill", "#9ca3af");
        const area = d3.area().x(d => x(d.time)).y0(height).y1(d => y(d.value)).curve(d3.curveMonotoneX);
        const line = d3.line().x(d => x(d.time)).y(d => y(d.value)).curve(d3.curveMonotoneX);
        svg.append("defs").append("linearGradient").attr("id", "bass-gradient").attr("x1", "0%").attr("y1", "0%").attr("x2", "0%").attr("y2", "100%").append("stop").attr("offset", "0%").attr("stop-color", "#a855f7").attr("stop-opacity", 0.4);
        chart.append("path").datum(data).attr("fill", "url(#bass-gradient)").attr("d", area);
        chart.append("path").datum(data).attr("fill", "none").attr("stroke", "#a855f7").attr("stroke-width", 2).attr("d", line);
    }, [graphData]);

    return (
        <div className="w-full">
            <h4 className="text-xl font-semibold text-white mb-4 text-center">{title}</h4>
            <div className="bg-gray-900/50 rounded-lg p-4">
                <svg ref={svgRef} className="w-full"></svg>
            </div>
        </div>
    );
};


// --- Main BassAnalysis Component ---
const BassAnalysis = ({ splitsId }) => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!splitsId) {
            setIsLoading(false);
            setError("Analysis ID is missing.");
            return;
        }
        const fetchBassData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await api.get(`/analytics/splits/bass/${splitsId}`);
                setData(response.data);
            } catch (err) {
                setError("Failed to load bass analysis.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBassData();
    }, [splitsId]);

    if (isLoading) return <div className="flex items-center text-gray-400"><LoaderCircle size={20} className="animate-spin mr-2" />Loading Bass Details...</div>;
    if (error) return <div className="text-red-400 flex items-center"><AlertTriangle size={20} className="mr-2" />{error}</div>;
    if (!data?.bass_description || !data?.bass_audio_url) return <div className="text-gray-400">Data format from server is incorrect.</div>;

    const { bass_description, bass_audio_url } = data;
    const { dominant_note, low_end_power, onset_density, rhythm_stability, performance_graph } = bass_description;

    return (
        <div className="space-y-10"> {/* Increased spacing between sections */}

            {/* Key Metrics Section - Now 2x2 Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <StatCard icon={<Music size={24} />} label="Dominant Note" value={dominant_note} />
                <StatCard icon={<Zap size={24} />} label="Low-End Power" value={low_end_power?.toFixed(3)} />
                <StatCard icon={<BarChart size={24} />} label="Onset Density" value={onset_density?.toFixed(2)} unit="/sec" />
                <StatCard icon={<TrendingUp size={24} />} label="Rhythm Stability" value={rhythm_stability?.toFixed(2)} />
            </div>

            {/* Performance Graph Section - Full Width Row */}
            <div className="w-full">
                <PerformanceLineChart
                    graphData={performance_graph}
                    title={`Bass ${performance_graph.value_type} Over Time`}
                />
            </div>

            {/* Audio Player Section - Full Width Row */}
            <div className="w-full">
                <h3 className="text-2xl font-bold text-white mb-4 text-center">Isolated Bass Track</h3>
                <AudioPlayerWithVisualizer audioUrl={bass_audio_url} />
            </div>

        </div>
    );
};

export default BassAnalysis;