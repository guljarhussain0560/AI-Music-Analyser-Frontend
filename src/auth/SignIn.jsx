import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

// Import your centralized API client
import api, { fetchCurrentUser } from '../api/api.js'; // Adjust the path if necessary

// Get the Google Client ID from environment variables
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// --- ICONS (Unchanged) ---
const BrandLogo = () => (
  <div className="w-34 h-34 mb-9">
    <img 
      src="./vite.png" 
      alt="Brand Logo" 
      className="w-full h-full object-cover rounded-full border-2 border-white/30"
      onError={(e) => {
          e.target.onerror = null; 
          e.target.src = "https://placehold.co/96x96/7c3aed/ffffff?text=Logo";
      }}
    />
  </div>
);


// Main component logic
function SignInComponent() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Centralized error parsing function
  const parseAndSetError = (err) => {
    let errorMessage = 'An unexpected error occurred. Please try again.';
    if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (Array.isArray(detail)) {
            errorMessage = detail.map(d => d.msg || JSON.stringify(d)).join('. ');
        } else if (typeof detail === 'string') {
            errorMessage = detail;
        }
    } else if (err.message) {
        errorMessage = err.message;
    }
    setError(errorMessage);
  };

  // Handler for standard username/password form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }
    setLoading(true);
    try {
      const payload = { username, password };
      const response = await api.post('/auth/signin', payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      const token = response.data.access_token;
      if (token) {
        localStorage.setItem('authToken', token);
        await fetchCurrentUser();
        navigate('/home-after-login');
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      parseAndSetError(err);
    } finally {
      setLoading(false);
    }
  };

  // Handler for successful Google login
  const handleGoogleSuccess = async (tokenResponse) => {
    setLoading(true);
    setError('');
    try {
      // --- FIX: Send the credential (ID token) to the backend ---
      // This now matches what your backend code expects.
      const response = await api.post('/auth/google', {
        credential: tokenResponse.credential,
      });
      const token = response.data.access_token;
      if (token) {
        localStorage.setItem('authToken', token);
        await fetchCurrentUser();
        navigate('/home-after-login');
      } else {
        setError('Google login failed. Please try again.');
      }
    } catch (err) {
        parseAndSetError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    // The library's onError is often not detailed. We'll just set a generic message.
    console.error('Google Login Failed');
    setError('Google login failed. Please try again.');
  };

  return (
    // The main container centers a single column of content on all screen sizes.
    <div className="relative z-10 flex min-h-screen w-full items-center justify-center p-4">
      
      {/* This inner container handles the single-column layout */}
      <div className="flex w-full max-w-md flex-col items-center justify-center text-center">
        
        {/* Welcome Message & Logo (Now visible on all screen sizes) */}
        <div className="w-full flex flex-col items-center justify-center mb-8">
            <BrandLogo />
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}>
                Welcome Back
            </h1>
            <p className="text-md lg:text-lg font-light text-gray-200 max-w-sm">
                Sign in to continue your musical journey.
            </p>
        </div>

        {/* Sign-In Form container */}
        <div className="w-full">
            <div className=" backdrop-blur-sm rounded-2xl shadow-2xl border border-white/50 p-8">
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4 relative">
                        <Mail className="h-5 w-5 text-gray-300 absolute top-3.5 left-3" />
                        <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="w-full pl-10 pr-3 py-3 bg-white/10 text-white placeholder-gray-300 border-2 border-transparent focus:border-purple-400 rounded-lg outline-none transition-all" />
                    </div>

                    <div className="mb-4 relative">
                        <Lock className="h-5 w-5 text-gray-300 absolute top-3.5 left-3" />
                        <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full pl-10 pr-10 py-3 bg-white/10 text-white placeholder-gray-300 border-2 border-transparent focus:border-purple-400 rounded-lg outline-none transition-all" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-3 right-3 text-gray-300 hover:text-white">
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>

                    <div className="text-right mb-6">
                        <a href="#" className="text-sm text-purple-300 hover:text-white hover:underline">Forgot Password?</a>
                    </div>

                    {error && <p className="text-red-400 text-sm text-center mb-4 bg-red-900/50 p-2 rounded-lg">{error}</p>}

                    <div className="mb-4">
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading && !error ? <LoaderCircle className="animate-spin mr-2" /> : null}
                            {loading && !error ? 'Signing In...' : 'Sign In'}
                        </button>
                    </div>

                    <div className="flex items-center my-6">
                        <div className="flex-grow border-t border-white/20"></div>
                        <span className="mx-4 text-gray-300 text-xs font-semibold">OR</span>
                        <div className="flex-grow border-t border-white/20"></div>
                    </div>
                    
                    {/* --- FIX: Use the <GoogleLogin> component for custom rendering --- */}
                    <div className="mb-4 flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            type="standard"
                            theme="outline"
                            size="large"
                            text="continue_with"
                            shape="rectangular"

                            logo_alignment="left"
                        />
                    </div>

                    <p className="text-center text-sm text-gray-300 mt-8">
                        Don't have an account? <a href="/signup" className="font-semibold text-purple-300 hover:text-white hover:underline">Sign Up</a>
                    </p>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
}

// Wrap the component with GoogleOAuthProvider (Unchanged)
export default function SignIn() {
  if (!GOOGLE_CLIENT_ID) {
    console.error("Missing Google Client ID. Please set VITE_GOOGLE_CLIENT_ID in your .env file.");
    return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">Google Client ID is not configured.</div>;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <SignInComponent />
    </GoogleOAuthProvider>
  );
}
