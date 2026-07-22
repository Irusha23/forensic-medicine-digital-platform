import React, { useEffect, useState } from 'react';
import api from '../../api/client';

export const MediaGallery = ({ caseId, caseType }: { caseId: string, caseType?: string }) => {
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [uploading, setUploading] = useState(false);

  const isClinical = caseType === 'Clinical';
  
  const clinicalCategories = [
    'Photographs', 'Videos', 'Audio', 'General Evidence', 'Other'
  ];
  
  const autopsyCategories = [
    'Photographs', 'Videos', 'Audio', 'General Evidence', 'Other'
  ];

  const availableCategories = isClinical ? clinicalCategories : autopsyCategories;

  useEffect(() => {
    if (!category && availableCategories.length > 0) {
      setCategory(availableCategories[0]);
    }
  }, [availableCategories, category]);

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
      const res = await api.get(`/media/download/${mediaId}`, { responseType: 'blob' });
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
    if (!uploadFile || !category) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('category', category);
      if (description) {
        formData.append('description', description);
      }
      await api.post(`/cases/${caseId}/media`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadFile(null);
      setDescription('');
      fetchMedia();
    } catch (err) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div>Loading media...</div>;

  const groupedMedia = availableCategories.reduce((acc, cat) => {
    acc[cat] = mediaItems.filter(m => m.category === cat);
    return acc;
  }, {} as Record<string, any[]>);

  const uncategorized = mediaItems.filter(m => !m.category || !availableCategories.includes(m.category));
  if (uncategorized.length > 0) {
    groupedMedia['Other'] = [...(groupedMedia['Other'] || []), ...uncategorized];
  }

  return (
    <div className="space-y-6">
      {error && <div className="text-red-600 bg-red-100 p-2">{error}</div>}
      
      <form onSubmit={handleUpload} className="flex flex-col gap-4 bg-gray-50 p-4 border border-gray-200 rounded">
        <h3 className="font-semibold text-lg text-gray-700">Upload New Document</h3>
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-gray-300 rounded p-2 text-sm bg-white"
            data-testid="document-category-select"
          >
            {availableCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input 
            type="file" 
            onChange={(e) => setUploadFile(e.target.files?.[0] || null)} 
            className="text-sm border border-gray-300 rounded p-1 flex-1"
            data-testid="document-file-input"
          />
          <input 
            type="text" 
            placeholder="Add a description (optional)..." 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border border-gray-300 rounded p-2 text-sm flex-1"
            data-testid="document-description-input"
          />
          <button type="submit" disabled={!uploadFile || uploading} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded disabled:opacity-50 text-sm whitespace-nowrap transition-colors" data-testid="upload-document-button">
            {uploading ? 'Uploading...' : 'Upload Document'}
          </button>
        </div>
      </form>

      <div className="space-y-6 mt-6">
        <h3 className="font-semibold text-xl text-gray-800 border-b pb-2">Document Gallery</h3>
        {availableCategories.map(cat => {
          const items = groupedMedia[cat] || [];
          return (
            <div key={cat} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden" data-testid={`category-section-${cat.replace(/\s+/g, '-')}`}>
              <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                <h4 className="font-medium text-gray-800">{cat}</h4>
                <span className="text-xs text-gray-500 font-semibold bg-gray-200 px-2 py-1 rounded-full">{items.length} file{items.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="p-4">
                {items.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No files uploaded.</p>
                ) : (
                  <ul className="space-y-3">
                    {items.map((m: any) => (
                      <li key={m.media_id} className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100 hover:border-blue-200 transition-colors">
                        <div className="flex flex-col">
                          <span className="font-medium text-sm text-gray-800" data-testid={`filename-${m.media_id}`}>{m.file_path ? m.file_path.split('/').pop() : 'Unknown file'}</span>
                          {m.description && <span className="text-xs text-gray-500 mt-1">{m.description}</span>}
                        </div>
                        <button 
                          onClick={() => handleDownload(m.media_id, m.file_path ? m.file_path.split('/').pop() : 'download')}
                          className="text-sm bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 py-1 px-4 rounded shadow-sm transition-colors"
                          data-testid={`download-button-${m.media_id}`}
                        >
                          Download
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
