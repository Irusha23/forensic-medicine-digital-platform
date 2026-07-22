import { useEffect, useState } from 'react';
import api from '../api/client';

export const PoliceStations = () => {
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Police Stations</h1>
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
    </div>
  );
};
