import React, { useEffect, useState } from 'react';
import api from '../../api/client';

export const Subjects = ({ caseId }: { caseId: string }) => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form State
  const [subjectType, setSubjectType] = useState('Victim');
  const [fullName, setFullName] = useState('');
  const [nic, setNic] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [bhtNumber, setBhtNumber] = useState('');
  const [address, setAddress] = useState('');
  const [telephone, setTelephone] = useState('');

  const fetchSubjects = async () => {
    try {
      const res = await api.get(`/cases/${caseId}/subjects`);
      setSubjects(res.data);
    } catch (err: any) {
      setError('Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [caseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/cases/${caseId}/subjects`, {
        subject_type: subjectType,
        full_name: fullName,
        nic,
        date_of_birth: dateOfBirth || null,
        gender,
        bht_number: bhtNumber,
        address,
        telephone
      });
      // Reset form
      setFullName('');
      setNic('');
      setDateOfBirth('');
      setGender('');
      setBhtNumber('');
      setAddress('');
      setTelephone('');
      fetchSubjects();
    } catch (err) {
      alert('Failed to add subject');
    }
  };

  if (loading) return <div>Loading subjects...</div>;

  return (
    <div className="space-y-6">
      {error && <div className="text-red-600 bg-red-100 p-2">{error}</div>}

      <div className="bg-white p-4 border border-gray-200 rounded shadow-sm">
        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Add New Subject</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <label htmlFor="subjectType" className="block text-gray-700 mb-1">Subject Type</label>
            <select id="subjectType" value={subjectType} onChange={(e) => setSubjectType(e.target.value)} className="w-full p-2 border border-gray-300 rounded" required>
              <option value="Victim">Victim</option>
              <option value="Suspect">Suspect</option>
              <option value="Unknown Body">Unknown Body</option>
            </select>
          </div>
          <div>
            <label htmlFor="fullName" className="block text-gray-700 mb-1">Full Name</label>
            <input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full p-2 border border-gray-300 rounded" required />
          </div>
          <div>
            <label htmlFor="nic" className="block text-gray-700 mb-1">NIC</label>
            <input id="nic" type="text" value={nic} onChange={(e) => setNic(e.target.value)} className="w-full p-2 border border-gray-300 rounded" />
          </div>
          <div>
            <label htmlFor="dob" className="block text-gray-700 mb-1">Date of Birth</label>
            <input id="dob" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="w-full p-2 border border-gray-300 rounded" />
          </div>
          <div>
            <label htmlFor="gender" className="block text-gray-700 mb-1">Gender</label>
            <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)} className="w-full p-2 border border-gray-300 rounded">
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="bht" className="block text-gray-700 mb-1">BHT Number</label>
            <input id="bht" type="text" value={bhtNumber} onChange={(e) => setBhtNumber(e.target.value)} className="w-full p-2 border border-gray-300 rounded" />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="address" className="block text-gray-700 mb-1">Address</label>
            <input id="address" type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full p-2 border border-gray-300 rounded" />
          </div>
          <div>
            <label htmlFor="telephone" className="block text-gray-700 mb-1">Telephone</label>
            <input id="telephone" type="text" value={telephone} onChange={(e) => setTelephone(e.target.value)} className="w-full p-2 border border-gray-300 rounded" />
          </div>
          <div className="md:col-span-2 mt-2">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full md:w-auto">
              Add Subject
            </button>
          </div>
        </form>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Associated Subjects</h3>
        <table className="w-full text-left border-collapse text-sm border border-gray-300">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              <th className="p-2 border-r border-gray-300">Name</th>
              <th className="p-2 border-r border-gray-300">Type</th>
              <th className="p-2 border-r border-gray-300">NIC</th>
              <th className="p-2 border-r border-gray-300">Gender</th>
              <th className="p-2">Phone</th>
            </tr>
          </thead>
          <tbody>
            {subjects.length === 0 ? (
              <tr><td colSpan={5} className="p-4 text-center text-gray-500">No subjects attached to this case.</td></tr>
            ) : (
              subjects.map((s: any) => (
                <tr key={s.subject_id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-2 border-r border-gray-300 font-semibold">{s.full_name}</td>
                  <td className="p-2 border-r border-gray-300">{s.subject_type}</td>
                  <td className="p-2 border-r border-gray-300 font-mono text-xs">{s.nic || '-'}</td>
                  <td className="p-2 border-r border-gray-300">{s.gender || '-'}</td>
                  <td className="p-2">{s.telephone || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
