import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { RequireRole } from '../layout/RequireRole';

export const Evidence = ({ caseId }: { caseId: string }) => {
  const [evidenceList, setEvidenceList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Add Evidence Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [storageLocation, setStorageLocation] = useState('');
  
  // Add Custody Form
  const [activeEvidenceId, setActiveEvidenceId] = useState<string | null>(null);
  const [transferredTo, setTransferredTo] = useState('');
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');

  const { hasRole } = useAuth();

  const fetchEvidence = async () => {
    try {
      const res = await api.get(`/cases/${caseId}/evidence`);
      setEvidenceList(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load evidence');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvidence();
  }, [caseId]);

  const handleAddEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/cases/${caseId}/evidence`, {
        item_name: itemName,
        description,
        storage_location: storageLocation
      });
      setShowAddForm(false);
      setItemName('');
      setDescription('');
      setStorageLocation('');
      fetchEvidence();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add evidence');
    }
  };

  const handleAddCustody = async (e: React.FormEvent, evidenceId: string) => {
    e.preventDefault();
    try {
      await api.post(`/evidence/${evidenceId}/custody`, {
        transferred_to: transferredTo,
        purpose,
        notes
      });
      setActiveEvidenceId(null);
      setTransferredTo('');
      setPurpose('');
      setNotes('');
      fetchEvidence();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add custody record');
    }
  };

  if (loading) return <div>Loading evidence...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Evidence & Chain of Custody</h2>
        <RequireRole roles={['Admin', 'Doctor']}>
          <button 
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancel' : 'Log New Evidence'}
          </button>
        </RequireRole>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddEvidence} className="bg-gray-50 p-4 border border-gray-200 rounded space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Item Name / ID</label>
              <input required type="text" className="w-full border p-2 text-sm" value={itemName} onChange={e => setItemName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Storage Location</label>
              <input type="text" className="w-full border p-2 text-sm" value={storageLocation} onChange={e => setStorageLocation(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea className="w-full border p-2 text-sm" rows={2} value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">Save Evidence</button>
        </form>
      )}

      {evidenceList.length === 0 ? (
        <div className="text-gray-500 italic">No evidence recorded for this case.</div>
      ) : (
        <div className="space-y-6">
          {evidenceList.map((ev: any) => (
            <div key={ev.evidence_id} className="border border-gray-300 rounded overflow-hidden">
              <div className="bg-gray-100 p-3 border-b border-gray-300 flex justify-between items-center">
                <div>
                  <div className="font-bold text-gray-800">{ev.item_name}</div>
                  <div className="text-xs text-gray-500">Collected: {new Date(ev.collected_at).toLocaleString()} | Location: {ev.storage_location || 'N/A'}</div>
                </div>
                <RequireRole roles={['Admin', 'Doctor']}>
                  <button 
                    className="text-sm text-blue-600 font-medium hover:underline"
                    onClick={() => setActiveEvidenceId(activeEvidenceId === ev.evidence_id ? null : ev.evidence_id)}
                  >
                    Transfer Custody
                  </button>
                </RequireRole>
              </div>
              
              <div className="p-3 text-sm text-gray-700">
                {ev.description || 'No description provided.'}
              </div>

              {activeEvidenceId === ev.evidence_id && (
                <form onSubmit={(e) => handleAddCustody(e, ev.evidence_id)} className="bg-blue-50 p-4 border-t border-b border-blue-200 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Transfer To</label>
                      <input required type="text" className="w-full border p-2 text-sm" value={transferredTo} onChange={e => setTransferredTo(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Purpose</label>
                      <input required type="text" className="w-full border p-2 text-sm" value={purpose} onChange={e => setPurpose(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Notes</label>
                    <input type="text" className="w-full border p-2 text-sm" value={notes} onChange={e => setNotes(e.target.value)} />
                  </div>
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">Record Transfer</button>
                </form>
              )}

              {/* Chain of Custody History */}
              {ev.chain_of_custody && ev.chain_of_custody.length > 0 && (
                <div className="p-3 border-t border-gray-200">
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Chain of Custody History</h4>
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="p-2 font-medium">Date/Time</th>
                        <th className="p-2 font-medium">Transferred To</th>
                        <th className="p-2 font-medium">Purpose</th>
                        <th className="p-2 font-medium">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ev.chain_of_custody.map((coc: any) => (
                        <tr key={coc.coc_id} className="border-b border-gray-100">
                          <td className="p-2">{new Date(coc.transferred_at).toLocaleString()}</td>
                          <td className="p-2 font-medium">{coc.transferred_to}</td>
                          <td className="p-2">{coc.purpose}</td>
                          <td className="p-2 text-gray-500">{coc.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
