import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Youtube, Music, Link, LoaderCircle, AlertTriangle } from 'lucide-react';

// Import your centralized API client
import api from '../api/api.js';
import Quotes from '../design/Quotes.jsx';
import UserProfilePage from '../auth/UserProfile.jsx';
import MusicChatbot from '../compoments/chatbot/MusicChatbot.jsx';


const HomeAfterLogin = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('Please paste a URL to analyze.');
      return;
    }

    setLoading(true);
    try {
      // Now using the real API instance
      const currentUserId = localStorage.getItem("CurrentUserId");
      if (!currentUserId) {
        throw new Error("CurrentUserId not found in localStorage.");
      }
      const response = await api.post('/process/process_url', { url, id: currentUserId });

      console.log('API Response:', response.data);

      const songId = response.data.songs_id;
      const splitsId = response.data.splits_id;

      // Check for both IDs now
      if (songId && splitsId) {

        // This is the missing part: pass splitsId in the navigation state
        navigate(`/song/${songId}`, { state: { splitsId: splitsId } });

      } else {
        setError("Could not get valid IDs from the server's response.");
      }

    } catch (err) {
      // Handle potential errors from the real API
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to process the URL. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  
  return (
    // 1. Add 'relative' to the main container to create a positioning context
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <MusicChatbot />

      {/* 2. Wrap UserProfilePage in a div with absolute positioning */}
      <div className="absolute top-4 right-4 z-10">
        <UserProfilePage />
      </div>

      <div className="w-full max-w-2xl text-center">
        <div className="flex justify-center items-center gap-4 mb-4">
          <Youtube size={48} className="text-red-500" />
          <Music size={48} className="text-green-500" />
        </div>
        <h1
          className="text-5xl md:text-6xl font-bold mb-3"
          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
        >
          Analyze a New Song
        </h1>
        <p className="text-lg text-gray-400 mb-10">
          Paste a YouTube link below to get a deep-dive analysis.
        </p>

        <form onSubmit={handleSubmit} className="w-full">
          <div className="relative">
            <Link size={24} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full pl-14 pr-4 py-4 bg-gray-800 border-2 border-gray-700 rounded-full text-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="mt-4 flex items-center justify-center text-red-400 bg-red-900/50 p-3 rounded-lg">
              <AlertTriangle size={20} className="mr-2" />
              <span>{error}</span>
            </div>
          )}

          <div className="mt-6">
            <button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-bold py-4 px-12 rounded-full text-lg focus:outline-none focus:shadow-outline transition-all duration-300 transform hover:scale-105 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-full md:w-auto mx-auto"
              disabled={loading}
            >
              {loading ? <LoaderCircle size={28} className="animate-spin" /> : 'Analyze Song'}
            </button>
          </div>
        </form>
        <div className="mt-10">
          <Quotes />
        </div>
      </div>
    </div>
  );
};

export default HomeAfterLogin;