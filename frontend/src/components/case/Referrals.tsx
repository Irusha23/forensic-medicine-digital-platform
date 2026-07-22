import React, { useEffect, useState } from 'react';
import api from '../../api/client';

export const Referrals = ({ caseId }: { caseId: string }) => {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form State
  const [specialty, setSpecialty] = useState('');
  const [consultantName, setConsultantName] = useState('');
  const [referralDate, setReferralDate] = useState('');
  const [recommendation, setRecommendation] = useState('');

  const fetchReferrals = async () => {
    try {
      const res = await api.get(`/cases/${caseId}/referrals`);
      setReferrals(res.data);
    } catch (err: any) {
      setError('Failed to fetch referrals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, [caseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/cases/${caseId}/referrals`, {
        specialty,
        consultant_name: consultantName,
        referral_date: referralDate || null,
        recommendation
      });
      // Reset form
      setSpecialty('');
      setConsultantName('');
      setReferralDate('');
      setRecommendation('');
      fetchReferrals();
    } catch (err) {
      alert('Failed to add referral');
    }
  };

  if (loading) return <div>Loading referrals...</div>;

  return (
    <div className="space-y-6">
      {error && <div className="text-red-600 bg-red-100 p-2">{error}</div>}

      <div className="bg-white p-4 border border-gray-200 rounded shadow-sm">
        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Request Specialist Referral</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="block text-gray-700 mb-1">Specialty</label>
            <input type="text" value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="w-full p-2 border border-gray-300 rounded" required />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Consultant Name</label>
            <input type="text" value={consultantName} onChange={(e) => setConsultantName(e.target.value)} className="w-full p-2 border border-gray-300 rounded" />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Referral Date</label>
            <input type="date" value={referralDate} onChange={(e) => setReferralDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded" required />
          </div>
          <div className="md:col-span-2">
            <label className="block text-gray-700 mb-1">Recommendation / Reason</label>
            <textarea value={recommendation} onChange={(e) => setRecommendation(e.target.value)} className="w-full p-2 border border-gray-300 rounded" rows={3} />
          </div>
          <div className="md:col-span-2 mt-2">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full md:w-auto">
              Add Referral
            </button>
          </div>
        </form>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Requested Referrals</h3>
        <table className="w-full text-left border-collapse text-sm border border-gray-300">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              <th className="p-2 border-r border-gray-300">Date</th>
              <th className="p-2 border-r border-gray-300">Specialty</th>
              <th className="p-2 border-r border-gray-300">Consultant</th>
              <th className="p-2">Reason</th>
            </tr>
          </thead>
          <tbody>
            {referrals.length === 0 ? (
              <tr><td colSpan={4} className="p-4 text-center text-gray-500">No referrals requested for this case.</td></tr>
            ) : (
              referrals.map((r: any) => (
                <tr key={r.referral_id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-2 border-r border-gray-300 whitespace-nowrap">{r.referral_date ? new Date(r.referral_date).toLocaleDateString() : '-'}</td>
                  <td className="p-2 border-r border-gray-300 font-semibold">{r.specialty}</td>
                  <td className="p-2 border-r border-gray-300">{r.consultant_name || '-'}</td>
                  <td className="p-2 text-xs text-gray-600">{r.recommendation || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
