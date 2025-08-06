import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { LoaderCircle, AlertTriangle, Play, Pause, Volume2, Sun, Puzzle } from 'lucide-react';
import api from '../api/api.js'; // Adjust path if needed
import AudioPlayerWithVisualizer from '../compoments/AudioPlayerWithVisualizer.jsx';

// --- Helper Component for Key Metrics ---
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
        gradient.append("stop").attr("offset", "0%").attr("stop-color", "#34d399").attr("stop-opacity", 0.4);
        gradient.append("stop").attr("offset", "100%").attr("stop-color", "#34d399").attr("stop-opacity", 0);

        chart.append("path").datum(data).attr("fill", `url(#${gradientId})`).attr("d", area);
        chart.append("path").datum(data).attr("fill", "none").attr("stroke", "#34d399").attr("stroke-width", 2).attr("d", line);
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


// --- Main Other Instruments Component ---
const Other = ({ splitsId }) => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!splitsId) {
            setIsLoading(false);
            setError("Analysis ID is missing.");
            return;
        }
        const fetchOtherData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // This component fetches data specifically for the 'other' type
                const response = await api.get(`/analytics/splits/other/${splitsId}`);
                setData(response.data);
            } catch (err) {
                setError("Failed to load other instruments analysis.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOtherData();
    }, [splitsId]);

    if (isLoading) return <div className="flex items-center text-gray-400"><LoaderCircle size={20} className="animate-spin mr-2" />Loading Other Instrument Details...</div>;
    if (error) return <div className="text-red-400 flex items-center"><AlertTriangle size={20} className="mr-2" />{error}</div>;
    if (!data?.other_description || !data?.other_audio_url) return <div className="text-gray-400">Data format from server is incorrect.</div>;

    const { other_description, other_audio_url } = data;
    const { average_loudness, performance_graph, average_brightness, texture_complexity } = other_description;

    return (
        <div className="space-y-10">
            {/* Key Metrics Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={<Volume2 size={24} />} label="Average Loudness" value={average_loudness?.toFixed(2)} unit="dB" />
                <StatCard icon={<Sun size={24} />} label="Average Brightness" value={average_brightness?.toFixed(2)} unit="Hz" />
                <StatCard icon={<Puzzle size={24} />} label="Texture Complexity" value={texture_complexity?.toFixed(2)} />
            </div>

            {/* Performance Graph Section */}
            <div className="w-full">
                <PerformanceLineChart
                    graphData={performance_graph}
                    title={`Other Instruments ${performance_graph.value_type} Over Time`}
                    gradientId="other-gradient"
                />
            </div>

            {/* Audio Player Section */}
            <div className="w-full">
                <h3 className="text-2xl font-bold text-white mb-4 text-center">Isolated Other Instruments Track</h3>
                <AudioPlayerWithVisualizer audioUrl={other_audio_url} />
            </div>

        </div>
    );
};

export default Other;