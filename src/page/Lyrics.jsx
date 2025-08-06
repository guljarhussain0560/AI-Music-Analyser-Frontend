import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/api.js'; // Adjust the path if necessary

// Utility to parse LRC format
const parseLrc = (lrcString) => {
    if (!lrcString) return [];
    return lrcString.split('\n')
        .map((line, index) => {
            const text = line.replace(/\[(\d{2}:\d{2}\.\d{2,3})\]/, '').trim();
            return text ? { id: `${index}-${text.slice(0, 10)}`, text } : null;
        })
        .filter(Boolean);
};

// --- Custom SVG Icons ---
const MicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-300" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 017 8a1 1 0 10-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
    </svg>
);

// New AI Icon, inspired by modern AI symbols
const AiIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6">
        <path d="M12 2L13.849 10.151L22 12L13.849 13.849L12 22L10.151 13.849L2 12L10.151 10.151L12 2Z" fill="url(#ai-icon-gradient)" />
        <defs>
            <linearGradient id="ai-icon-gradient" x1="2" y1="12" x2="22" y2="12" gradientUnits="userSpaceOnUse">
                <stop stopColor="#22d3ee"/>
                <stop offset="1" stopColor="#0ea5e9"/>
            </linearGradient>
        </defs>
    </svg>
);


// Component to render a block of lyrics with animation
const LyricsBlock = ({ title, lyrics, icon, panelClass }) => (
    <div className={`mt-10 rounded-2xl bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 transition-all duration-300 hover:border-gray-500/80 hover:shadow-2xl ${panelClass}`}>
        <div className="flex items-center gap-4 p-4 border-b border-gray-700/50">
            {icon}
            <h2 className="text-xl font-bold tracking-wider text-gray-200">{title}</h2>
        </div>
        <div className="p-6 md:p-8 space-y-3">
            {lyrics.length > 0 ? lyrics.map((line, index) => (
                <p
                    key={line.id}
                    className="text-gray-300 text-lg leading-relaxed font-serif tracking-wide animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                >
                    {line.text}
                </p>
            )) : (
                 <p className="text-gray-500 italic">No lyrics to display.</p>
            )}
        </div>
    </div>
);


function Lyrics() {
    const { songId } = useParams(); // Gets songId from the URL (e.g., 'ek-number')

    // State management
    const [originalLyrics, setOriginalLyrics] = useState([]);
    const [rewrittenLyrics, setRewrittenLyrics] = useState([]);
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isRewriting, setIsRewriting] = useState(false);
    const [error, setError] = useState(null);

    // Effect to fetch initial lyrics on page load
    useEffect(() => {
        const fetchLyrics = async () => {
            try {
                const response = await api.get(`/process/get-lyrics/${songId}`);
                const data = response.data;
                setOriginalLyrics(parseLrc(data.original_lrc));
            } catch (err) {
                setError('Failed to load lyrics. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchLyrics();
    }, [songId]);

    // Handler for the rewrite action
    const handleRewrite = async (e) => {
        e.preventDefault();
        if (!prompt) {
            alert('Please enter a prompt to rewrite the lyrics.');
            return;
        }
        setIsRewriting(true);
        setRewrittenLyrics([]); // Clear previous results
        try {
            const response = await api.post(`/process/rewrite-lyrics/${songId}`, {
                prompt: prompt
            });
            const data = response.data; // Use response.data directly
            setRewrittenLyrics(parseLrc(data.lyrics));
        } catch (err) {
            console.error("Rewrite failed:", err); // Log the actual error
            alert('Failed to rewrite lyrics. Check the console for details.');
        } finally {
            setIsRewriting(false);
        }
    };

    // --- Loading and Error States ---
    if (isLoading) return (
        <div className="flex flex-col justify-center items-center h-screen text-white bg-gray-900">
            <svg className="animate-spin h-10 w-10 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-lg">Loading Lyrics...</p>
        </div>
    );
    if (error) return <div className="flex justify-center items-center h-screen text-red-500 bg-gray-900 text-xl">{error}</div>;

    // --- Main Component Render ---
    return (
        <div className="">
            <div className="max-w-4xl mx-auto">

                {/* --- Original Lyrics Panel --- */}
                <LyricsBlock
                    title="Original Lyrics"
                    lyrics={originalLyrics}
                    icon={<MicIcon />}
                    panelClass="hover:shadow-purple-500/20"
                />

                {/* --- AI Rewrite Form --- */}
                {originalLyrics.length > 0 && (
                    <div className="mt-16 mb-12 p-6 text-center">
                        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-cyan-400 to-fuchsia-500 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]">
                            Remix with AI
                        </h2>
                        <p className="text-gray-400 mb-8 max-w-xl mx-auto">Enter a prompt to transform the lyrics with a new style, theme, or emotion.</p>
                        <form onSubmit={handleRewrite}>
                            <div className="flex flex-col items-center gap-4">
                                <input
                                    type="text"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="e.g., 'Make it a sad song...'"
                                    color='white'
                                    className="w-full max-w-lg p-5 text-white bg-gray-900/70 rounded-lg border-2 border-gray-700 placeholder:text-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none transition-all duration-300 text-lg"
                                />
                                <button
                                    type="submit"
                                    disabled={isRewriting}
                                    className="group w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-3 px-12 py-5 bg-cyan-600 text-white font-bold text-lg rounded-lg shadow-lg shadow-cyan-500/20 hover:bg-cyan-500 hover:shadow-cyan-500/40 transform hover:scale-105 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
                                >
                                    {isRewriting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            <span>Generating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <AiIcon />
                                            <span>Generate</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* --- Rewritten Lyrics Panel --- */}
                {rewrittenLyrics.length > 0 && (
                     <LyricsBlock
                        title="AI Rewritten Lyrics"
                        lyrics={rewrittenLyrics}
                        icon={<AiIcon />}
                        panelClass="hover:shadow-cyan-500/20"
                    />
                )}
            </div>

            {/* Global CSS for animations and background */}
            <style jsx global>{`
                @keyframes fade-in {
                  from { opacity: 0; transform: translateY(10px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                  animation: fade-in 0.5s ease-out forwards;
                  opacity: 0;
                }
                .bg-grid-pattern {
                    background-image:
                        linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
                    background-size: 40px 40px;
                }
            `}</style>
        </div>
    );
}

export default Lyrics;
