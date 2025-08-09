import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import * as d3 from 'd3';
import { Play, Pause, Music, Clock, BarChart2, Zap, Sliders, Speaker, Layers, Info, LoaderCircle, AlertTriangle, ChevronDown } from 'lucide-react';
import api from '../api/api.js';

// Import all your instrument analysis components
import Bass from './Bass';
import Piano from './Piano';
import Drum from './Drum';
import Vocal from './Vocal';
import Other from './Other';
import Guitar from './Guitar';
import Flute from './Flute';
import Violin from './Violin';
import MusicChatbot from '../compoments/chatbot/MusicChatbot.jsx';



// --- Reusable Helper Components ---

const AccordionWrapper = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center px-4 py-6 text-left text-lg font-semibold text-white hover:bg-gray-700/50 transition-colors"
            >
                <span>{title}</span>
                <ChevronDown className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (<div className="p-6 border-t border-gray-700 text-gray-300">{children}</div>)}
        </div>
    );
};

const Card = ({ title, icon, children, className }) => (
    <div className={`bg-gray-800/50 bg-opacity-50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-lg flex flex-col ${className}`}>
        <div className="flex items-center mb-4">
            {icon}
            <h3 className="text-xl font-bold text-white ml-3">{title}</h3>
        </div>
        <div className="flex-grow">{children}</div>
    </div>
);

const InfoItem = ({ label, value, unit = '' }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
        <span className="text-gray-400 font-semibold">{label}</span>
        <span className="text-white font-bold">{String(value ?? 'N/A')}{unit}</span>
    </div>
);

const TonalityBarChart = ({ data, key_name }) => {
    const svgRef = useRef();
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    useEffect(() => {
        if (!data || data.length !== 12) return;
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();
        const margin = { top: 20, right: 20, bottom: 30, left: 40 };
        const width = 300 - margin.left - margin.right;
        const height = 250 - margin.top - margin.bottom;
        const chart = svg.attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", `translate(${margin.left},${margin.top})`);
        const xScale = d3.scaleBand().domain(notes).range([0, width]).padding(0.2);
        const yScale = d3.scaleLinear().domain([0, d3.max(data) * 1.1 || 1]).range([height, 0]);
        chart.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(xScale)).selectAll("text").style("fill", "#9ca3af");
        chart.selectAll(".bar").data(data).enter().append("rect").attr("x", (d, i) => xScale(notes[i])).attr("width", xScale.bandwidth()).attr("y", d => yScale(0)).attr("height", 0).attr("fill", (d, i) => notes[i] === key_name ? "#a855f7" : "#4f46e5").attr("rx", 2).transition().duration(800).attr("y", d => yScale(d)).attr("height", d => height - yScale(d));
    }, [data, key_name]);
    return <svg ref={svgRef}></svg>;
};

const MainAudioPlayer = ({ audioUrl }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    const audioRef = useRef(null);
    const canvasRef = useRef(null);
    const progressBarRef = useRef(null);
    const animationFrameRef = useRef(null);

    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const sourceRef = useRef(null);

    const setupAudioContext = () => {
        if (audioContextRef.current || !audioRef.current) return;
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaElementSource(audioRef.current);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);
        analyser.connect(audioContext.destination);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        sourceRef.current = source;
    };

    const draw = () => {
        if (!analyserRef.current || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const analyser = analyserRef.current;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        analyser.getByteTimeDomainData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, "#a855f7");
        gradient.addColorStop(1, "#3b82f6");
        ctx.lineWidth = 2;
        ctx.strokeStyle = gradient;
        ctx.beginPath();
        const sliceWidth = canvas.width * 1.0 / bufferLength;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = v * canvas.height / 2;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            x += sliceWidth;
        }
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();

        animationFrameRef.current = requestAnimationFrame(draw);
    };

    const togglePlayPause = () => {
        if (!audioContextRef.current) setupAudioContext();

        const audio = audioRef.current;
        const prevValue = isPlaying;
        setIsPlaying(!prevValue);

        if (!prevValue) {
            audio.play();
            animationFrameRef.current = requestAnimationFrame(draw);
        } else {
            audio.pause();
            cancelAnimationFrame(animationFrameRef.current);
        }
    };

    const onLoadedMetadata = () => {
        setDuration(audioRef.current.duration);
    };

    const onTimeUpdate = () => {
        setCurrentTime(audioRef.current.currentTime);
    };

    const handleProgressClick = (e) => {
        if (!progressBarRef.current || !audioRef.current) return;
        const progressBar = progressBarRef.current;
        const clickPositionX = e.pageX - progressBar.getBoundingClientRect().left;
        const width = progressBar.offsetWidth;
        const newTime = (clickPositionX / width) * duration;
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const formatTime = (timeInSeconds) => {
        if (isNaN(timeInSeconds) || timeInSeconds === 0) return '0:00';
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <Card title="Live Audio Waveform" icon={<BarChart2 className="text-purple-400" />}>
            <div className="w-full">
                <audio
                    ref={audioRef}
                    src={audioUrl}
                    crossOrigin="anonymous"
                    onLoadedMetadata={onLoadedMetadata}
                    onTimeUpdate={onTimeUpdate}
                    onEnded={() => setIsPlaying(false)}
                />
                <canvas ref={canvasRef} width="1000" height="150" className="w-full h-36 rounded-lg bg-gray-900/50" />

                <div className="mt-4 flex items-center gap-4">
                    <button onClick={togglePlayPause} className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg">
                        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                    </button>
                    <span className="text-sm text-gray-400 w-12 text-center">{formatTime(currentTime)}</span>
                    <div
                        ref={progressBarRef}
                        onClick={handleProgressClick}
                        className="w-full h-2 bg-gray-700 rounded-full cursor-pointer group"
                    >
                        <div
                            style={{ width: `${(currentTime / duration) * 100}%` }}
                            className="h-full bg-purple-500 rounded-full relative"
                        >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                    </div>
                    <span className="text-sm text-gray-400 w-12 text-center">{formatTime(duration)}</span>
                </div>
            </div>
        </Card>
    );
};


