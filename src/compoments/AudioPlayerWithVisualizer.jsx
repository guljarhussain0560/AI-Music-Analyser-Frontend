import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause } from 'lucide-react';

// --- Audio Player with Live Waveform ---
const AudioPlayerWithVisualizer = ({ audioUrl }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    // New state for timeline
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const audioRef = useRef(null);
    const canvasRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);

    useEffect(() => {
        if (!isPlaying || !analyserRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const analyser = analyserRef.current;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        let animationFrameId;
        const draw = () => {
            animationFrameId = requestAnimationFrame(draw);
            analyser.getByteTimeDomainData(dataArray);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, "#60a5fa");
            gradient.addColorStop(1, "#38bdf8");
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
        };
        draw();
        return () => cancelAnimationFrame(animationFrameId);
    }, [isPlaying]);

    const togglePlayPause = () => {
        if (!audioContextRef.current && audioRef.current) {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaElementSource(audioRef.current);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 2048;
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            audioContextRef.current = audioContext;
            analyserRef.current = analyser;
        }
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    // New helper functions for the timeline
    const formatTime = (timeInSeconds) => {
        if (isNaN(timeInSeconds)) return "0:00";
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleSeek = (event) => {
        const time = Number(event.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    return (
        <div className="w-full bg-gray-900/50 rounded-lg p-6 flex flex-col items-center">
            <canvas ref={canvasRef} width="1000" height="120" className="w-full h-28"></canvas>

            {/* New timeline element */}
            <div className="w-full flex items-center gap-4 mt-4 mb-2">
                <span className="text-sm text-gray-400 font-mono w-12 text-center">{formatTime(currentTime)}</span>
                <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-sm accent-sky-500"
                />
                <span className="text-sm text-gray-400 font-mono w-12 text-center">{formatTime(duration)}</span>
            </div>

            {/* Added new event handlers to the audio element */}
            <audio
                ref={audioRef}
                src={audioUrl}
                crossOrigin="anonymous"
                onEnded={() => setIsPlaying(false)}
                onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
                onLoadedMetadata={(e) => setDuration(e.target.duration)}
            ></audio>

            <button onClick={togglePlayPause} className="bg-sky-600 hover:bg-sky-700 text-white p-4 rounded-full shadow-lg">
                {isPlaying ? <Pause size={28} /> : <Play size={28} />}
            </button>
        </div>
    );
};

export default AudioPlayerWithVisualizer;
