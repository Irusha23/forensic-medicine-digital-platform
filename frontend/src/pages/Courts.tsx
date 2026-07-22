import { useEffect, useState } from 'react';
import api from '../api/client';

export const Courts = () => {
  const [courts, setCourts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ court_name: '', location: '', contact_number: '' });

  const fetchCourts = async () => {
    try {
      const res = await api.get('/courts');
      setCourts(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch courts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/courts', formData);
      setShowModal(false);
      setFormData({ court_name: '', location: '', contact_number: '' });
      fetchCourts();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add court');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Courts Directory</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Court
        </button>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      <div className="bg-white border rounded shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-3 font-semibold text-gray-700">Court Name</th>
              <th className="p-3 font-semibold text-gray-700">Location</th>
              <th className="p-3 font-semibold text-gray-700">Contact Number</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="p-4 text-center">Loading...</td></tr>
            ) : courts.length === 0 ? (
              <tr><td colSpan={3} className="p-4 text-center">No courts found in records.</td></tr>
            ) : (
              courts.map((court) => (
                <tr key={court.court_id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{court.court_name}</td>
                  <td className="p-3">{court.location || '-'}</td>
                  <td className="p-3">{court.contact_number || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Add Court</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Court Name *</label>
                <input 
                  type="text" 
                  required
                  className="w-full border p-2 rounded"
                  value={formData.court_name}
                  onChange={e => setFormData({...formData, court_name: e.target.value})}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Location</label>
                <input 
                  type="text" 
                  className="w-full border p-2 rounded"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Contact Number</label>
                <input 
                  type="text" 
                  className="w-full border p-2 rounded"
                  value={formData.contact_number}
                  onChange={e => setFormData({...formData, contact_number: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
