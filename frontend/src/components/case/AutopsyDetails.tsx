import React, { useEffect, useState } from 'react';
import api from '../../api/client';

export const AutopsyDetails = ({ caseId }: { caseId: string }) => {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await api.get(`/cases/${caseId}/autopsy-details`);
        setDetails(res.data);
      } catch (err: any) {
        // 404 is fine, means no details yet
        if (err.response?.status !== 404) {
          setError('Failed to load autopsy details');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [caseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post(`/cases/${caseId}/autopsy-details`, details || {});
      alert('Autopsy details saved');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setDetails({ ...details, [field]: value });
  };

  if (loading) return <div>Loading details...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-600">{error}</div>}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-1 text-sm">Time Since Death Estimate</label>
          <input
            type="text"
            className="w-full border border-gray-300 p-2"
            value={details?.time_since_death_estimate || ''}
            onChange={e => handleChange('time_since_death_estimate', e.target.value)}
          />
        </div>
        <div>
          <label className="block font-medium mb-1 text-sm">Manner of Death</label>
          <input
            type="text"
            className="w-full border border-gray-300 p-2"
            value={details?.manner_of_death || ''}
            onChange={e => handleChange('manner_of_death', e.target.value)}
          />
        </div>
        <div className="col-span-2">
          <label className="block font-medium mb-1 text-sm">Immediate Cause of Death</label>
          <textarea
            className="w-full border border-gray-300 p-2"
            rows={2}
            value={details?.immediate_cause_of_death || ''}
            onChange={e => handleChange('immediate_cause_of_death', e.target.value)}
          ></textarea>
        </div>
        <div className="col-span-2">
          <label className="block font-medium mb-1 text-sm">Organ Findings</label>
          <textarea
            className="w-full border border-gray-300 p-2"
            rows={3}
            value={details?.organ_findings || ''}
            onChange={e => handleChange('organ_findings', e.target.value)}
          ></textarea>
        </div>
      </div>
      <button type="submit" disabled={saving} className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700">
        {saving ? 'Saving...' : 'Save Autopsy Details'}
      </button>
    </form>
  );
};
