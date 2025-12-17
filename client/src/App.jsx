import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; 
import './App.css';

// Import Pages
import Login from './pages/auth/Login'; 
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageBooks from './pages/admin/ManageBooks';
import UserDashboard from './pages/user/UserDashboard';
import Home from './pages/user/Home';
import ManageUsers from './pages/admin/ManageUsers';
import ManageTrending from './pages/admin/ManageTrending';
import BookDetails from './pages/user/BookDetails';
import BookReader from './pages/user/BookReader'; 
import Profile from './pages/user/Profile';

// Import Layouts
import DashboardLayout from './components/layouts/DashboardLayout';

function App() {
  return (
    <Router>
      {/* Activates the popup notifications globally */}
      <Toaster position="top-center" />

      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        {/* === AUTH PAGES (Full Screen Split Layouts) === */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* === STANDALONE READER (Full Screen - No Sidebar) === */}
        {/* This MUST be outside DashboardLayout to work correctly */}
        <Route path="/dashboard/read/:id" element={<BookReader />} /> 

        {/* === USER DASHBOARD ROUTES (With Sidebar) === */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<UserDashboard />} />
          <Route path="home" element={<Home />} />
          <Route path="book/:id" element={<BookDetails />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* === ADMIN DASHBOARD ROUTES (With Sidebar) === */}
        <Route path="/admin" element={<DashboardLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="books" element={<ManageBooks />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="manage-trending" element={<ManageTrending />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;