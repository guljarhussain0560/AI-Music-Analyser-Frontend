import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, LoaderCircle } from 'lucide-react';
// --- FIX: Import GoogleLogin instead of useGoogleLogin ---
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

// Import your centralized API client and other necessary functions
import api, { fetchCurrentUser } from '../api/api.js';

// Get the Google Client ID from environment variables
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// --- COMPONENTS (Unchanged) ---
const BrandLogo = () => (
  <div className="w-34 h-34 mb-9">
    <img
      src="/vite.png" // Using a relative path from the public folder
      alt="Brand Logo"
      className="w-full h-full object-cover rounded-full border-2 border-white/30"
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = "https://placehold.co/96x96/7c3aed/ffffff?text=Logo";
      }}
    />
  </div>
);



// --- Main SignUp Component Logic ---
function SignUpComponent() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Centralized error parsing function (Unchanged)
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

  // Handler for successful Google login/signup
  const handleGoogleSuccess = async (tokenResponse) => {
    setLoading(true);
    setError('');
    try {
      // This sends the credential (ID token) from Google to your backend.
      // This should match the backend expecting `token.credential`.
      const response = await api.post('/auth/google', {
        credential: tokenResponse.credential,
      });
      const token = response.data.access_token;
      if (token) {
        localStorage.setItem('authToken', token);
        await fetchCurrentUser();
        navigate('/home-after-login'); // Redirect to home on success
      } else {
        setError('Google sign-up failed. Please try again.');
      }
    } catch (err) {
      parseAndSetError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error('Google Login Failed');
    setError('Google sign-up failed. Please try again.');
  };

  // Handler for the manual sign-up form (Unchanged)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !username || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const payload = { name, email, username, password };
      const response = await api.post('/auth/signup', payload);
      console.log('Signup successful:', response.data);
      navigate('/signin');
    } catch (err) {
      parseAndSetError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">

      <div className="text-center mb-8">
        <div className="flex justify-center">
          <BrandLogo />
        </div>
        <h1 className="text-5xl font-bold text-white mb-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}>Music Analysic</h1>
        <p className="text-lg font-light text-gray-200">Join us to analyze your music like never before.</p>
      </div>

      <div className="w-full max-w-md backdrop-blur-sm rounded-2xl shadow-2xl border border-white/50 p-8">
        <h2 className="text-3xl font-bold text-white text-center mb-6">Create Account</h2>

        <form onSubmit={handleSubmit}>
          {/* Manual sign-up fields (Unchanged) */}
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

          {/* --- FIX: Use the GoogleLogin component directly --- */}
          <div className="mb-4 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              type="icon"
              theme="outline"
              size="large"
              text="continue_with"
              shape="rectangular"
            
              logo_alignment="left"
            />
          </div>

          <p className="text-center text-sm text-gray-300 mt-8">
            Already have an account? <a href="/signin" className="font-semibold text-purple-300 hover:text-white hover:underline">Sign In</a>
          </p>
        </form>
      </div>
    </div>
  );
}

// Wrap the export with GoogleOAuthProvider (Unchanged)
export default function SignUp() {
  if (!GOOGLE_CLIENT_ID) {
    console.error("Missing Google Client ID. Please set VITE_GOOGLE_CLIENT_ID in your .env file.");
    return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">Google Client ID is not configured.</div>;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <SignUpComponent />
    </GoogleOAuthProvider>
  );
}
