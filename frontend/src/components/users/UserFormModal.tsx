import React, { useState } from 'react';
import api from '../../api/client';

interface UserFormModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const UserFormModal = ({ onClose, onSuccess }: UserFormModalProps) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [designation, setDesignation] = useState('');
  const [roles, setRoles] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/users', {
        username,
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        designation,
        roles
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = (role: string) => {
    if (roles.includes(role)) {
      setRoles(roles.filter(r => r !== role));
    } else {
      setRoles([...roles, role]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Add New Staff</h2>
        {error && <div className="text-red-600 bg-red-100 p-2 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="username" className="block text-gray-700 font-semibold mb-1">Username</label>
              <input id="username" type="text" value={username} onChange={e => setUsername(e.target.value)} required className="w-full p-2 border rounded" />
            </div>
            <div>
              <label htmlFor="email" className="block text-gray-700 font-semibold mb-1">Email</label>
              <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-2 border rounded" />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 font-semibold mb-1">Password</label>
            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="min 8 chars" className="w-full p-2 border rounded" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-gray-700 font-semibold mb-1">First Name</label>
              <input id="firstName" type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-gray-700 font-semibold mb-1">Last Name</label>
              <input id="lastName" type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full p-2 border rounded" />
            </div>
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Designation</label>
            <input type="text" value={designation} onChange={e => setDesignation(e.target.value)} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Roles</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-1">
                <input type="checkbox" checked={roles.includes('Clerk')} onChange={() => handleRoleToggle('Clerk')} /> Clerk
              </label>
              <label className="flex items-center gap-1">
                <input type="checkbox" checked={roles.includes('Doctor')} onChange={() => handleRoleToggle('Doctor')} /> Doctor
              </label>
              <label className="flex items-center gap-1">
                <input type="checkbox" checked={roles.includes('Admin')} onChange={() => handleRoleToggle('Admin')} /> Admin
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Saving...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
