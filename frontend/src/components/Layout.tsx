import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NotificationBell } from './layout/NotificationBell';
import { RequireRole } from './layout/RequireRole';

export const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 text-xl font-bold border-b border-gray-700">
          {user?.username ? `Welcome, ${user.username}` : 'FMDP Admin'}
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/" className="block p-2 hover:bg-gray-800 rounded mb-4">Cases</Link>
          <RequireRole roles={['Admin', 'Doctor', 'Clerk']}>
            <Link to="/users" className="block p-2 hover:bg-gray-800 rounded mb-4">Users (Staff & Doctors)</Link>
            <Link to="/police-stations" className="block p-2 hover:bg-gray-800 rounded mb-4">Police Stations</Link>
            <Link to="/courts" className="block p-2 hover:bg-gray-800 rounded mb-4">Courts</Link>
          </RequireRole>
          <button onClick={handleLogout} className="w-full text-left p-2 hover:bg-gray-800 rounded mt-auto text-red-400">
            Logout
          </button>
        </nav>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-end px-6">
          <NotificationBell />
        </header>
        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
