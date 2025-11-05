import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Landing from "./pages/landing/Landing.jsx";
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Browse from './pages/Browse.jsx';
import Messages from './pages/Messages.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Profile from './pages/Profile.jsx';
import CreateListing from './pages/CreateListing.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import ManageUsers from './pages/admin/ManageUsers.jsx';
import UserDetail from './pages/admin/UserDetail.jsx';
import ManageItems from './pages/admin/ManageItems.jsx';
import Complaints from './pages/admin/Complaints.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
    <BrowserRouter>
      {/* 🔹 Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {/* 🔹 Routes */}
      <Routes>
        {/* Layout will always include Header + Footer */}
        <Route path="/" element={<Layout />}>
          {/* Landing page (default / route) */}
          <Route index element={<Landing />} />

          {/* Auth pages */}
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="reset-password" element={<ResetPassword />} />

          {/* User dashboard & features */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="browse" element={<Browse />} />
          <Route path="create-listing" element={<CreateListing />} />
          <Route path="messages" element={<Messages />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="profile" element={<Profile />} />

          {/* Admin */}
          <Route path="admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="admin/users" element={
            <AdminRoute>
              <ManageUsers />
            </AdminRoute>
          } />
          <Route path="admin/users/:id" element={
            <AdminRoute>
              <UserDetail />
            </AdminRoute>
          } />
          <Route path="admin/items" element={
            <AdminRoute>
              <ManageItems />
            </AdminRoute>
          } />
          <Route path="admin/complaints" element={
            <AdminRoute>
              <Complaints />
            </AdminRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
