import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api/client';

export const Dashboard = () => {
  const [cases, setCases] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [caseTypes, setCaseTypes] = useState<string[]>([]);

  // Advanced Filters
  const [advFilters, setAdvFilters] = useState({
    nic: '',
    patient_name: '',
    police_station: '',
    start_date: '',
    end_date: '',
    status: 'ALL',
    type: 'ALL',
    doctor_id: '',
    report_type: ''
  });

  const fetchCases = async (filters: any) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.nic) params.append('nic', filters.nic);
      if (filters.patient_name) params.append('patient_name', filters.patient_name);
      if (filters.police_station) params.append('police_station', filters.police_station);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.doctor_id) params.append('doctor_id', filters.doctor_id);
      if (filters.report_type) params.append('report_type', filters.report_type);
      
      const res = await api.get(`/cases?${params.toString()}`);
      setCases(res.data.data || res.data);
    } catch (err) {
      console.error('Failed to fetch cases', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const resMetrics = await api.get('/dashboard/metrics');
        setMetrics(resMetrics.data);
      } catch (err) {
        console.error('Failed to fetch metrics', err);
      }
    };
    fetchMetrics();
    fetchCases(advFilters);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCases(advFilters);
  };

  // Derive case types from the case list for the filter dropdown
  useEffect(() => {
    if (cases.length > 0) {
      const types = Array.from(new Set(cases.map(c => c.case_type_lu?.label).filter(Boolean)));
      setCaseTypes(types);
    }
  }, [cases]);

  const filteredCases = cases.filter(c => {
    const matchStatus = advFilters.status === 'ALL' || c.status === advFilters.status;
    const matchType = advFilters.type === 'ALL' || c.case_type_lu?.label === advFilters.type;
    return matchStatus && matchType;
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <Link to="/cases/new" className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 rounded shadow">
          Create New Case
        </Link>
      </div>

      {/* Metric Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-6 rounded shadow border-l-4 border-blue-500">
            <div className="text-gray-500 text-sm font-semibold uppercase">Total Cases</div>
            <div className="text-3xl font-bold mt-1">{metrics.summary.totalCases}</div>
          </div>
          <div className="bg-white p-6 rounded shadow border-l-4 border-green-500">
            <div className="text-gray-500 text-sm font-semibold uppercase">Open Cases</div>
            <div className="text-3xl font-bold mt-1">{metrics.summary.openCases}</div>
          </div>
          <div className="bg-white p-6 rounded shadow border-l-4 border-gray-500">
            <div className="text-gray-500 text-sm font-semibold uppercase">Closed Cases</div>
            <div className="text-3xl font-bold mt-1">{metrics.summary.closedCases}</div>
          </div>
          <div className="bg-white p-6 rounded shadow border-l-4 border-yellow-500">
            <div className="text-gray-500 text-sm font-semibold uppercase text-xs">Pending Investigations</div>
            <div className="text-3xl font-bold mt-1">{metrics.summary.pendingInvestigations || 0}</div>
          </div>
          <div className="bg-white p-6 rounded shadow border-l-4 border-red-500">
            <div className="text-gray-500 text-sm font-semibold uppercase text-xs">Delayed Reports</div>
            <div className="text-3xl font-bold mt-1">{metrics.summary.pendingReports || 0}</div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded shadow border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 text-center">Cases by Status</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.statusDistribution}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {metrics.statusDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white p-4 rounded shadow border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 text-center">Cases by Type</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.typeDistribution}>
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
      
      {/* Advanced Filtering & Table */}
      <div className="bg-white border border-gray-300 rounded shadow">
        <form onSubmit={handleSearch} className="p-4 border-b border-gray-300 bg-gray-50 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Patient Name</label>
            <input 
              type="text" 
              placeholder="e.g. John Doe" 
              value={advFilters.patient_name}
              onChange={(e) => setAdvFilters(prev => ({ ...prev, patient_name: e.target.value }))}
              className="border border-gray-300 p-2 text-sm w-40 rounded"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">NIC</label>
            <input 
              type="text" 
              placeholder="e.g. 199923456789" 
              value={advFilters.nic}
              onChange={(e) => setAdvFilters(prev => ({ ...prev, nic: e.target.value }))}
              className="border border-gray-300 p-2 text-sm w-32 rounded"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Police Station</label>
            <input 
              type="text" 
              placeholder="e.g. Colombo Central" 
              value={advFilters.police_station}
              onChange={(e) => setAdvFilters(prev => ({ ...prev, police_station: e.target.value }))}
              className="border border-gray-300 p-2 text-sm w-40 rounded"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">From Date</label>
            <input 
              type="date" 
              value={advFilters.start_date}
              onChange={(e) => setAdvFilters(prev => ({ ...prev, start_date: e.target.value }))}
              className="border border-gray-300 p-2 text-sm rounded"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">To Date</label>
            <input 
              type="date" 
              value={advFilters.end_date}
              onChange={(e) => setAdvFilters(prev => ({ ...prev, end_date: e.target.value }))}
              className="border border-gray-300 p-2 text-sm rounded"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
            <select 
              value={advFilters.status} 
              onChange={(e) => setAdvFilters(prev => ({ ...prev, status: e.target.value }))}
              className="border border-gray-300 p-2 text-sm rounded w-32"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Case Type</label>
            <select 
              value={advFilters.type} 
              onChange={(e) => setAdvFilters(prev => ({ ...prev, type: e.target.value }))}
              className="border border-gray-300 p-2 text-sm rounded w-32"
            >
              <option value="ALL">All Types</option>
              {caseTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded text-sm hover:bg-gray-900 shadow">
            Search
          </button>
          <div className="ml-auto text-sm text-gray-500 font-medium self-center">
            Showing {filteredCases.length} cases
          </div>
        </form>

        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              <th className="p-3 font-medium">Case Number</th>
              <th className="p-3 font-medium">Type</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Opened Date</th>
              <th className="p-3 font-medium">Doctor</th>
              <th className="p-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCases.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500 italic">No cases match the filters.</td>
              </tr>
            ) : (
              filteredCases.map((c) => (
                <tr key={c.case_id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-3 font-semibold">{c.case_number || 'N/A'}</td>
                  <td className="p-3 text-gray-600">{c.case_type_lu?.label || 'N/A'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      c.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                      c.status === 'CLOSED' ? 'bg-gray-200 text-gray-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="p-3 text-gray-600">{c.opened_date ? new Date(c.opened_date).toLocaleDateString() : 'N/A'}</td>
                  <td className="p-3 text-gray-600">{c.users?.username || 'Unassigned'}</td>
                  <td className="p-3 text-right">
                    <Link to={`/cases/${c.case_id}`} className="text-blue-600 hover:text-blue-800 font-medium hover:underline">View Case</Link>
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
