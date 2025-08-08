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
import MusicChatbot from './compoments/chatbot/MusicChatbot.jsx';


// Import the guard component
import ProtectedRoute from './compoments/ProtectedRoute'; // <-- Import the guard

// Import the background
import MusicalParticleBackground from './design/Background';

export default function App() {
  return (

    <Router>

      <MusicalParticleBackground />

      {/* <div>
        <MusicChatbot />
      </div> */}

      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* --- PROTECTED ROUTES --- */}
        <Route element={<ProtectedRoute />}>
          <Route path="/home-after-login" element={<HomeAfterLogin />} />
          <Route path="/song/:id" element={<Song />} />
          <Route path="/lyrics/:songId" element={<Lyrics />} />
        </Route>

        {/* --- FALLBACK ROUTE --- */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}