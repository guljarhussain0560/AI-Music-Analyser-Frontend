// src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Check if the user's authentication token exists in local storage
  const token = localStorage.getItem('authToken');

  // If there's a token, render the requested page (using <Outlet />).
  // If not, redirect the user to the /signin page.
  return token ? <Outlet /> : <Navigate to="/signin" replace />;
};

export default ProtectedRoute;