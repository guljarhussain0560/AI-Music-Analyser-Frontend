import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

// Make sure the path to your Background component is correct
import MusicalParticleBackground from '../design/Background.jsx';
// Import your centralized API client
import api, { fetchCurrentUser } from '../api/api.js'; // Adjust the path if necessary

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

// Main component logic
function SignInComponent() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      // The backend expects a JSON object, not FormData
      const payload = { username, password };

      const response = await api.post('/auth/signin', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('SignIn Response:', response.data);

      const token = response.data.access_token;
      if (token) {
        localStorage.setItem('authToken', token);
        console.log('Login successful, token stored:', token);
        const currentUser = await fetchCurrentUser();
        console.log('Current User:', currentUser);
        navigate('/home-after-login'); // Redirect on success
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'An unexpected error occurred.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handler for successful Google login
  const handleGoogleSuccess = async (tokenResponse) => {
    setLoading(true);
    setError('');
    try {
      // Send the credential (ID token) to the backend
      const response = await api.post('/auth/google', {
        credential: tokenResponse.credential,
      });
      console.log('SignIn Response:', response.data);


      const token = response.data.access_token;
      console.log('Google Login Response:', response.data);
      if (token) {
        localStorage.setItem('authToken', token);
        console.log('Google login successful, token stored:', token);
        const currentUser = await fetchCurrentUser();
        console.log('Current User:', currentUser);
        navigate('/home-after-login'); // Redirect on success
      } else {
        setError('Google login failed. Please try again.');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'An unexpected error occurred during Google sign-in.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = (error) => {
    console.error('Google Login Failed:', error);
    setError('Google login failed. Please try again.');
  };

  return (
    <div className="relative min-h-screen w-full">
      <MusicalParticleBackground />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">

        <div className="text-center mb-8">
          <div className="flex justify-center">
            <BrandLogo />
          </div>
          <h1 className="text-5xl font-bold text-white mb-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}>Welcome Back</h1>
          <p className="text-lg font-light text-gray-200">Sign in to discover new insights in your music.</p>
        </div>

        <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8">
          <h2 className="text-3xl font-bold text-white text-center mb-6">Sign In</h2>

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
                {loading ? <LoaderCircle className="animate-spin mr-2" /> : null}
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>

            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-white/20"></div>
              <span className="mx-4 text-gray-300 text-xs font-semibold">OR</span>
              <div className="flex-grow border-t border-white/20"></div>
            </div>

            <div className="mb-4 text-center flex justify-center">
              <GoogleLogin

                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="transparent"
                size="large"
                text="continue_with"
                shape="round"
                width="390px"
              />
            </div>

            <p className="text-center text-sm text-gray-300 mt-8">
              Don't have an account? <a href="/signup" className="font-semibold text-purple-300 hover:text-white hover:underline">Sign Up</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

// Wrap the component with GoogleOAuthProvider
export default function SignIn() {
  if (!GOOGLE_CLIENT_ID) {
    console.error("Missing Google Client ID. Please set VITE_GOOGLE_CLIENT_ID in your .env file.");
    return <div>Google Client ID is not configured.</div>;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <SignInComponent />
    </GoogleOAuthProvider>
  );
}
