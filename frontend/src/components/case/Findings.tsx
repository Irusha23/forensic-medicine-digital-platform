import React, { useEffect, useState } from 'react';
import api from '../../api/client';

export const Findings = ({ caseId }: { caseId: string }) => {
  const [findings, setFindings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [newFinding, setNewFinding] = useState({ phase: '', description: '' });

  const fetchFindings = async () => {
    try {
      const res = await api.get(`/cases/${caseId}/findings`);
      setFindings(res.data);
    } catch (err: any) {
      setError('Failed to fetch findings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFindings();
  }, [caseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post(`/cases/${caseId}/findings`, newFinding);
      setNewFinding({ phase: '', description: '' });
      fetchFindings();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save finding');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading findings...</div>;

  return (
    <div className="space-y-6">
      {error && <div className="text-red-600 bg-red-100 p-2">{error}</div>}
      
      <div className="bg-gray-50 border border-gray-300 p-4">
        <h3 className="font-bold mb-3">Record New Finding</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="block font-medium mb-1 text-sm">Phase</label>
              <input
                type="text"
                placeholder="e.g. EXTERNAL, INTERNAL"
                className="w-full border border-gray-300 p-2 text-sm"
                value={newFinding.phase}
                onChange={e => setNewFinding({ ...newFinding, phase: e.target.value })}
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block font-medium mb-1 text-sm">Description</label>
              <input
                type="text"
                className="w-full border border-gray-300 p-2 text-sm"
                value={newFinding.description}
                onChange={e => setNewFinding({ ...newFinding, description: e.target.value })}
                required
              />
            </div>
          </div>
          <button type="submit" disabled={saving} className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 text-sm">
            {saving ? 'Adding...' : 'Add Finding'}
          </button>
        </form>
      </div>

      <table className="w-full text-left border-collapse text-sm border border-gray-300">
        <thead>
          <tr className="bg-gray-100 border-b border-gray-300">
            <th className="p-2 border-r border-gray-300">Phase</th>
            <th className="p-2 border-r border-gray-300">Recorded At</th>
            <th className="p-2 border-r border-gray-300">Description</th>
            <th className="p-2">Recorded By</th>
          </tr>
        </thead>
        <tbody>
          {findings.length === 0 ? (
            <tr><td colSpan={4} className="p-4 text-center text-gray-500">No findings recorded.</td></tr>
          ) : (
            findings.map((f: any) => (
              <tr key={f.finding_id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="p-2 border-r border-gray-300 font-mono text-xs">{f.phase}</td>
                <td className="p-2 border-r border-gray-300">{new Date(f.recorded_at).toLocaleString()}</td>
                <td className="p-2 border-r border-gray-300">{f.description}</td>
                <td className="p-2">{f.users?.username || 'System'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
