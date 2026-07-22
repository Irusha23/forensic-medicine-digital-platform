import { useEffect, useState } from 'react';
import api from '../api/client';

export const PoliceStations = () => {
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ station_name: '', district: '', contact_number: '' });

  const fetchStations = async () => {
    try {
      const res = await api.get('/police-stations');
      setStations(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch police stations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/police-stations', formData);
      setShowModal(false);
      setFormData({ station_name: '', district: '', contact_number: '' });
      fetchStations();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add police station');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Police Stations</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Police Station
        </button>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      <div className="bg-white border rounded shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-3 font-semibold text-gray-700">Station Name</th>
              <th className="p-3 font-semibold text-gray-700">District</th>
              <th className="p-3 font-semibold text-gray-700">Contact Number</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="p-4 text-center">Loading...</td></tr>
            ) : stations.length === 0 ? (
              <tr><td colSpan={3} className="p-4 text-center">No police stations found.</td></tr>
            ) : (
              stations.map(st => (
                <tr key={st.police_station_id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{st.station_name}</td>
                  <td className="p-3">{st.district}</td>
                  <td className="p-3">{st.contact_number}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Add Police Station</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Station Name *</label>
                <input 
                  type="text" 
                  required
                  className="w-full border p-2 rounded"
                  value={formData.station_name}
                  onChange={e => setFormData({...formData, station_name: e.target.value})}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">District</label>
                <input 
                  type="text" 
                  className="w-full border p-2 rounded"
                  value={formData.district}
                  onChange={e => setFormData({...formData, district: e.target.value})}
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
