import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

import { SearchableSelect } from '../components/common/SearchableSelect';

// Define static options for common actions and entities
const ACTION_OPTIONS = [
  { label: 'LOGIN', value: 'LOGIN' },
  { label: 'CREATE_CASES', value: 'CREATE_CASES' },
  { label: 'UPDATE_CASES', value: 'UPDATE_CASES' },
  { label: 'CREATE_MEDIA', value: 'CREATE_MEDIA' },
  { label: 'CREATE_SUBJECTS', value: 'CREATE_SUBJECTS' },
  { label: 'CREATE_COURT_EVENTS', value: 'CREATE_COURT_EVENTS' },
  { label: 'CREATE_AUTHORIZATIONS', value: 'CREATE_AUTHORIZATIONS' }
];

const ENTITY_OPTIONS = [
  { label: 'case', value: 'case' },
  { label: 'login', value: 'login' },
  { label: 'users', value: 'users' },
  { label: 'police_station', value: 'police_station' },
  { label: 'courts', value: 'courts' }
];

export const GlobalAuditLog = () => {
  const { user } = useAuth();
  
  if (!user?.roles?.includes('Admin')) {
    return <Navigate to="/" />;
  }

  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [userId, setUserId] = useState('');
  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>({ totalPages: 1, total: 0 });

  const fetchUsers = async (query: string) => {
    const res = await api.get('/users');
    const filtered = res.data.filter((u: any) => 
      u.username.toLowerCase().includes(query.toLowerCase()) || 
      u.user_id.toString().includes(query)
    );
    return filtered.map((u: any) => ({
      label: `${u.username} (ID: ${u.user_id})`,
      value: u.user_id.toString()
    }));
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      if (userId) params.append('userId', userId);
      if (action) params.append('action', action);
      if (entityType) params.append('entityType', entityType);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await api.get(`/dashboard/audit-logs?${params.toString()}`);
      setLogs(res.data.data);
      setMeta(res.data.meta);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (page === 1) {
      fetchLogs();
    } else {
      setPage(1);
    }
  };

  const handleClear = () => {
    setUserId('');
    setAction('');
    setEntityType('');
    setStartDate('');
    setEndDate('');
    if (page === 1) {
      setTimeout(fetchLogs, 0);
    } else {
      setPage(1);
    }
  };

  const renderPayload = (payload: any) => {
    if (!payload) return <span className="text-gray-400 italic">No details</span>;
    return (
      <details className="cursor-pointer text-blue-600 hover:text-blue-800">
        <summary className="text-xs font-semibold">View Payload</summary>
        <pre className="whitespace-pre-wrap text-xs text-gray-700 font-mono bg-gray-100 p-2 mt-2 rounded border cursor-text overflow-auto max-h-32">
          {JSON.stringify(payload, null, 2)}
        </pre>
      </details>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">System Audit Log</h1>
      </div>

      <div className="bg-white p-4 border rounded shadow-sm overflow-visible z-10 relative">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px] relative z-30">
            <label className="block text-sm font-medium mb-1">User ID</label>
            <SearchableSelect 
              value={userId} 
              onChange={setUserId} 
              fetchOptions={fetchUsers} 
              placeholder="Search user by name or ID..."
            />
          </div>
          <div className="flex-1 min-w-[200px] relative z-20">
            <label className="block text-sm font-medium mb-1">Action</label>
            <SearchableSelect 
              value={action} 
              onChange={setAction} 
              options={ACTION_OPTIONS} 
              placeholder="Search action type..."
            />
          </div>
          <div className="flex-1 min-w-[200px] relative z-10">
            <label className="block text-sm font-medium mb-1">Entity Type</label>
            <SearchableSelect 
              value={entityType} 
              onChange={setEntityType} 
              options={ENTITY_OPTIONS} 
              placeholder="Search entity type..."
            />
          </div>
          <div className="flex-[2] min-w-[300px]">
            <label className="block text-sm font-medium mb-1">Date Range</label>
            <div className="flex space-x-2">
              <input type="date" className="w-full border p-2 rounded text-sm" value={startDate} onChange={e => setStartDate(e.target.value)} />
              <input type="date" className="w-full border p-2 rounded text-sm" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="flex space-x-2 w-full md:w-auto">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-medium whitespace-nowrap">Search</button>
            <button type="button" onClick={handleClear} className="bg-gray-200 text-gray-800 px-6 py-2 rounded hover:bg-gray-300 font-medium whitespace-nowrap">Clear</button>
          </div>
        </form>
      </div>

      {error && <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>}

      <div className="bg-white border rounded shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-800 text-white border-b border-gray-900">
              <tr>
                <th className="p-3 border-r border-gray-700">Timestamp</th>
                <th className="p-3 border-r border-gray-700">Action</th>
                <th className="p-3 border-r border-gray-700">User</th>
                <th className="p-3 border-r border-gray-700">Entity</th>
                <th className="p-3 border-r border-gray-700">Entity ID</th>
                <th className="p-3">Payload</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading audit logs...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No logs found matching criteria.</td></tr>
              ) : (
                logs.map(log => (
                  <tr key={log.log_id} className="border-b hover:bg-gray-50">
                    <td className="p-3 border-r border-gray-200 font-mono text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="p-3 border-r border-gray-200"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">{log.action}</span></td>
                    <td className="p-3 border-r border-gray-200">
                      {log.users ? `${log.users.username} (ID: ${log.user_id})` : 'System'}
                    </td>
                    <td className="p-3 border-r border-gray-200 font-medium text-gray-600">{log.entity_type || '-'}</td>
                    <td className="p-3 border-r border-gray-200 font-mono text-xs">{log.entity_id || '-'}</td>
                    <td className="p-3 min-w-[300px]">
                      {renderPayload(log.payload)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {!loading && meta.totalPages > 1 && (
          <div className="p-4 border-t flex justify-between items-center bg-gray-50">
            <span className="text-sm text-gray-600">Showing page {page} of {meta.totalPages} ({meta.total} total logs)</span>
            <div className="space-x-2">
              <button 
                disabled={page === 1} 
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 border rounded bg-white hover:bg-gray-100 disabled:opacity-50"
              >
                Previous
              </button>
              <button 
                disabled={page === meta.totalPages} 
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 border rounded bg-white hover:bg-gray-100 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
