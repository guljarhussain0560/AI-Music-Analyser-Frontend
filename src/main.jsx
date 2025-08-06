import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';


// 2. Import your main stylesheet
import './index.css';
import App from './App.jsx';

// 3. Render the RouterProvider with your router
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
