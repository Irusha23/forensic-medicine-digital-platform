import { useEffect, useState } from 'react';
import api from '../api/client';

export const Courts = () => {
  const [courts, setCourts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Courts Directory</h1>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      <div className="bg-white border rounded shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-3 font-semibold text-gray-700">Court Name</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-4 text-center">Loading...</td></tr>
            ) : courts.length === 0 ? (
              <tr><td className="p-4 text-center">No courts found in records.</td></tr>
            ) : (
              courts.map((court, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="p-3">{court}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
