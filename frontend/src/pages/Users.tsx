import { useEffect, useState } from 'react';
import api from '../api/client';
import { UserFormModal } from '../components/users/UserFormModal';

import { RequireRole } from '../components/layout/RequireRole';

import { useAuth } from '../context/AuthContext';

export const Users = () => {
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('Admin');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/users/${userId}/status`, { is_active: !currentStatus });
      fetchUsers();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management Portal</h1>
        <RequireRole roles={['Admin']}>
          <button 
            onClick={() => setShowModal(true)} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Add New Staff
          </button>
        </RequireRole>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      <div className="bg-white border rounded shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-3 font-semibold text-gray-700">Username</th>
              <th className="p-3 font-semibold text-gray-700">Name</th>
              <th className="p-3 font-semibold text-gray-700">Roles</th>
              <th className="p-3 font-semibold text-gray-700">Status</th>
              {isAdmin && <th className="p-3 font-semibold text-gray-700 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="p-4 text-center">No users found.</td></tr>
            ) : (
              users.map(u => (
                <tr key={u.user_id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <div className="font-medium text-blue-700">{u.username}</div>
                    <div className="text-xs text-gray-500">{u.email}</div>
                  </td>
                  <td className="p-3">
                    <div>{u.first_name} {u.last_name}</div>
                    <div className="text-xs text-gray-500">{u.designation}</div>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1 flex-wrap">
                      {u.roles.map((r: string) => (
                        <span key={r} className="px-2 py-0.5 bg-gray-200 text-gray-800 text-xs rounded-full">
                          {r}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3">
                    {u.is_active ? (
                      <span className="text-green-600 font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span> Active
                      </span>
                    ) : (
                      <span className="text-red-600 font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 bg-red-500 rounded-full inline-block"></span> Inactive
                      </span>
                    )}
                  </td>
                  {isAdmin && (
                    <td className="p-3 text-right">
                      <button 
                        onClick={() => toggleStatus(u.user_id, u.is_active)}
                        className={`text-xs px-2 py-1 border rounded ${u.is_active ? 'border-red-300 text-red-600 hover:bg-red-50' : 'border-green-300 text-green-600 hover:bg-green-50'}`}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <UserFormModal 
          onClose={() => setShowModal(false)} 
          onSuccess={fetchUsers} 
        />
      )}
    </div>
  );
};
