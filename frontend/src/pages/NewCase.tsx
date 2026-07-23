import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { SearchableSelect } from '../components/common/SearchableSelect';

export const NewCase = () => {
  const navigate = useNavigate();
  const [caseNumber, setCaseNumber] = useState('');
  const [caseTypeId, setCaseTypeId] = useState<string>('2'); // Default to Clinical
  const [status, setStatus] = useState('OPEN');
  const [doctorId, setDoctorId] = useState('');
  const [policeStationId, setPoliceStationId] = useState('');
  const [error, setError] = useState('');

  const fetchDoctors = async (query: string) => {
    const res = await api.get('/users');
    const filtered = res.data.filter((d: any) => 
      d.roles && (d.roles.includes('Doctor') || d.roles.includes('JMO')) && d.is_active &&
      `${d.first_name} ${d.last_name} ${d.designation || ''}`.toLowerCase().includes(query.toLowerCase())
    );
    return filtered.map((d: any) => ({
      label: `${d.first_name} ${d.last_name} ${d.designation ? `(${d.designation})` : ''}`,
      value: d.user_id.toString()
    }));
  };

  const fetchPoliceStations = async (query: string) => {
    const res = await api.get('/police-stations');
    const filtered = res.data.filter((s: any) => 
      `${s.station_name} ${s.district || ''}`.toLowerCase().includes(query.toLowerCase())
    );
    return filtered.map((s: any) => ({
      label: `${s.station_name} ${s.district ? `(${s.district})` : ''}`,
      value: s.police_station_id.toString()
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const payload: any = {
        case_number: caseNumber,
        case_type_id: parseInt(caseTypeId),
        status,
        opened_date: new Date().toISOString()
      };
      if (doctorId) payload.assigned_doctor_id = parseInt(doctorId);
      if (policeStationId) payload.police_station_id = parseInt(policeStationId);

      const res = await api.post('/cases', payload);
      navigate(`/cases/${res.data.case_id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create case');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white border border-gray-300 p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Case</h1>
      {error && <div className="bg-red-100 text-red-700 p-3 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="caseNumber" className="block font-medium mb-1">Case Number</label>
          <input
            id="caseNumber"
            type="text"
            className="w-full border border-gray-300 p-2"
            value={caseNumber}
            onChange={(e) => setCaseNumber(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="caseType" className="block font-medium mb-1">Case Type</label>
          <select
            id="caseType"
            className="w-full border border-gray-300 p-2"
            value={caseTypeId}
            onChange={(e) => setCaseTypeId(e.target.value)}
          >
            <option value="2">Clinical</option>
            <option value="3">Autopsy</option>
            <option value="1">Other / General Forensic</option>
          </select>
        </div>
        <div className="relative z-20">
          <label className="block font-medium mb-1">Assigned Doctor (JMO)</label>
          <SearchableSelect
            value={doctorId}
            onChange={setDoctorId}
            fetchOptions={fetchDoctors}
            placeholder="Search for a doctor..."
          />
        </div>
        <div className="relative z-10">
          <label className="block font-medium mb-1">Police Station</label>
          <SearchableSelect
            value={policeStationId}
            onChange={setPoliceStationId}
            fetchOptions={fetchPoliceStations}
            placeholder="Search for a police station..."
          />
        </div>
        <div>
          <label htmlFor="status" className="block font-medium mb-1">Status</label>
          <select
            id="status"
            className="w-full border border-gray-300 p-2"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="OPEN">Open</option>
            <option value="CLOSED">Closed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
        <div className="pt-4 flex space-x-4">
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 hover:bg-blue-700">
            Create Case
          </button>
          <button type="button" onClick={() => navigate('/')} className="bg-gray-200 text-gray-800 px-6 py-2 hover:bg-gray-300">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
