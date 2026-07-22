import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { SearchableSelect } from '../common/SearchableSelect';

export const Referrals = ({ caseId }: { caseId: string }) => {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Specialists
  const [specialists, setSpecialists] = useState<any[]>([]);

  // Form State
  const [selectedSpecialistId, setSelectedSpecialistId] = useState('');
  const [selectedSpecialistData, setSelectedSpecialistData] = useState<any>(null);
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

  const fetchSpecialists = async (query: string) => {
    const res = await api.get('/users');
    const docs = res.data.filter((u: any) => u.roles && u.roles.includes('Doctor') && u.is_active);
    const filtered = docs.filter((d: any) => 
      `${d.first_name} ${d.last_name} ${d.designation || ''}`.toLowerCase().includes(query.toLowerCase())
    );
    return filtered.map((d: any) => ({
      label: `${d.first_name || ''} ${d.last_name || ''} ${d.designation ? `- ${d.designation}` : ''}`,
      value: d.user_id.toString(),
      data: d
    }));
  };

  useEffect(() => {
    fetchReferrals();
  }, [caseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpecialistId) {
      alert("Please select a specialist.");
      return;
    }
    
    if (!selectedSpecialistData) return;

    try {
      await api.post(`/cases/${caseId}/referrals`, {
        referred_to_user_id: selectedSpecialistData.user_id,
        specialty: selectedSpecialistData.designation || 'Specialist',
        consultant_name: `${selectedSpecialistData.first_name || ''} ${selectedSpecialistData.last_name || ''}`.trim() || selectedSpecialistData.username,
        referral_date: referralDate || null,
        recommendation
      });
      // Reset form
      setSelectedSpecialistId('');
      setSelectedSpecialistData(null);
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
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-gray-50 p-4 border border-gray-200 rounded">
        <h3 className="font-semibold text-lg text-gray-700">Add New Referral</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative z-20">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Specialist</label>
            <SearchableSelect
              value={selectedSpecialistId}
              onChange={(val, opt) => {
                setSelectedSpecialistId(val);
                setSelectedSpecialistData(opt?.data || null);
              }}
              fetchOptions={fetchSpecialists}
              placeholder="Search for a specialist..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Referral Date</label>
            <input 
              type="date" 
              value={referralDate}
              onChange={(e) => setReferralDate(e.target.value)}
              className="border border-gray-300 rounded p-2 text-sm w-full"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason / Recommendation</label>
            <textarea 
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              className="border border-gray-300 rounded p-2 text-sm w-full"
              rows={3}
              placeholder="Why is this referral being made?"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded font-medium text-sm hover:bg-blue-700 transition-colors">
            Add Referral
          </button>
        </div>
      </form>

      <div className="mt-8">
        <h3 className="font-semibold text-xl text-gray-800 border-b pb-2 mb-4">Current Referrals</h3>
        {referrals.length === 0 ? (
          <p className="text-gray-500 italic">No referrals made for this case yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {referrals.map((r: any) => (
              <div key={r.referral_id} className="bg-white border border-gray-200 rounded p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2 border-b pb-2">
                  <div>
                    <h4 className="font-bold text-gray-800">{r.users?.first_name ? `${r.users.first_name} ${r.users.last_name}` : r.consultant_name}</h4>
                    <p className="text-sm text-blue-600 font-medium">{r.users?.designation || r.specialty}</p>
                  </div>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-medium">
                    {r.referral_date ? new Date(r.referral_date).toLocaleDateString() : 'No Date'}
                  </span>
                </div>
                <div className="text-sm text-gray-700 mt-2">
                  <span className="font-semibold block mb-1">Recommendation/Notes:</span>
                  <p className="whitespace-pre-wrap">{r.recommendation || 'None provided.'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
