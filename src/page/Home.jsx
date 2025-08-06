import React from 'react';
import { Link } from 'react-router-dom';
import Quotes from '../design/Quotes.jsx'; // Adjust the path if necessary

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white text-center p-4">
      {/* The MusicalParticleBackground component has been removed from here
          because it is already being rendered by the main App.jsx layout. */}
      <div className="max-w-3xl">
        <h1 
          className="text-6xl md:text-8xl font-bold mb-4"
          style={{textShadow: '0 4px 15px rgba(0,0,0,0.5)'}}
        >
          Music Analyser
        </h1>
        <Quotes />
        <p 
          className="text-xl md:text-2xl font-light text-gray-300 mb-10"
        >
          Unlock the stories hidden in your sound. Analyze your music library like never before.
        </p>
        <Link
          to="/signin"
          className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-bold py-4 px-10 rounded-full text-lg focus:outline-none focus:shadow-outline transition-all duration-300 transform hover:scale-110 shadow-2xl"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
};

export default Home;
