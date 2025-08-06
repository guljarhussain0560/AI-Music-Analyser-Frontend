import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { LoaderCircle, AlertTriangle, Play, Pause, PieChart, User, Mic, Clock, Info } from 'lucide-react';
import api from '../api/api.js'; // Adjust path if needed
import AudioPlayerWithVisualizer from '../compoments/AudioPlayerWithVisualizer.jsx';

// --- Helper Component for Main Stats ---
const StatCard = ({ icon, label, value, unit = '' }) => (<div className="bg-gray-800/60 border border-gray-700 p-6 rounded-2xl shadow-lg flex flex-col items-start justify-between"><div className="flex items-center text-gray-400">{icon}<span className="ml-3 text-lg font-medium">{label}</span></div><div className="mt-4"><span className="text-5xl font-bold text-white tracking-tight">{String(value ?? 'N/A')}</span><span className="text-2xl text-gray-400 ml-2">{unit}</span></div></div>);

// --- Helper Component for Detailed Info Lists ---
const InfoItem = ({ label, value, unit = '' }) => (<div className="flex justify-between items-center py-2 border-b border-gray-700/50 last:border-b-0"><span className="text-gray-400">{label}</span><span className="text-white font-semibold">{String(value ?? 'N/A')}{unit}</span></div>);

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
        const line = d3.line().defined(d => d.value !== null).x(d => x(d.time)).y(d => y(d.value)).curve(d3.curveMonotoneX);
        chart.append("path").datum(data).attr("fill", "none").attr("stroke", "#38bdf8").attr("stroke-width", 2).attr("d", line);
    }, [graphData, gradientId]);
    return (<div className="w-full"><h4 className="text-xl font-semibold text-white mb-4 text-center">{title}</h4><div className="bg-gray-900/50 rounded-lg p-4"><svg ref={svgRef} className="w-full"></svg></div></div>);
};




// --- Main Vocal Component ---
const Vocal = ({ splitsId }) => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!splitsId) {
            setIsLoading(false);
            setError("Analysis ID is missing.");
            return;
        }
        const fetchVocalData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await api.get(`/analytics/splits/vocals/${splitsId}`);
                setData(response.data);
            } catch (err) {
                setError("Failed to load vocal analysis.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchVocalData();
    }, [splitsId]);

    if (isLoading) return <div className="flex items-center text-gray-400"><LoaderCircle size={20} className="animate-spin mr-2" />Loading Vocal Details...</div>;
    if (error) return <div className="text-red-400 flex items-center"><AlertTriangle size={20} className="mr-2" />{error}</div>;
    if (!data?.vocals_description || !data?.vocals_audio_url) {
        return <div className="text-gray-400">Data format from server is incorrect.</div>;
    }

    const { vocals_description, vocals_audio_url } = data;
    const { summary, pitch_details, vocal_quality, rhythm_and_rate, loudness_details, performance_graph, timbre_and_texture } = vocals_description;

    return (
        <div className="space-y-10">
            {/* Main Summary Section - EDITED FOR 2 CARDS PER ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <StatCard icon={<User size={24} />} label="Gender Prediction" value={summary.gender_prediction} />
                <StatCard icon={<PieChart size={24} />} label="Percent Voiced" value={summary.percent_voiced?.toFixed(1)} unit="%" />
                <StatCard icon={<Mic size={24} />} label="Average Pitch" value={pitch_details.average_pitch_hz?.toFixed(0)} unit="Hz" />
                <StatCard icon={<Clock size={24} />} label="Speech Rate" value={rhythm_and_rate.speech_rate_onsets_per_sec?.toFixed(2)} unit="onsets/sec" />
            </div>
            {summary.prediction_note && (
                <div className="text-center text-gray-500 text-sm italic flex items-center justify-center">
                    <Info size={16} className="mr-2 flex-shrink-0" />
                    {summary.prediction_note}
                </div>
            )}

            {/* Detailed Metrics Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4">Pitch Details</h3>
                    <div className="space-y-2">
                        <InfoItem label="Lowest Note" value={`${pitch_details.lowest_note} (${pitch_details.lowest_pitch_hz?.toFixed(0)} Hz)`} />
                        <InfoItem label="Highest Note" value={`${pitch_details.highest_note} (${pitch_details.highest_pitch_hz?.toFixed(0)} Hz)`} />
                        <InfoItem label="Pitch Variation (Std Dev)" value={pitch_details.pitch_std_dev_hz?.toFixed(0)} unit="Hz" />
                        <InfoItem label="Vocal Range" value={pitch_details.vocal_range_semitones} unit="semitones" />
                    </div>
                </div>
                <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4">Vocal Quality</h3>
                    <div className="space-y-2">
                        <InfoItem label="Jitter" value={vocal_quality.jitter_percent?.toFixed(2)} unit="%" />
                        <InfoItem label="Shimmer" value={vocal_quality.shimmer_percent?.toFixed(2)} unit="%" />
                        <InfoItem label="Harmonics-to-Noise Ratio" value={vocal_quality.harmonics_to_noise_ratio_db?.toFixed(1)} unit="dB" />
                    </div>
                </div>
                <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 md:col-span-2">
                    <h3 className="text-xl font-bold text-white mb-4">Timbre & Loudness</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                        <InfoItem label="Average Loudness" value={loudness_details.average_loudness_db?.toFixed(1)} unit="dB" />
                        <InfoItem label="Loudness Variation" value={loudness_details.loudness_variation_db?.toFixed(1)} unit="dB" />
                        <InfoItem label="Spectral Centroid" value={timbre_and_texture.spectral_centroid_hz?.toFixed(0)} unit="Hz" />
                        <InfoItem label="Spectral Bandwidth" value={timbre_and_texture.spectral_bandwidth_hz?.toFixed(0)} unit="Hz" />
                    </div>
                </div>
            </div>

            {/* Performance Graph Section */}
            <div className="w-full">
                <PerformanceLineChart
                    graphData={performance_graph}
                    title={`Vocal Pitch Contour Over Time`}
                    gradientId="vocal-gradient"
                />
            </div>

            {/* Audio Player Section */}
            <div className="w-full">
                <h3 className="text-2xl font-bold text-white mb-4 text-center">Isolated Vocal Track</h3>
                <AudioPlayerWithVisualizer audioUrl={vocals_audio_url} />
            </div>
        </div>
    );
};

export default Vocal;