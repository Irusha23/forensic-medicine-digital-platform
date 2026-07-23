import React, { useEffect, useState } from 'react';
import api from '../../api/client';

export const Documents = ({ caseId }: { caseId: string }) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [dateReceived, setDateReceived] = useState('');
  const [dateIssued, setDateIssued] = useState('');
  const [issuingAuthority, setIssuingAuthority] = useState('');
  const [remarks, setRemarks] = useState('');

  const fetchDocuments = async () => {
    try {
      const res = await api.get(`/cases/${caseId}/documents`);
      setDocuments(res.data);
    } catch (err: any) {
      setError('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [caseId]);

  const handleDownload = async (documentId: string, filename: string) => {
    try {
      const res = await api.get(`/cases/documents/download/${documentId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      alert('Failed to download document');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('title', title);
      formData.append('document_type', documentType);
      formData.append('date_received', dateReceived);
      formData.append('date_issued', dateIssued);
      formData.append('issuing_authority', issuingAuthority);
      formData.append('remarks', remarks);
      await api.post(`/cases/${caseId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadFile(null);
      setTitle('');
      setDocumentType('');
      setDateReceived('');
      setDateIssued('');
      setIssuingAuthority('');
      setRemarks('');
      fetchDocuments();
    } catch (err) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div>Loading documents...</div>;

  return (
    <div className="space-y-4">
      {error && <div className="text-red-600 bg-red-100 p-2">{error}</div>}
      
      <form onSubmit={handleUpload} className="bg-gray-50 p-4 border border-gray-200 rounded space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Document Title *</label>
            <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="p-2 border border-gray-300 rounded text-sm w-full" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="documentCategory">Document Category *</label>
            <select id="documentCategory" data-testid="document-category-select" required value={documentType} onChange={(e) => setDocumentType(e.target.value)} className="p-2 border border-gray-300 rounded text-sm w-full">
              <option value="">Select a category</option>
              <option value="MLEF">MLEF</option>
              <option value="Analyst Report">Analyst Report</option>
              <option value="Medical Records">Medical Records</option>
              <option value="Court Order">Court Order</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Issuing Authority</label>
            <input type="text" value={issuingAuthority} onChange={(e) => setIssuingAuthority(e.target.value)} className="p-2 border border-gray-300 rounded text-sm w-full" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date Issued</label>
            <input type="date" value={dateIssued} onChange={(e) => setDateIssued(e.target.value)} className="p-2 border border-gray-300 rounded text-sm w-full" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date Received</label>
            <input type="date" value={dateReceived} onChange={(e) => setDateReceived(e.target.value)} className="p-2 border border-gray-300 rounded text-sm w-full" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">File *</label>
            <input required type="file" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} className="text-sm w-full" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Remarks</label>
          <input type="text" value={remarks} onChange={(e) => setRemarks(e.target.value)} className="p-2 border border-gray-300 rounded text-sm w-full" />
        </div>
        <button type="submit" disabled={!uploadFile || uploading} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 text-sm hover:bg-blue-700">
          {uploading ? 'Uploading...' : 'Upload Document'}
        </button>
      </form>

      {documents.length === 0 ? (
        <div className="p-4 text-center text-gray-500 border border-gray-300 rounded">No documents attached to this case.</div>
      ) : (
        Object.entries(
          documents.reduce((acc: any, doc: any) => {
            const type = doc.document_type || 'Other';
            if (!acc[type]) acc[type] = [];
            acc[type].push(doc);
            return acc;
          }, {})
        ).map(([category, docs]: [string, any]) => (
          <div key={category} className="mb-6">
            <h3 className="text-lg font-semibold mb-2 bg-gray-100 p-2 rounded">{category}</h3>
            <table className="w-full text-left border-collapse text-sm border border-gray-300">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-300">
                  <th className="p-2 border-r border-gray-300">Title</th>
                  <th className="p-2 border-r border-gray-300 hidden md:table-cell">Issuing Authority</th>
                  <th className="p-2 border-r border-gray-300 hidden md:table-cell">Received</th>
                  <th className="p-2 border-r border-gray-300">Filename</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((d: any) => (
                  <tr key={d.document_id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-2 border-r border-gray-300 font-semibold">{d.title || 'Untitled'}</td>
                    <td className="p-2 border-r border-gray-300 hidden md:table-cell">{d.issuing_authority || '-'}</td>
                    <td className="p-2 border-r border-gray-300 hidden md:table-cell">{d.date_received ? new Date(d.date_received).toLocaleDateString() : '-'}</td>
                    <td className="p-2 border-r border-gray-300 font-mono text-xs">{d.file_path ? d.file_path.split('/').pop() : 'Unknown'}</td>
                    <td className="p-2">
                      <button 
                        onClick={() => handleDownload(d.document_id, d.file_path ? d.file_path.split('/').pop() : 'download')}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
};
