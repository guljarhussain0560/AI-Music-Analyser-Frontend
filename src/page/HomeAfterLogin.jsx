import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Youtube, Music, Link, LoaderCircle, AlertTriangle, Upload } from 'lucide-react';

// Import your centralized API client
import api from '../api/api.js';
import Quotes from '../design/Quotes.jsx';
import UserProfilePage from '../auth/UserProfile.jsx';

const BrandLogo = () => (
    <div className="w-24 h-24 sm:w-32 sm:h-32 mb-4">
        <img
            src="/vite.png"
            alt="Brand Logo"
            className="w-full h-full object-cover rounded-full border-2 border-white/30"
            onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/96x96/7c3aed/ffffff?text=Logo";
            }}
        />
    </div>
);

const HomeAfterLogin = () => {
    const [url, setUrl] = useState('');
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setFileName(selectedFile.name);
            setUrl('');
        }
    };

    const handleUrlChange = (e) => {
        setUrl(e.target.value);
        if (file) {
            setFile(null);
            setFileName('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!file && !url.trim()) {
            setError('Please paste a URL or upload a file to analyze.');
            return;
        }

        setLoading(true);
        try {
            const currentUserId = localStorage.getItem("CurrentUserId");
            if (!currentUserId) {
                throw new Error("CurrentUserId not found in localStorage.");
            }

            let response;

            if (file) {
                console.log("Processing file upload...");
                const formData = new FormData();
                formData.append('audio_file', file);
                formData.append('user_id', currentUserId);

                response = await api.post('/process/process_audio_file', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

            } else {
                console.log("Processing URL...");
                response = await api.post('/process/process_url', { url, id: currentUserId });
            }

            console.log('API Response:', response.data);

            const songId = response.data.songs_id;
            const splitsId = response.data.splits_id;

            if (songId && splitsId) {
                navigate(`/song/${songId}`, { state: { splitsId: splitsId } });
            } else {
                setError("Could not get valid IDs from the server's response.");
            }

        } catch (err) {
            const errorMessage = err.response?.data?.detail || err.message || 'Failed to process the request. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        // --- FIX: Adjusted padding and main flex direction for mobile ---
        <div className="relative flex flex-col items-center justify-center min-h-screen text-white p-4 sm:p-6">
            <div className="absolute top-4 right-4 z-10">
                <UserProfilePage />
            </div>

            <br /><br /><br />

            {/* --- FIX: Adjusted max-width and text alignment for responsiveness --- */}
            <div className="w-full max-w-lg md:max-w-2xl text-center flex flex-col items-center mb-10">
                <BrandLogo />
                
                {/* --- FIX: Responsive font size and margin --- */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-8" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                    Analyze a New Song
                </h1>

                <form onSubmit={handleSubmit} className="w-full">
                    {/* URL Input */}
                    <div className="relative mb-4">
                        <Link size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            value={url}
                            onChange={handleUrlChange}
                            placeholder="Paste a URL..."
                            // --- FIX: Responsive padding and text size ---
                            className="w-full pl-12 pr-4 py-3 sm:py-4 bg-gray-800 border-2 border-gray-700 rounded-full text-base sm:text-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                            disabled={loading}
                        />
                    </div>

                    {/* Divider */}
                    <div className="flex items-center my-4">
                        <div className="flex-grow border-t border-gray-700"></div>
                        <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
                        <div className="flex-grow border-t border-gray-700"></div>
                    </div>

                    {/* File Upload Input */}
                    <div className="relative mb-6">
                        <label
                            htmlFor="audio-upload"
                            // --- FIX: Responsive padding and text size ---
                            className={`flex items-center justify-center w-full px-4 py-3 sm:py-4 bg-gray-800 border-2 border-dashed border-gray-700 rounded-full text-base sm:text-lg text-gray-500 cursor-pointer hover:bg-gray-700 hover:border-purple-500 transition-colors truncate ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Upload size={20} className="mr-2 flex-shrink-0" />
                            <span className="truncate">{fileName || 'Upload an audio file'}</span>
                        </label>
                        <input
                            id="audio-upload"
                            type="file"
                            accept="audio/*"
                            onChange={handleFileChange}
                            className="hidden"
                            disabled={loading}
                        />
                    </div>

                    {error && (
                        <div className="mt-4 flex items-center justify-center text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">
                            <AlertTriangle size={20} className="mr-2 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* --- FIX: Removed <br> tags and adjusted margin --- */}
                    <div className="mt-6">
                        <button
                            type="submit"
                            // --- FIX: Button is full-width on mobile and auto-width on desktop ---
                            className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-bold py-3 px-8 sm:py-4 sm:px-12 rounded-full text-lg focus:outline-none focus:shadow-outline transition-all duration-300 transform hover:scale-105 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-full md:w-auto mx-auto"
                            disabled={loading || (!file && !url.trim())}
                        >
                            {loading ? <LoaderCircle size={28} className="animate-spin" /> : 'Analyze Song'}
                        </button>
                    </div>
                </form>
                
                {/* --- FIX: Adjusted margin for better spacing on all screens --- */}
                <div className="mt-12 w-full">
                    <Quotes />
                </div>
            </div>
        </div>
    );
};

export default HomeAfterLogin;
