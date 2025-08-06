import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import { User, Mail, Lock, Eye, EyeOff, LoaderCircle } from 'lucide-react';
// Make sure the path to your Background component is correct
import MusicalParticleBackground from '../design/Background.jsx';

import api from '../api/api.js';

// Get the Google Client ID from environment variables
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
// Placeholder for your brand logo.
const BrandLogo = () => (
    <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-4 border-2 border-white/30">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 6l12-3" />
        </svg>
    </div>
);

// Google Icon component
const GoogleIcon = () => (
    <svg className="w-6 h-6" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.223 0-9.641-3.657-11.303-8.591l-6.571 4.819C9.656 39.663 16.318 44 24 44z"></path>
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 35.245 44 30.028 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
    </svg>
);

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // State for loading indicator
  const navigate = useNavigate(); // Hook for navigation

  // This is where you call the API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !username || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true); // Start loading

    try {
      // Construct the payload for the API
      const payload = { name, email, username, password };

      // Make the POST request using your API instance
      const response = await api.post('/auth/signup', payload);

      // Handle success
      console.log('Signup successful:', response.data);
      // Redirect to sign-in page on success
      navigate('/signin');

    } catch (err) {
      // Handle errors from the API
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="relative min-h-screen w-full">
      <MusicalParticleBackground />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        
        <div className="text-center mb-8">
            <div className="flex justify-center">
                <BrandLogo />
            </div>
            <h1 className="text-5xl font-bold text-white mb-2" style={{textShadow: '0 2px 4px rgba(0,0,0,0.4)'}}>Music Analysic</h1>
            <p className="text-lg font-light text-gray-200">Join us to analyze your music like never before.</p>
        </div>

        <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8">
          <h2 className="text-3xl font-bold text-white text-center mb-6">Create Account</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4 relative">
              <User className="h-5 w-5 text-gray-300 absolute top-3.5 left-3" />
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" className="w-full pl-10 pr-3 py-3 bg-white/10 text-white placeholder-gray-300 border-2 border-transparent focus:border-purple-400 rounded-lg outline-none transition-all" />
            </div>
            
            <div className="mb-4 relative">
              <Mail className="h-5 w-5 text-gray-300 absolute top-3.5 left-3" />
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" className="w-full pl-10 pr-3 py-3 bg-white/10 text-white placeholder-gray-300 border-2 border-transparent focus:border-purple-400 rounded-lg outline-none transition-all" />
            </div>

            <div className="mb-4 relative">
              <User className="h-5 w-5 text-gray-300 absolute top-3.5 left-3" />
              <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="w-full pl-10 pr-3 py-3 bg-white/10 text-white placeholder-gray-300 border-2 border-transparent focus:border-purple-400 rounded-lg outline-none transition-all" />
            </div>

            <div className="mb-6 relative">
              <Lock className="h-5 w-5 text-gray-300 absolute top-3.5 left-3" />
              <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full pl-10 pr-10 py-3 bg-white/10 text-white placeholder-gray-300 border-2 border-transparent focus:border-purple-400 rounded-lg outline-none transition-all" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-3 right-3 text-gray-300 hover:text-white">
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            
            {error && <p className="text-red-400 text-sm text-center mb-4 bg-red-900/50 p-2 rounded-lg">{error}</p>}

            <div className="mb-4">
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? <LoaderCircle className="animate-spin mr-2" /> : null}
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </div>
            
            <div className="flex items-center my-6">
                <div className="flex-grow border-t border-white/20"></div>
                <span className="mx-4 text-gray-300 text-xs font-semibold">OR</span>
                <div className="flex-grow border-t border-white/20"></div>
            </div>

            <div className="mb-4">
                <button type="button" className="w-full flex justify-center items-center gap-3 bg-white/90 hover:bg-white text-gray-800 font-semibold py-2.5 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 shadow-lg">
                    <GoogleIcon />
                    Sign Up with Google
                </button>
            </div>

            <p className="text-center text-sm text-gray-300 mt-8">
              Already have an account? <a href="/signin" className="font-semibold text-purple-300 hover:text-white hover:underline">Sign In</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