// --- Main Song Component ---
export default function Song() {
    const { id } = useParams();
    const [songData, setSongData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();
    const splitsId = location.state?.splitsId;

    useEffect(() => {
        const fetchSongData = async () => {
            if (!id) return;
            try {
                setLoading(true);
                setError(null);
                const response = await api.get(`/analytics/songs/${id}`);
                setSongData(response.data);
            } catch (err) {
                const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Failed to fetch song data.';
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };
        fetchSongData();
    }, [id]);
    const navigate = useNavigate();


    const formatNumber = (num, digits = 1) => {
        const parsed = parseFloat(num);
        if (isNaN(parsed)) return null;
        return parsed.toFixed(digits);
    };

    if (loading) return (
        <div className="flex flex-col justify-center items-center h-screen text-white"><LoaderCircle size={48} className="animate-spin mb-4" /><p className="text-xl">Performing deep music analysis...</p></div>
    );

    if (error || !songData) return (
        <div className="flex flex-col justify-center items-center h-screen text-red-400"><AlertTriangle size={48} className="mb-4" /><p className="text-xl">Analysis Error</p><p className="text-center max-w-md">{error || "Could not load song data."}</p></div>
    );

    const {
        song_url,
        title,
        description: {
            metadata = {},
            summary = {},
            rhythm_and_tempo = {},
            dynamics_and_loudness = {},
            timbre_and_spectral_properties = {},
            tonality_and_harmony = {},
            structural_analysis = {},
        } = {}
    } = songData;

    const { rms_energy = {}, zero_crossing_rate = {} } = dynamics_and_loudness;
    const { spectral_centroid = {} } = timbre_and_spectral_properties;

    const formatDuration = (seconds) => {
        const parsedSeconds = parseFloat(seconds);
        if (isNaN(parsedSeconds)) return 'N/A';
        const minutes = Math.floor(parsedSeconds / 60);
        const remainingSeconds = Math.floor(parsedSeconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };


    const fileName = title ? title.split(/[\\/]/).pop().replace('.mp3', '') : "Untitled Track";

    return (
        <div className=" text-gray-300  min-h-screen p-4 md:p-8 font-sans">

            <div className="max-w-7xl mx-auto">
                <header className="mb-8 p-6 bg-gray-800/50 border border-gray-700 bg-opacity-50  backdrop-blur-sm rounded-2xl shadow-xl flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-white">{fileName}</h1>
                        <p className="text-purple-400">{summary.estimated_key || 'N/A'} {summary.mode || ''}</p>
                    </div>
                </header>

                <div className="mb-8">
                    <MainAudioPlayer audioUrl={song_url} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <Card title="Summary" icon={<Info className="text-blue-400" />}><InfoItem label="BPM" value={formatNumber(summary.tempo_bpm, 1)} /><InfoItem label="Key" value={`${summary.estimated_key} ${summary.mode || ''}`} /><InfoItem label="Key Confidence" value={formatNumber(summary.key_confidence, 2)} /><InfoItem label="Duration" value={formatDuration(metadata.duration_seconds)} /><InfoItem label="Harmonic/Percussive Ratio" value={formatNumber(summary.harmonic_to_percussive_ratio, 2)} /></Card>
                    <Card title="Rhythm & Tempo" icon={<Clock className="text-green-400" />}><InfoItem label="Beat Count" value={rhythm_and_tempo.beat_count} /><InfoItem label="Onset Count" value={rhythm_and_tempo.onset_count} /><InfoItem label="Onset Density" value={formatNumber(rhythm_and_tempo.onset_density_per_sec, 2)} unit="/sec" /></Card>
                    <Card title="Dynamics & Loudness" icon={<Zap className="text-yellow-400" />}><InfoItem label="Avg. Energy (RMS)" value={formatNumber(rms_energy.rms_energy_mean, 3)} /><InfoItem label="Peak Energy (RMS)" value={formatNumber(rms_energy.rms_energy_max, 3)} /><InfoItem label="Crest Factor" value={formatNumber(dynamics_and_loudness.crest_factor, 2)} /><InfoItem label="Avg. Zero-Crossing Rate" value={formatNumber(zero_crossing_rate.zcr_mean, 3)} /></Card>
                    <Card title="Tonality" icon={<Music className="text-red-400" />} className="flex justify-center items-center"><TonalityBarChart data={tonality_and_harmony.chroma_profile} key_name={summary.estimated_key} /></Card>
                    <Card title="Timbre (Spectral)" icon={<Sliders className="text-orange-400" />}><InfoItem label="Brightness (Centroid)" value={formatNumber(spectral_centroid.spectral_centroid_mean, 0)} unit=" Hz" /><InfoItem label="Timbral Width (Bandwidth)" value={formatNumber(timbre_and_spectral_properties.spectral_bandwidth?.spectral_bandwidth_mean, 0)} unit=" Hz" /><InfoItem label="Timbral Purity (Flatness)" value={formatNumber(timbre_and_spectral_properties.spectral_flatness?.spectral_flatness_mean, 3)} /></Card>
                    <Card title="Structural Segments" icon={<Layers className="text-indigo-400" />}><div className="overflow-y-auto max-h-48 pr-2">{structural_analysis.segments?.map(seg => (<InfoItem key={seg.segment_id} label={`Segment ${seg.segment_id}`} value={`${formatDuration(seg.start_time)} - ${formatDuration(seg.end_time)}`} />))}</div></Card>
                </div>

                {splitsId && (
                    <div className="mt-16">
                        <div className="text-center mb-4 flex justify-center items-center">
                            <button
                                type="button"
                                onClick={() => window.open(`/lyrics/${id}`, '_blank', 'noopener,noreferrer')}
                                className="group flex items-center gap-2 px-4 py-2 cursor-pointer text-white border bg-purple-600 border-gray-600 rounded-lg hover:bg-purple-900 hover:text-white hover:border-purple-950 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                {/* A different icon, like musical notes */}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 text-white group-hover:text-white transition-colors"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3V3z" />
                                </svg>
                                <span>Click here to view lyrics</span>
                            </button>

                        </div>
                        <br />
                        <h2 className="text-5xl font-bold text-white mb-10 text-center">
                            Instrument Analyses
                        </h2>

                        <div className="space-y-8 max-w-7xl mx-auto">
                            <AccordionWrapper title="Bass Analysis"><Bass splitsId={splitsId} /></AccordionWrapper>
                            <AccordionWrapper title="Piano Analysis"><Piano splitsId={splitsId} /></AccordionWrapper>
                            <AccordionWrapper title="Drum Analysis"><Drum splitsId={splitsId} /></AccordionWrapper>
                            <AccordionWrapper title="Vocal Analysis"><Vocal splitsId={splitsId} /></AccordionWrapper>
                            <AccordionWrapper title="Guitar Analysis"><Guitar splitsId={splitsId} /></AccordionWrapper>
                            <AccordionWrapper title="Flute Analysis"><Flute splitsId={splitsId} /></AccordionWrapper>
                            <AccordionWrapper title="Violin Analysis"><Violin splitsId={splitsId} /></AccordionWrapper>
                            <AccordionWrapper title="Other Instruments"><Other splitsId={splitsId} /></AccordionWrapper>
                        </div>
                    </div>
                )}
            </div>
            <div class="
  fixed      
  bottom-5   
  right-5    
  z-50

  p-4
  bg-gray-800
  text-white
  rounded-lg
  shadow-xl
">
                <MusicChatbot />
            </div>
        </div>
    );
}