import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export const CaseInfo = ({ caseData, onUpdate }: { caseData: any, onUpdate: () => void }) => {
  const { hasRole } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [doctors, setDoctors] = useState<any[]>([]);
  const [policeStations, setPoliceStations] = useState<any[]>([]);

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

  const fetchPoliceStations = async () => {
    try {
      const res = await api.get('/police-stations');
      setPoliceStations(res.data);
    } catch (err) {
      console.error('Failed to fetch police stations', err);
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchPoliceStations();
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

  const handlePoliceStationAssign = async (stationId: string) => {
    setUpdating(true);
    setError('');
    try {
      await api.put(`/cases/${caseData.case_id}`, { police_station_id: stationId ? stationId : null });
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reassign police station');
    } finally {
      setUpdating(false);
    }
  };

  const hasPatient = caseData.patients;
  const hasPoliceStation = caseData.police_stations;
  const courts = caseData.court_event || [];
  const referrals = caseData.referral || [];
  const assignedDoctor = caseData.users;

  return (
    <div className="bg-white border border-gray-300 p-6 mb-6 rounded shadow-sm">
      <div className="flex justify-between items-start border-b pb-4 mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Case Info</h2>
          <div className="text-sm text-gray-500 mt-1">Case ID: {caseData.case_id}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500 mb-1 font-semibold">Status</div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded font-semibold text-sm ${caseData.status === 'CLOSED' || caseData.status === 'closed' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
              {caseData.status || 'OPEN'}
            </span>
            <select
              disabled={updating}
              className="border border-gray-300 p-1.5 text-sm bg-white rounded cursor-pointer hover:border-gray-400 focus:outline-none"
              onChange={(e) => handleStatusChange(e.target.value)}
              value=""
            >
              <option value="" disabled>Change...</option>
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          {error && <div className="text-red-600 text-xs mt-2">{error}</div>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm mb-8">
        <div className="space-y-3">
          <div className="flex justify-between border-b pb-1">
            <span className="font-semibold text-gray-600">Case Number</span>
            <span className="text-gray-800 font-medium">{caseData.case_number || 'N/A'}</span>
          </div>
          <div className="flex justify-between border-b pb-1">
            <span className="font-semibold text-gray-600">Case Type</span>
            <span className="text-gray-800 font-medium">{caseData.case_type_lu?.label || 'N/A'}</span>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between border-b pb-1">
            <span className="font-semibold text-gray-600">Opened Date</span>
            <span className="text-gray-800">{caseData.opened_date ? new Date(caseData.opened_date).toLocaleDateString() : 'N/A'}</span>
          </div>
          <div className="flex justify-between border-b pb-1">
            <span className="font-semibold text-gray-600">Closed Date</span>
            <span className="text-gray-800">{caseData.closed_date ? new Date(caseData.closed_date).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Involved Parties Section */}
      <div className="mt-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Involved Parties</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Patient/Subject */}
          <div className="bg-gray-50 border border-gray-200 p-4 rounded">
            <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              Patient / Subject
            </h4>
            {hasPatient ? (
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium text-gray-800">Name:</span> {hasPatient.full_name || 'N/A'}</p>
                <p><span className="font-medium text-gray-800">NIC:</span> {hasPatient.nic || 'N/A'}</p>
                <p><span className="font-medium text-gray-800">Contact:</span> {hasPatient.telephone || 'N/A'}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No subject added to this case.</p>
            )}
          </div>

          {/* Assigned Doctor / JMO */}
          <div className="bg-gray-50 border border-gray-200 p-4 rounded">
            <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              Assigned Doctor (JMO)
            </h4>
            <div className="text-sm text-gray-600 space-y-2">
              {assignedDoctor ? (
                <div>
                  <p><span className="font-medium text-gray-800">Name:</span> {assignedDoctor.first_name} {assignedDoctor.last_name}</p>
                  <p><span className="font-medium text-gray-800">Designation:</span> {assignedDoctor.designation || 'Doctor'}</p>
                  {assignedDoctor.email && <p><span className="font-medium text-gray-800">Email:</span> <a href={`mailto:${assignedDoctor.email}`} className="text-blue-600 hover:underline">{assignedDoctor.email}</a></p>}
                </div>
              ) : (
                <p className="text-gray-400 italic">Unassigned</p>
              )}
              
              {hasRole(['Admin', 'Clerk']) && (
                <div className="pt-2 border-t mt-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Reassign Doctor</label>
                  <select
                    disabled={updating}
                    className="w-full border border-gray-300 p-1.5 text-sm bg-white rounded cursor-pointer"
                    value={caseData.assigned_doctor_id ? caseData.assigned_doctor_id.toString() : ''}
                    onChange={(e) => handleDoctorAssign(e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {doctors.map(d => (
                      <option key={d.user_id} value={d.user_id}>{d.first_name} {d.last_name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Police Station */}
          <div className="bg-gray-50 border border-gray-200 p-4 rounded">
            <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              Police Station
            </h4>
            {hasPoliceStation ? (
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium text-gray-800">Station:</span> {hasPoliceStation.station_name || 'N/A'}</p>
                <p><span className="font-medium text-gray-800">District:</span> {hasPoliceStation.district || 'N/A'}</p>
                <p><span className="font-medium text-gray-800">Contact:</span> {hasPoliceStation.contact_number || 'N/A'}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No police station linked.</p>
            )}

            {hasRole(['Admin', 'Clerk']) && (
              <div className="pt-2 border-t mt-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Reassign Police Station</label>
                <select
                  disabled={updating}
                  className="w-full border border-gray-300 p-1.5 text-sm bg-white rounded cursor-pointer"
                  value={caseData.police_station_id ? caseData.police_station_id.toString() : ''}
                  onChange={(e) => handlePoliceStationAssign(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {policeStations.map(ps => (
                    <option key={ps.police_station_id} value={ps.police_station_id}>{ps.station_name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Courts */}
          <div className="bg-gray-50 border border-gray-200 p-4 rounded">
            <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path></svg>
              Courts
            </h4>
            {courts.length > 0 ? (
              <ul className="space-y-2 text-sm text-gray-600">
                {courts.map((court: any) => (
                  <li key={court.court_event_id} className="border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                    <p><span className="font-medium text-gray-800">Court Name:</span> {court.court_name}</p>
                    <p><span className="font-medium text-gray-800">Event:</span> {court.event_type} - {court.event_date ? new Date(court.event_date).toLocaleDateString() : 'N/A'}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400 italic">No courts involved.</p>
            )}
          </div>

          {/* Referrals */}
          <div className="bg-gray-50 border border-gray-200 p-4 rounded md:col-span-2">
            <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              Referrals (Consultants & Other Doctors)
            </h4>
            {referrals.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                {referrals.map((ref: any) => (
                  <div key={ref.referral_id} className="border border-gray-200 p-2 rounded bg-white">
                    <p><span className="font-medium text-gray-800">Specialty:</span> {ref.users?.designation || ref.specialty}</p>
                    <p><span className="font-medium text-gray-800">Consultant:</span> {ref.users?.first_name ? `${ref.users.first_name} ${ref.users.last_name}` : ref.consultant_name}</p>
                    {ref.users?.email && <p><span className="font-medium text-gray-800">Email:</span> <a href={`mailto:${ref.users.email}`} className="text-blue-600 hover:underline">{ref.users.email}</a></p>}
                    <p><span className="font-medium text-gray-800">Date:</span> {ref.referral_date ? new Date(ref.referral_date).toLocaleDateString() : 'N/A'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No referrals made.</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
