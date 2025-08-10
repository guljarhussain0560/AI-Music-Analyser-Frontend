import React from 'react';
import { Link } from 'react-router-dom';
import Quotes from '../design/Quotes.jsx'; // Adjust the path if necessary


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

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white text-center p-4">
    <BrandLogo />
      <div className="max-w-3xl">
        <h1
          className="text-6xl md:text-8xl font-bold mb-4"
          style={{ textShadow: '0 4px 15px rgba(0,0,0,0.5)' }}
        >
          Music Analyser
        </h1>

        {/* UPDATED: Wrapped Quotes component to hide on mobile and show on medium screens and up */}
        <div >
          <Quotes />
        </div>
        <Link
          to="/signin"
          className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-bold py-4 px-10 rounded-full text-lg focus:outline-none focus:shadow-outline transition-all duration-300 transform hover:scale-110 shadow-2xl"
        >
          Get Started
        </Link>

        <p
          className="text-xl md:text-2xl font-light text-gray-300 mb-10 mt-8"
        >
          Analyze your music library like never before.
        </p>

      </div>
    </div>
  );
};

export default Home;
