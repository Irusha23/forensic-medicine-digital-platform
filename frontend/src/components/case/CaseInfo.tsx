import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export const CaseInfo = ({ caseData, onUpdate }: { caseData: any, onUpdate: () => void }) => {
  const { hasRole } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [doctors, setDoctors] = useState<any[]>([]);

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/users');
      // Filter users who have the 'Doctor' role
      const docs = res.data.filter((u: any) => u.roles && u.roles.includes('Doctor') && u.is_active);
      setDoctors(docs);
    } catch (err) {
      console.error('Failed to fetch doctors', err);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    setError('');
    try {
      await api.put(`/cases/${caseData.case_id}`, { status: newStatus });
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDoctorAssign = async (doctorId: string) => {
    setUpdating(true);
    setError('');
    try {
      await api.put(`/cases/${caseData.case_id}`, { assigned_doctor_id: doctorId });
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to assign doctor');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-white border border-gray-300 p-4 mb-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-bold">Case Info</h2>
          <div className="text-sm text-gray-500">Case ID: {caseData.case_id}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500 mb-1">Status</div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 bg-gray-100 border border-gray-300 font-mono text-sm">
              {caseData.status}
            </span>
            <select
              disabled={updating}
              className="border border-gray-300 p-1 text-sm bg-white"
              onChange={(e) => handleStatusChange(e.target.value)}
              value=""
            >
              <option value="" disabled>Change...</option>
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          {error && <div className="text-red-600 text-xs mt-1">{error}</div>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm mt-4">
        <div><span className="font-medium">Case Number:</span> {caseData.case_number || 'N/A'}</div>
        <div><span className="font-medium">Opened Date:</span> {caseData.opened_date ? new Date(caseData.opened_date).toLocaleString() : 'N/A'}</div>
        <div><span className="font-medium">Closed Date:</span> {caseData.closed_date ? new Date(caseData.closed_date).toLocaleString() : 'N/A'}</div>
        <div><span className="font-medium">Case Type:</span> {caseData.case_type_lu?.label || 'N/A'}</div>
        <div className="col-span-2 flex items-center space-x-2 mt-2">
          <span className="font-medium">Assigned Doctor:</span>
          {hasRole(['Admin', 'Clerk']) ? (
            <select
              disabled={updating}
              className="border border-gray-300 p-1 text-sm bg-white rounded"
              value={caseData.assigned_doctor_id ? caseData.assigned_doctor_id.toString() : ''}
              onChange={(e) => handleDoctorAssign(e.target.value)}
            >
              <option value="">Unassigned</option>
              {doctors.map(d => (
                <option key={d.user_id} value={d.user_id}>{d.first_name} {d.last_name} ({d.username})</option>
              ))}
            </select>
          ) : (
            <span className="text-gray-600">{caseData.users?.username || 'Unassigned'}</span>
          )}
        </div>
      </div>
    </div>
  );
};
