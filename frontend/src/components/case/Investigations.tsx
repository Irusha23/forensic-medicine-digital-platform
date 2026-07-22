import React, { useEffect, useState } from 'react';
import api from '../../api/client';

export const Investigations = ({ caseId }: { caseId: string }) => {
  const [investigations, setInvestigations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [newInv, setNewInv] = useState({ 
    investigation_type: '', 
    status: 'PENDING',
    requested_date: '',
    completed_date: '',
    laboratory_name: '',
    sample_details: ''
  });

  const fetchInvestigations = async () => {
    try {
      const res = await api.get(`/cases/${caseId}/investigations`);
      setInvestigations(res.data);
    } catch (err: any) {
      setError('Failed to fetch investigations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestigations();
  }, [caseId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post(`/cases/${caseId}/investigations`, {
        ...newInv,
        requested_date: newInv.requested_date || null,
        completed_date: newInv.completed_date || null
      });
      setNewInv({ investigation_type: '', status: 'PENDING', requested_date: '', completed_date: '', laboratory_name: '', sample_details: '' });
      fetchInvestigations();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create investigation');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (invId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post(`/investigations/${invId}/media/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('File uploaded successfully');
      fetchInvestigations();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Upload failed');
    }
  };

  if (loading) return <div>Loading investigations...</div>;

  return (
    <div className="space-y-6">
      {error && <div className="text-red-600 bg-red-100 p-2">{error}</div>}
      
      <div className="bg-gray-50 border border-gray-300 p-4">
        <h3 className="font-bold mb-3">Request Investigation</h3>
        <form onSubmit={handleCreate} className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1 text-sm">Type</label>
              <input
                type="text"
                placeholder="e.g. Toxicology, DNA"
                className="w-full border border-gray-300 p-2 text-sm"
                value={newInv.investigation_type}
                onChange={e => setNewInv({ ...newInv, investigation_type: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-sm">Initial Status</label>
              <select
                className="w-full border border-gray-300 p-2 text-sm"
                value={newInv.status}
                onChange={e => setNewInv({ ...newInv, status: e.target.value })}
              >
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1 text-sm">Requested Date</label>
              <input
                type="date"
                className="w-full border border-gray-300 p-2 text-sm"
                value={newInv.requested_date}
                onChange={e => setNewInv({ ...newInv, requested_date: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-sm">Completed Date</label>
              <input
                type="date"
                className="w-full border border-gray-300 p-2 text-sm"
                value={newInv.completed_date}
                onChange={e => setNewInv({ ...newInv, completed_date: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-sm">Laboratory Name</label>
              <input
                type="text"
                placeholder="e.g. Govt Analyst Dept"
                className="w-full border border-gray-300 p-2 text-sm"
                value={newInv.laboratory_name}
                onChange={e => setNewInv({ ...newInv, laboratory_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-sm">Sample Details</label>
              <input
                type="text"
                placeholder="e.g. Blood sample 5ml"
                className="w-full border border-gray-300 p-2 text-sm"
                value={newInv.sample_details}
                onChange={e => setNewInv({ ...newInv, sample_details: e.target.value })}
              />
            </div>
          </div>
          <button type="submit" disabled={saving} className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 text-sm">
            {saving ? 'Creating...' : 'Create Request'}
          </button>
        </form>
      </div>

      <table className="w-full text-left border-collapse text-sm border border-gray-300">
        <thead>
          <tr className="bg-gray-100 border-b border-gray-300">
            <th className="p-2 border-r border-gray-300">Type</th>
            <th className="p-2 border-r border-gray-300">Status</th>
            <th className="p-2 border-r border-gray-300">Requested</th>
            <th className="p-2 border-r border-gray-300">Completed</th>
            <th className="p-2 border-r border-gray-300">Result Summary</th>
            <th className="p-2">Actions / Upload</th>
          </tr>
        </thead>
        <tbody>
          {investigations.length === 0 ? (
            <tr><td colSpan={6} className="p-4 text-center text-gray-500">No investigations requested.</td></tr>
          ) : (
            investigations.map((inv: any) => (
              <tr key={inv.investigation_id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="p-2 border-r border-gray-300 font-medium">{inv.investigation_type}</td>
                <td className="p-2 border-r border-gray-300">{inv.status}</td>
                <td className="p-2 border-r border-gray-300">{inv.requested_date ? new Date(inv.requested_date).toLocaleDateString() : '-'}</td>
                <td className="p-2 border-r border-gray-300">{inv.completed_date ? new Date(inv.completed_date).toLocaleDateString() : '-'}</td>
                <td className="p-2 border-r border-gray-300">{inv.summary || 'N/A'}</td>
                <td className="p-2">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="file" 
                      className="text-xs w-48"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleFileUpload(inv.investigation_id, e.target.files[0]);
                      }}
                    />
                    {inv.media && inv.media.length > 0 && (
                      <span className="text-xs text-green-600 font-bold">{inv.media.length} file(s)</span>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
