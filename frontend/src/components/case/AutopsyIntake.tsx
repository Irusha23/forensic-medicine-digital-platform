import React, { useState } from 'react';
import api from '../../api/client';

export const AutopsyIntake = ({ caseData, onUpdate }: { caseData: any, onUpdate: () => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Local state for the form
  const [formData, setFormData] = useState({
    postmortem_number: caseData.autopsy_case?.postmortem_number || '',
    death_category: caseData.autopsy_case?.death_category || '',
    place_of_death: caseData.autopsy_case?.place_of_death || '',
    date_time_of_death: caseData.autopsy_case?.date_time_of_death ? new Date(caseData.autopsy_case.date_time_of_death).toISOString().slice(0, 16) : '',
    notification_source: caseData.autopsy_case?.notification_source || '',
    notification_date_time: caseData.autopsy_case?.notification_date_time ? new Date(caseData.autopsy_case.notification_date_time).toISOString().slice(0, 16) : '',
    informing_officer: caseData.autopsy_case?.informing_officer || '',
    body_received_date_time: caseData.autopsy_case?.body_received_date_time ? new Date(caseData.autopsy_case.body_received_date_time).toISOString().slice(0, 16) : '',
    receiving_officer: caseData.autopsy_case?.receiving_officer || '',
    condition_upon_arrival: caseData.autopsy_case?.condition_upon_arrival || '',
    identification_status: caseData.autopsy_case?.identification_status || ''
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        autopsy: {
          ...formData,
          date_time_of_death: formData.date_time_of_death ? new Date(formData.date_time_of_death).toISOString() : null,
          notification_date_time: formData.notification_date_time ? new Date(formData.notification_date_time).toISOString() : null,
          body_received_date_time: formData.body_received_date_time ? new Date(formData.body_received_date_time).toISOString() : null,
        }
      };
      await api.put(`/cases/${caseData.case_id}`, payload);
      setIsEditing(false);
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save autopsy intake details');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Autopsy Intake Information</h2>
        {!isEditing ? (
          <button 
            className="bg-gray-100 text-gray-700 px-4 py-2 hover:bg-gray-200 border border-gray-300 font-medium"
            onClick={() => setIsEditing(true)}
          >
            Edit Intake
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
          <label className="block text-sm font-medium mb-1">Postmortem Number</label>
          {isEditing ? (
            <input className="w-full border p-2" value={formData.postmortem_number} onChange={e => handleChange('postmortem_number', e.target.value)} />
          ) : (
            <div className="p-2 bg-gray-50 border">{formData.postmortem_number || 'N/A'}</div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Death Category</label>
          {isEditing ? (
            <input className="w-full border p-2" value={formData.death_category} onChange={e => handleChange('death_category', e.target.value)} />
          ) : (
            <div className="p-2 bg-gray-50 border">{formData.death_category || 'N/A'}</div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Place of Death</label>
          {isEditing ? (
            <input className="w-full border p-2" value={formData.place_of_death} onChange={e => handleChange('place_of_death', e.target.value)} />
          ) : (
            <div className="p-2 bg-gray-50 border">{formData.place_of_death || 'N/A'}</div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date & Time of Death</label>
          {isEditing ? (
            <input type="datetime-local" className="w-full border p-2" value={formData.date_time_of_death} onChange={e => handleChange('date_time_of_death', e.target.value)} />
          ) : (
            <div className="p-2 bg-gray-50 border">{formData.date_time_of_death ? new Date(formData.date_time_of_death).toLocaleString() : 'N/A'}</div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold border-b pb-2 mb-4">Notification & Body Reception</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Notification Source</label>
            {isEditing ? (
              <input className="w-full border p-2" value={formData.notification_source} onChange={e => handleChange('notification_source', e.target.value)} />
            ) : (
              <div className="p-2 bg-gray-50 border">{formData.notification_source || 'N/A'}</div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notification Date & Time</label>
            {isEditing ? (
              <input type="datetime-local" className="w-full border p-2" value={formData.notification_date_time} onChange={e => handleChange('notification_date_time', e.target.value)} />
            ) : (
              <div className="p-2 bg-gray-50 border">{formData.notification_date_time ? new Date(formData.notification_date_time).toLocaleString() : 'N/A'}</div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Informing Officer</label>
            {isEditing ? (
              <input className="w-full border p-2" value={formData.informing_officer} onChange={e => handleChange('informing_officer', e.target.value)} />
            ) : (
              <div className="p-2 bg-gray-50 border">{formData.informing_officer || 'N/A'}</div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Body Received Date & Time</label>
            {isEditing ? (
              <input type="datetime-local" className="w-full border p-2" value={formData.body_received_date_time} onChange={e => handleChange('body_received_date_time', e.target.value)} />
            ) : (
              <div className="p-2 bg-gray-50 border">{formData.body_received_date_time ? new Date(formData.body_received_date_time).toLocaleString() : 'N/A'}</div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Receiving Officer</label>
            {isEditing ? (
              <input className="w-full border p-2" value={formData.receiving_officer} onChange={e => handleChange('receiving_officer', e.target.value)} />
            ) : (
              <div className="p-2 bg-gray-50 border">{formData.receiving_officer || 'N/A'}</div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Condition Upon Arrival</label>
            {isEditing ? (
              <input className="w-full border p-2" value={formData.condition_upon_arrival} onChange={e => handleChange('condition_upon_arrival', e.target.value)} />
            ) : (
              <div className="p-2 bg-gray-50 border">{formData.condition_upon_arrival || 'N/A'}</div>
            )}
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Identification Status</label>
            {isEditing ? (
              <input className="w-full border p-2" value={formData.identification_status} onChange={e => handleChange('identification_status', e.target.value)} />
            ) : (
              <div className="p-2 bg-gray-50 border">{formData.identification_status || 'N/A'}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
