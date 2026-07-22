import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/client';

export const Patients = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const categoryFilter = searchParams.get('category') || 'All';

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients');
      setPatients(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const calculateAge = (dob: string) => {
    if (!dob) return 'N/A';
    try {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch {
      return 'N/A';
    }
  };

  const categories = ['All', 'Clinical', 'Autopsy', 'Unknown'];

  const handleCategoryChange = (category: string) => {
    if (category === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  const displayedPatients = patients.filter(p => {
    if (categoryFilter === 'All') return true;
    return p.case_type === categoryFilter;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {categoryFilter === 'All' ? 'All Subjects & Patients' : `${categoryFilter} Subjects`}
        </h1>
      </div>

      <div className="flex space-x-2 mb-6">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
              categoryFilter === cat 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      <div className="bg-white border rounded shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-3 font-semibold text-gray-700">Subject Name</th>
              <th className="p-3 font-semibold text-gray-700">NIC</th>
              <th className="p-3 font-semibold text-gray-700">Gender</th>
              <th className="p-3 font-semibold text-gray-700">Age</th>
              <th className="p-3 font-semibold text-gray-700">Category</th>
              <th className="p-3 font-semibold text-gray-700">Latest Case</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-4 text-center">Loading...</td></tr>
            ) : displayedPatients.length === 0 ? (
              <tr><td colSpan={6} className="p-4 text-center">No patients found in this category.</td></tr>
            ) : (
              displayedPatients.map(p => (
                <tr key={p.patient_id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-900">{p.full_name}</td>
                  <td className="p-3 text-gray-600">{p.nic || '-'}</td>
                  <td className="p-3 text-gray-600">{p.gender || '-'}</td>
                  <td className="p-3 text-gray-600">{calculateAge(p.date_of_birth)}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      p.case_type === 'Clinical' ? 'bg-blue-100 text-blue-800' :
                      p.case_type === 'Autopsy' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {p.case_type}
                    </span>
                  </td>
                  <td className="p-3">
                    {p.case_id ? (
                      <button 
                        onClick={() => navigate(`/cases/${p.case_id}`)}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {p.case_number || 'View Case'}
                      </button>
                    ) : (
                      <span className="text-gray-400">No Case Linked</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
