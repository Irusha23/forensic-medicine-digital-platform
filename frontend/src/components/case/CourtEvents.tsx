import React, { useEffect, useState } from 'react';
import api from '../../api/client';

export const CourtEvents = ({ caseId }: { caseId: string }) => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Add new event state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    event_date: '',
    event_type: '',
    court_name: '',
    outcome_or_response: ''
  });
  const [saving, setSaving] = useState(false);

  const fetchEvents = async () => {
    try {
      const res = await api.get(`/cases/${caseId}/court-events`);
      setEvents(res.data);
    } catch (err) {
      setError('Failed to load court events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [caseId]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...newEvent,
        event_date: newEvent.event_date ? new Date(newEvent.event_date).toISOString() : null
      };
      await api.post(`/cases/${caseId}/court-events`, payload);
      setNewEvent({ event_date: '', event_type: '', court_name: '', outcome_or_response: '' });
      setShowAddForm(false);
      fetchEvents();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add event');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await api.delete(`/cases/${caseId}/court-events/${eventId}`);
      fetchEvents();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete event');
    }
  };

  if (loading) return <div>Loading court events...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Court Events</h2>
        <button 
          className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 font-medium"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel Add' : 'Add Court Event'}
        </button>
      </div>

      {error && <div className="text-red-600">{error}</div>}

      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="bg-gray-50 border border-gray-300 p-4 mb-6">
          <h3 className="font-semibold mb-3">Add New Court Event</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Event Date</label>
              <input type="date" required className="w-full border p-2" value={newEvent.event_date} onChange={e => setNewEvent({...newEvent, event_date: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Event Type</label>
              <select required className="w-full border p-2" value={newEvent.event_type} onChange={e => setNewEvent({...newEvent, event_type: e.target.value})}>
                <option value="" disabled>Select...</option>
                <option value="HEARING">Hearing</option>
                <option value="TRIAL">Trial</option>
                <option value="SUMMONS">Summons</option>
                <option value="TESTIMONY">Testimony</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Court Name</label>
              <input type="text" required className="w-full border p-2" value={newEvent.court_name} onChange={e => setNewEvent({...newEvent, court_name: e.target.value})} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Outcome or Response</label>
              <textarea className="w-full border p-2" rows={2} value={newEvent.outcome_or_response} onChange={e => setNewEvent({...newEvent, outcome_or_response: e.target.value})}></textarea>
            </div>
          </div>
          <button type="submit" disabled={saving} className="mt-4 bg-green-600 text-white px-4 py-2 hover:bg-green-700">
            {saving ? 'Saving...' : 'Save Event'}
          </button>
        </form>
      )}

      {events.length === 0 && !showAddForm ? (
        <div className="text-gray-500 italic p-4 text-center border">No court events recorded.</div>
      ) : (
        <div className="space-y-4">
          {events.map(event => (
            <div key={event.court_event_id} className="border border-gray-300 p-4 bg-white relative">
              <button 
                onClick={() => handleDelete(event.court_event_id)}
                className="absolute top-4 right-4 text-red-500 hover:text-red-700 text-sm font-medium"
              >
                Delete
              </button>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="font-medium text-gray-500">Date:</span> {new Date(event.event_date).toLocaleDateString()}</div>
                <div><span className="font-medium text-gray-500">Type:</span> {event.event_type}</div>
                <div className="col-span-2"><span className="font-medium text-gray-500">Court Name:</span> {event.court_name}</div>
                {event.outcome_or_response && (
                  <div className="col-span-2 mt-2">
                    <span className="font-medium text-gray-500 block mb-1">Outcome / Response:</span>
                    <div className="bg-gray-50 p-2 whitespace-pre-wrap">{event.outcome_or_response}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
