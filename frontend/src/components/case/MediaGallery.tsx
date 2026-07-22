import React, { useEffect, useState } from 'react';
import api from '../../api/client';

export const MediaGallery = ({ caseId }: { caseId: string }) => {
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchMedia = async () => {
    try {
      const res = await api.get(`/cases/${caseId}/media`);
      setMediaItems(res.data);
    } catch (err: any) {
      setError('Failed to fetch media');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [caseId]);

  const handleDownload = async (mediaId: string, filename: string) => {
    try {
      const res = await api.get(`/media/download/${mediaId}`, { responseType: 'blob' }); // Keep the old endpoint for download for now, or change to `/cases/${caseId}/media/${mediaId}` if we had it. Wait, we can keep the old one since it doesn't matter as much, but let's change to use the existing downloadEndpoint `/media/download/${mediaId}` since we didn't add `/cases/:id/media/:mediaId` download. Actually, the user asked for `/api/cases/:id/media` and `/api/cases/:id/documents` for the Phase 1 execution. Let's just use `/media/download/${mediaId}` as before.
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      alert('Failed to download media');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      await api.post(`/cases/${caseId}/media`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadFile(null);
      fetchMedia();
    } catch (err) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div>Loading media...</div>;

  return (
    <div className="space-y-4">
      {error && <div className="text-red-600 bg-red-100 p-2">{error}</div>}
      
      <form onSubmit={handleUpload} className="flex gap-4 items-center bg-gray-50 p-4 border border-gray-200 rounded">
        <input type="file" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} className="text-sm" />
        <button type="submit" disabled={!uploadFile || uploading} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 text-sm">
          {uploading ? 'Uploading...' : 'Upload Media'}
        </button>
      </form>

      <table className="w-full text-left border-collapse text-sm border border-gray-300">
        <thead>
          <tr className="bg-gray-100 border-b border-gray-300">
            <th className="p-2 border-r border-gray-300">Filename</th>
            <th className="p-2 border-r border-gray-300">Type</th>
            <th className="p-2 border-r border-gray-300">Description</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {mediaItems.length === 0 ? (
            <tr><td colSpan={4} className="p-4 text-center text-gray-500">No media attached to this case.</td></tr>
          ) : (
            mediaItems.map((m: any) => (
              <tr key={m.media_id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="p-2 border-r border-gray-300 font-mono text-xs">{m.file_path ? m.file_path.split('/').pop() : 'Unknown'}</td>
                <td className="p-2 border-r border-gray-300">{m.media_type || 'File'}</td>
                <td className="p-2 border-r border-gray-300">{m.category || 'N/A'}</td>
                <td className="p-2">
                  <button 
                    onClick={() => handleDownload(m.media_id, m.file_path ? m.file_path.split('/').pop() : 'download')}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Download
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
