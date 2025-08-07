// src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import your pages
import Home from './page/Home';
import SignIn from './auth/SignIn';
import SignUp from './auth/SignUp';
import HomeAfterLogin from './page/HomeAfterLogin'; // <-- Import this page
import Song from './page/Song'
import Lyrics from './page/Lyrics'; // <-- Import the Lyrics page
import MusicChatbot from './compoments/chatbot/MusicChatbot.jsx'; // <-- Import the chatbot component

// Import the guard component
import ProtectedRoute from './compoments/ProtectedRoute'; // <-- Import the guard

// Import the background
import MusicalParticleBackground from './design/Background';

export default function App() {
  return (
    <Router>
      {/* This div is likely for a top-level component that should always be visible */}
      <div className="max-w-7xl mx-auto">
        <MusicChatbot />
      </div>

      {/* UPDATED: Wrapped the background component to hide on mobile (hidden) and show on medium screens and up (md:block) */}
      <div className="hidden md:block">
        <MusicalParticleBackground />
      </div>
      
      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* --- PROTECTED ROUTES --- */}
        {/* All routes nested here will require a login */}
        <Route element={<ProtectedRoute />}>
          <Route path="/home-after-login" element={<HomeAfterLogin />} />
          <Route path="/song/:id" element={<Song />} />
          <Route path="/lyrics/:songId" element={<Lyrics />} />
          {/* You can add more protected routes here later */}
        </Route>

        {/* --- FALLBACK ROUTE --- */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}