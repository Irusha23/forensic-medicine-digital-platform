import React, { useEffect, useState } from 'react';
import api from '../../api/client';

export const AuditTrail = ({ caseId }: { caseId: string }) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    try {
      const res = await api.get(`/cases/${caseId}/audit`);
      setLogs(res.data);
    } catch (err: any) {
      setError('Failed to fetch audit trail');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [caseId]);

  const renderPayload = (payload: any, action: string) => {
    if (!payload) return <span className="text-gray-400 italic">No details provided</span>;

    if (action === 'CASE_STATUS_TRANSITION') {
      return (
        <div>
          <div><span className="font-semibold">Reason:</span> {payload.transition_reason || '-'}</div>
          <div><span className="font-semibold">Old Status ID:</span> {payload.old_status_id || 'None'}</div>
          <div><span className="font-semibold">New Status ID:</span> {payload.new_status_id}</div>
        </div>
      );
    }

    // Generic JSON render
    return (
      <pre className="whitespace-pre-wrap text-xs text-gray-700 font-mono bg-gray-100 p-1 rounded">
        {JSON.stringify(payload, null, 2)}
      </pre>
    );
  };

  if (loading) return <div>Loading audit trail...</div>;

  return (
    <div className="space-y-4">
      {error && <div className="text-red-600 bg-red-100 p-2">{error}</div>}
      
      <table className="w-full text-left border-collapse text-sm border border-gray-300 shadow-sm">
        <thead>
          <tr className="bg-gray-800 text-white border-b border-gray-900">
            <th className="p-3 border-r border-gray-700">Timestamp</th>
            <th className="p-3 border-r border-gray-700">Action</th>
            <th className="p-3 border-r border-gray-700">User</th>
            <th className="p-3">Changes / Payload</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr><td colSpan={4} className="p-4 text-center text-gray-500">No audit logs found.</td></tr>
          ) : (
            logs.map((log: any) => (
              <tr key={log.log_id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="p-3 border-r border-gray-300 font-medium text-gray-600 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="p-3 border-r border-gray-300">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                    {log.action}
                  </span>
                </td>
                <td className="p-3 border-r border-gray-300 font-medium">
                  {log.users?.username || 'System'}
                </td>
                <td className="p-3 text-xs">
                  {renderPayload(log.payload, log.action)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
