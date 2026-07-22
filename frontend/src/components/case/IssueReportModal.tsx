import React, { useState } from 'react';
import api from '../../api/client';

interface IssueReportModalProps {
  caseId: string;
  caseNumber?: string;
  onClose: () => void;
}

export const IssueReportModal = ({ caseId, caseNumber, onClose }: IssueReportModalProps) => {
  const [formData, setFormData] = useState({
    report_type: 'postmortem',
    recipient_name: '',
    method_of_delivery: 'Hand Delivered',
    final_opinion: ''
  });
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setError('');
    
    try {
      // First issue the report in the database
      await api.post(`/cases/${caseId}/report/issue`, formData);
      
      // Then download the PDF blob
      const pdfRes = await api.get(`/cases/${caseId}/report?reportType=${formData.report_type}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([pdfRes.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `case_${caseNumber || caseId}_report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      
      onClose(); // Close modal on success
    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.data instanceof Blob) {
        const text = await err.response.data.text();
        try {
          const json = JSON.parse(text);
          setError(json.error || 'Failed to generate report.');
        } catch {
          setError('Failed to generate report.');
        }
      } else {
        setError('Failed to generate report. Make sure all backend services are running.');
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
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold"
        >
          &times;
        </button>
        
        <h2 className="text-xl font-bold mb-4">Issue Official Report</h2>
        {error && <div className="bg-red-100 text-red-700 p-2 text-sm mb-4">{error}</div>}
        
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Report Type</label>
            <select 
              required
              className="w-full border p-2 bg-white"
              value={formData.report_type}
              onChange={e => handleChange('report_type', e.target.value)}
            >
              <option value="postmortem">Postmortem Report</option>
              <option value="clinical">Clinical Report</option>
              <option value="toxicology">Toxicology Report</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Recipient Name / Designation</label>
            <input 
              required
              type="text" 
              className="w-full border p-2" 
              placeholder="e.g. Inspector Perera"
              value={formData.recipient_name}
              onChange={e => handleChange('recipient_name', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Method of Delivery</label>
            <select 
              required
              className="w-full border p-2 bg-white"
              value={formData.method_of_delivery}
              onChange={e => handleChange('method_of_delivery', e.target.value)}
            >
              <option value="Hand Delivered">Hand Delivered</option>
              <option value="Registered Post">Registered Post</option>
              <option value="Email">Email</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Final Opinion / Conclusion</label>
            <textarea 
              className="w-full border p-2" 
              rows={3} 
              placeholder="Final concluding remarks for the report..."
              value={formData.final_opinion}
              onChange={e => handleChange('final_opinion', e.target.value)}
            ></textarea>
          </div>
          
          <div className="pt-4 flex justify-end space-x-3 border-t">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 font-medium"
              disabled={generating}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium flex items-center"
              disabled={generating}
            >
              {generating ? 'Generating PDF...' : 'Generate & Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
