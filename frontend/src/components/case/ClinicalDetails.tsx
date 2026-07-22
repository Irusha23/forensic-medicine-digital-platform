import React, { useState } from 'react';
import api from '../../api/client';

export const ClinicalDetails = ({ caseData, onUpdate }: { caseData: any, onUpdate: () => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Local state for the form
  const [formData, setFormData] = useState({
    referral_source: caseData.clinical_case?.referral_source || '',
    ward_number: caseData.clinical_case?.ward_number || '',
    clinical_category: caseData.clinical_case?.clinical_category || '',
    mlef_serial_number: caseData.clinical_case?.mlef_serial_number || '',
    referring_officer: caseData.clinical_case?.referring_officer || '',
    referral_date_time: caseData.clinical_case?.referral_date_time ? new Date(caseData.clinical_case.referral_date_time).toISOString().slice(0, 16) : '',
    institution_details: caseData.clinical_case?.institution_details || '',
    incident_date_time: caseData.clinical_case?.incident_date_time ? new Date(caseData.clinical_case.incident_date_time).toISOString().slice(0, 16) : '',
    incident_description: caseData.clinical_case?.incident_description || '',
    past_medical_history: caseData.clinical_case?.past_medical_history || '',
    examination_findings: caseData.clinical_case?.examination_findings || '',
    provisional_diagnosis: caseData.clinical_case?.provisional_diagnosis || ''
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        clinical: {
          ...formData,
          referral_date_time: formData.referral_date_time ? new Date(formData.referral_date_time).toISOString() : null,
          incident_date_time: formData.incident_date_time ? new Date(formData.incident_date_time).toISOString() : null,
        }
      };
      await api.put(`/cases/${caseData.case_id}`, payload);
      setIsEditing(false);
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save clinical details');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Clinical Details</h2>
        {!isEditing ? (
          <button 
            className="bg-gray-100 text-gray-700 px-4 py-2 hover:bg-gray-200 border border-gray-300 font-medium"
            onClick={() => setIsEditing(true)}
          >
            Edit Details
          </button>
        ) : (
          <div className="space-x-2">
            <button 
              className="bg-gray-200 text-gray-800 px-4 py-2 hover:bg-gray-300 font-medium"
              onClick={() => setIsEditing(false)}
              disabled={saving}
            >
              Cancel
            </button>
            <button 
              className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 font-medium"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Referral Source</label>
          {isEditing ? (
            <input className="w-full border p-2" value={formData.referral_source} onChange={e => handleChange('referral_source', e.target.value)} />
          ) : (
            <div className="p-2 bg-gray-50 border">{formData.referral_source || 'N/A'}</div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Referring Officer</label>
          {isEditing ? (
            <input className="w-full border p-2" value={formData.referring_officer} onChange={e => handleChange('referring_officer', e.target.value)} />
          ) : (
            <div className="p-2 bg-gray-50 border">{formData.referring_officer || 'N/A'}</div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ward Number</label>
          {isEditing ? (
            <input className="w-full border p-2" value={formData.ward_number} onChange={e => handleChange('ward_number', e.target.value)} />
          ) : (
            <div className="p-2 bg-gray-50 border">{formData.ward_number || 'N/A'}</div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Clinical Category</label>
          {isEditing ? (
            <input className="w-full border p-2" value={formData.clinical_category} onChange={e => handleChange('clinical_category', e.target.value)} />
          ) : (
            <div className="p-2 bg-gray-50 border">{formData.clinical_category || 'N/A'}</div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">MLEF Serial Number</label>
          {isEditing ? (
            <input className="w-full border p-2" value={formData.mlef_serial_number} onChange={e => handleChange('mlef_serial_number', e.target.value)} />
          ) : (
            <div className="p-2 bg-gray-50 border">{formData.mlef_serial_number || 'N/A'}</div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Referral Date & Time</label>
          {isEditing ? (
            <input type="datetime-local" className="w-full border p-2" value={formData.referral_date_time} onChange={e => handleChange('referral_date_time', e.target.value)} />
          ) : (
            <div className="p-2 bg-gray-50 border">{formData.referral_date_time ? new Date(formData.referral_date_time).toLocaleString() : 'N/A'}</div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold border-b pb-2 mb-4">Incident & Medical History</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Incident Date & Time</label>
            {isEditing ? (
              <input type="datetime-local" className="w-full border p-2" value={formData.incident_date_time} onChange={e => handleChange('incident_date_time', e.target.value)} />
            ) : (
              <div className="p-2 bg-gray-50 border">{formData.incident_date_time ? new Date(formData.incident_date_time).toLocaleString() : 'N/A'}</div>
            )}
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Incident Description</label>
            {isEditing ? (
              <textarea className="w-full border p-2" rows={3} value={formData.incident_description} onChange={e => handleChange('incident_description', e.target.value)} />
            ) : (
              <div className="p-2 bg-gray-50 border whitespace-pre-wrap">{formData.incident_description || 'N/A'}</div>
            )}
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Past Medical History</label>
            {isEditing ? (
              <textarea className="w-full border p-2" rows={3} value={formData.past_medical_history} onChange={e => handleChange('past_medical_history', e.target.value)} />
            ) : (
              <div className="p-2 bg-gray-50 border whitespace-pre-wrap">{formData.past_medical_history || 'N/A'}</div>
            )}
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Examination Findings</label>
            {isEditing ? (
              <textarea className="w-full border p-2" rows={3} value={formData.examination_findings} onChange={e => handleChange('examination_findings', e.target.value)} />
            ) : (
              <div className="p-2 bg-gray-50 border whitespace-pre-wrap">{formData.examination_findings || 'N/A'}</div>
            )}
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Provisional Diagnosis</label>
            {isEditing ? (
              <textarea className="w-full border p-2" rows={2} value={formData.provisional_diagnosis} onChange={e => handleChange('provisional_diagnosis', e.target.value)} />
            ) : (
              <div className="p-2 bg-gray-50 border whitespace-pre-wrap">{formData.provisional_diagnosis || 'N/A'}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
