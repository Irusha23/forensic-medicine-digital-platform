import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';

export const NotificationBell = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/unread');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: string, caseId?: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.filter(n => String(n.notification_id) !== String(id)));
      if (caseId) {
        navigate(`/cases/${caseId}`);
        setIsOpen(false);
      }
    } catch (err) {
      console.error('Failed to mark notification as read');
    }
  };

  return (
    <div className="relative">
      <button 
        className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded shadow-lg z-50">
          <div className="p-3 border-b font-semibold text-gray-700">Notifications</div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">No new notifications</div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.notification_id} 
                  className="p-3 border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => markAsRead(n.notification_id, n.case_id)}
                >
                  <div className="text-sm font-semibold">{n.title}</div>
                  <div className="text-xs text-gray-600 mt-1">{n.message}</div>
                  <div className="text-[10px] text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
