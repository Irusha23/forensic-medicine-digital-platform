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
        <nav className="flex-1 flex flex-col p-4 space-y-1 overflow-y-auto">
          <Link to="/" className="block p-2 hover:bg-gray-800 rounded">Cases</Link>
          
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">Subjects</div>
          <Link to="/patients" className="block p-2 hover:bg-gray-800 rounded pl-4 text-sm">All Patients & Subjects</Link>
          
          <RequireRole roles={['Admin', 'Doctor', 'Clerk']}>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">Users</div>
            <Link to="/users" className="block p-2 hover:bg-gray-800 rounded text-sm pl-4">All Users</Link>
            <Link to="/users?role=Admin" className="block p-2 hover:bg-gray-800 rounded text-sm pl-4">Admins</Link>
            <Link to="/users?role=JMO" className="block p-2 hover:bg-gray-800 rounded text-sm pl-4">JMOs</Link>
            <Link to="/users?role=Doctor" className="block p-2 hover:bg-gray-800 rounded text-sm pl-4">Doctors</Link>
            <Link to="/users?role=Clerk" className="block p-2 hover:bg-gray-800 rounded text-sm pl-4">Clerks</Link>
            <Link to="/users?role=Researcher" className="block p-2 hover:bg-gray-800 rounded text-sm pl-4">Researchers</Link>
            
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">Registries</div>
            <Link to="/police-stations" className="block p-2 hover:bg-gray-800 rounded">Police Stations</Link>
            <Link to="/courts" className="block p-2 hover:bg-gray-800 rounded">Courts</Link>
          </RequireRole>
          
          <RequireRole roles={['Admin']}>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">System</div>
            <Link to="/audit-logs" className="block p-2 hover:bg-gray-800 rounded">Global Audit Log</Link>
          </RequireRole>

          <div className="mt-auto pt-4">
            <button onClick={handleLogout} className="w-full text-left p-2 hover:bg-gray-800 rounded text-red-400">
              Logout
            </button>
          </div>
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
