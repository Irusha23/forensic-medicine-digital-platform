import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api/client';

export const Dashboard = () => {
  const [cases, setCases] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  
  const [caseTypes, setCaseTypes] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resCases, resMetrics, resTypes] = await Promise.all([
          api.get('/cases'),
          api.get('/dashboard/metrics'),
          api.get('/cases/statuses') // Using this generically or if there's a type endpoint. Actually we'll derive types from cases or a fixed list. Wait, there's no types endpoint yet?
        ]);
        // Handle paginated response { data, meta } or legacy array
        setCases(resCases.data.data || resCases.data);
        setMetrics(resMetrics.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Derive case types from the case list for the filter dropdown
  useEffect(() => {
    if (cases.length > 0) {
      const types = Array.from(new Set(cases.map(c => c.case_type_lu?.label).filter(Boolean)));
      setCaseTypes(types);
    }
  }, [cases]);

  const filteredCases = cases.filter(c => {
    const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchType = typeFilter === 'ALL' || c.case_type_lu?.label === typeFilter;
    const matchSearch = search === '' || (c.case_number && c.case_number.toLowerCase().includes(search.toLowerCase()));
    return matchStatus && matchType && matchSearch;
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <div className="p-4 border-b border-gray-300 bg-gray-50 flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Search</label>
            <input 
              type="text" 
              placeholder="Case Number..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 p-2 text-sm w-48 rounded"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 p-2 text-sm rounded w-40"
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
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-300 p-2 text-sm rounded w-40"
            >
              <option value="ALL">All Types</option>
              {caseTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="ml-auto mt-4 text-sm text-gray-500 font-medium">
            Showing {filteredCases.length} cases
          </div>
        </div>

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
