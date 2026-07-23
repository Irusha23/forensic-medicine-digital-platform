import React, { useState } from 'react';
import api from '../../api/client';

interface AggregateReportModalProps {
  onClose: () => void;
}

export const AggregateReportModal = ({ onClose }: AggregateReportModalProps) => {
  const [reportType, setReportType] = useState('daily');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [monthStr, setMonthStr] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setError('');
    
    try {
      let endpoint = '';
      const params = new URLSearchParams();

      if (reportType === 'daily') {
        endpoint = '/reports/daily';
        if (date) params.append('date', date);
      } else if (reportType === 'monthly') {
        endpoint = '/reports/monthly';
        if (monthStr) {
          const [y, m] = monthStr.split('-');
          params.append('month', parseInt(m, 10).toString());
          params.append('year', parseInt(y, 10).toString());
        }
      } else if (reportType === 'pending') {
        endpoint = '/reports/pending';
      } else if (reportType === 'court') {
        endpoint = '/reports/court';
      } else if (reportType === 'statistical') {
        endpoint = '/reports/statistical';
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
      }

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const pdfRes = await api.get(`${endpoint}${queryString}`, { responseType: 'blob' });
      
      const url = window.URL.createObjectURL(new Blob([pdfRes.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}_report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      
      onClose();
    } catch (err: any) {
      if (err.response?.data instanceof Blob) {
        const text = await err.response.data.text();
        try {
          const json = JSON.parse(text);
          setError(json.error || 'Failed to generate report.');
        } catch {
          setError('Failed to generate report.');
        }
      } else {
        setError('Failed to generate report. Make sure you have permission and backend is running.');
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg max-w-lg w-full p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-xl"
        >
          &times;
        </button>
        
        <h2 className="text-xl font-bold mb-4">Generate System Report</h2>
        {error && <div className="bg-red-100 text-red-700 p-2 text-sm mb-4 rounded">{error}</div>}
        
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Report Type</label>
            <select 
              required
              className="w-full border p-2 bg-white rounded"
              value={reportType}
              onChange={e => setReportType(e.target.value)}
            >
              <option value="daily">Daily Case Report</option>
              <option value="monthly">Monthly Report</option>
              <option value="pending">Pending Cases Report</option>
              <option value="court">Court Report</option>
              <option value="statistical">Statistical Report</option>
            </select>
          </div>

          {reportType === 'daily' && (
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input 
                type="date" 
                required
                className="w-full border p-2 rounded" 
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </div>
          )}

          {reportType === 'monthly' && (
            <div>
              <label className="block text-sm font-medium mb-1">Month</label>
              <input 
                type="month" 
                required
                className="w-full border p-2 rounded" 
                value={monthStr}
                onChange={e => setMonthStr(e.target.value)}
              />
            </div>
          )}

          {reportType === 'statistical' && (
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium mb-1">Start Date (Optional)</label>
                <input 
                  type="date" 
                  className="w-full border p-2 rounded" 
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium mb-1">End Date (Optional)</label>
                <input 
                  type="date" 
                  className="w-full border p-2 rounded" 
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                />
              </div>
            </div>
          )}
          
          <div className="pt-4 flex justify-end space-x-3 border-t">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 font-medium rounded"
              disabled={generating}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded flex items-center"
              disabled={generating}
            >
              {generating ? 'Generating PDF...' : 'Download Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
