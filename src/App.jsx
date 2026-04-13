import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './views/Login';
import ResetPassword from './views/ResetPassword';
import Dashboard from './views/Dashboard';
import CreateTask from './views/CreateTask';
import TaskDetail from './views/TaskDetail';
import Departments from './views/Departments';
import DelegationHistory from './views/DelegationHistory';
import Settings from './views/Settings';
import Profile from './views/Profile';

// Helper component to check auth
const RequireAuth = ({ children }) => {
  const user = sessionStorage.getItem('iwogate_user');
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/create" element={<RequireAuth><CreateTask /></RequireAuth>} />
        <Route path="/history" element={<RequireAuth><DelegationHistory /></RequireAuth>} />
        <Route path="/task/:id" element={<RequireAuth><TaskDetail /></RequireAuth>} />
        <Route path="/departments" element={<RequireAuth><Departments /></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
