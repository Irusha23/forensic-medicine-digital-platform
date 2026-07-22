import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { SearchableSelect } from '../common/SearchableSelect';

export const Authorizations = ({ caseId, caseType }: { caseId: string, caseType?: string }) => {
  const [authorizations, setAuthorizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [documents, setDocuments] = useState<any[]>([]);
  const [docUploadFile, setDocUploadFile] = useState<File | null>(null);
  const [docDescription, setDocDescription] = useState('');
  const [docCategory, setDocCategory] = useState('');
  const [docUploading, setDocUploading] = useState(false);

  const isClinical = caseType === 'Clinical';
  const clinicalDocCategories = ['MLR', 'Investigation Findings', 'Referral Reports'];
  const autopsyDocCategories = ['PMR', 'Cause of Death Form', 'Pre-autopsy Information', 'Investigation Findings'];
  const availableDocCategories = isClinical ? clinicalDocCategories : autopsyDocCategories;

  useEffect(() => {
    if (!docCategory && availableDocCategories.length > 0) {
      setDocCategory(availableDocCategories[0]);
    }
  }, [availableDocCategories, docCategory]);

  // Base fields
  const [authType, setAuthType] = useState('COURT_ORDER');
  const [issuingAuthority, setIssuingAuthority] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [remarks, setRemarks] = useState('');

  // Subtype fields
  const [courtOrderNumber, setCourtOrderNumber] = useState('');
  const [courtCaseNumber, setCourtCaseNumber] = useState('');
  const [courtName, setCourtName] = useState('');
  
  const [inquestOrderNumber, setInquestOrderNumber] = useState('');
  const [isdOfficerName, setIsdOfficerName] = useState('');
  const [policeStation, setPoliceStation] = useState('');
  
  const [mlefNumber, setMlefNumber] = useState('');
  const [courtDate, setCourtDate] = useState('');

  // Request Letter fields
  const [referenceNumber, setReferenceNumber] = useState('');
  const [requestingInstitution, setRequestingInstitution] = useState('');
  const [requestingOfficer, setRequestingOfficer] = useState('');

  const clinicalAuthTypes = [
    { value: 'COURT_ORDER', label: 'Court Order' },
    { value: 'MLEF', label: 'Medico-Legal Examination Form (MLEF)' },
    { value: 'REQUEST_LETTER', label: 'Request Letter' },
    { value: 'SUMMON', label: 'Summon' },
  ];
  const autopsyAuthTypes = [
    { value: 'COURT_ORDER', label: 'Court Order' },
    { value: 'INQUEST_ORDER', label: 'Inquest Order' },
    { value: 'SUMMON', label: 'Summon' },
  ];
  const availableAuthTypes = isClinical ? clinicalAuthTypes : autopsyAuthTypes;

  useEffect(() => {
    if (!availableAuthTypes.some(t => t.value === authType)) {
      setAuthType(availableAuthTypes[0].value);
    }
  }, [availableAuthTypes, authType]);

  const fetchPoliceStations = async (query: string) => {
    const res = await api.get('/police-stations');
    const filtered = res.data.filter((s: any) => 
      `${s.station_name} ${s.district || ''}`.toLowerCase().includes(query.toLowerCase())
    );
    return filtered.map((s: any) => ({
      label: `${s.station_name} ${s.district ? `(${s.district})` : ''}`,
      value: s.station_name // Using station_name as value per existing logic
    }));
  };

  const fetchCourts = async (query: string) => {
    const res = await api.get('/courts');
    const filtered = res.data.filter((c: any) => 
      c.court_name.toLowerCase().includes(query.toLowerCase())
    );
    return filtered.map((c: any) => ({
      label: c.court_name,
      value: c.court_name // Using court_name as value per existing logic
    }));
  };

  const fetchAuthorizations = async () => {
    try {
      const res = await api.get(`/cases/${caseId}/authorizations`);
      setAuthorizations(res.data);
    } catch (err: any) {
      setError('Failed to fetch authorizations');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await api.get(`/cases/${caseId}/media`);
      const docs = res.data.filter((m: any) => availableDocCategories.includes(m.category));
      setDocuments(docs);
    } catch (err: any) {
      console.error('Failed to fetch documents', err);
    }
  };

  useEffect(() => {
    fetchAuthorizations();
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

  const handleMediaDownload = async (mediaId: string, filename: string) => {
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
      alert('Failed to download document');
    }
  };

  const handleDocUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docUploadFile || !docCategory) return;
    setDocUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', docUploadFile);
      formData.append('category', docCategory);
      if (docDescription) {
        formData.append('description', docDescription);
      }
      await api.post(`/cases/${caseId}/media`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setDocUploadFile(null);
      setDocDescription('');
      fetchDocuments();
    } catch (err) {
      alert('Upload failed');
    } finally {
      setDocUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('authorization_type', authType);
      formData.append('issuing_authority', issuingAuthority);
      if (issueDate) formData.append('issue_date', issueDate);
      if (remarks) formData.append('remarks', remarks);

      if (authType === 'COURT_ORDER') {
        formData.append('court_order_number', courtOrderNumber);
        formData.append('court_case_number', courtCaseNumber);
        formData.append('court_name', courtName);
      } else if (authType === 'INQUEST_ORDER') {
        formData.append('inquest_order_number', inquestOrderNumber);
        formData.append('isd_officer_name', isdOfficerName);
        formData.append('police_station', policeStation);
      } else if (authType === 'SUMMON') {
        formData.append('MLEF_number', mlefNumber);
        formData.append('court_case_number', courtCaseNumber);
        formData.append('court_name', courtName);
        if (courtDate) formData.append('court_date', courtDate);
      } else if (authType === 'MLEF') {
        formData.append('MLEF_number', mlefNumber);
        formData.append('police_station', policeStation);
      } else if (authType === 'REQUEST_LETTER') {
        formData.append('reference_number', referenceNumber);
        formData.append('requesting_institution', requestingInstitution);
        formData.append('requesting_officer', requestingOfficer);
      }

      if (uploadFile) {
        formData.append('file', uploadFile);
      }

      await api.post(`/cases/${caseId}/authorizations`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Reset form
      setIssuingAuthority('');
      setIssueDate('');
      setRemarks('');
      setCourtOrderNumber('');
      setCourtCaseNumber('');
      setCourtName('');
      setInquestOrderNumber('');
      setIsdOfficerName('');
      setPoliceStation('');
      setMlefNumber('');
      setCourtDate('');
      setReferenceNumber('');
      setRequestingInstitution('');
      setRequestingOfficer('');
      setUploadFile(null);
      
      fetchAuthorizations();
    } catch (err) {
      alert('Failed to add authorization');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div>Loading authorizations...</div>;

  const groupedDocs = availableDocCategories.reduce((acc, cat) => {
    acc[cat] = documents.filter(m => m.category === cat);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6">
      {error && <div className="text-red-600 bg-red-100 p-2">{error}</div>}

      <div className="bg-white p-4 border border-gray-200 rounded shadow-sm">
        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Add Legal Authorization</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="block text-gray-700 mb-1">Authorization Type</label>
            <select value={authType} onChange={(e) => setAuthType(e.target.value)} className="w-full p-2 border border-gray-300 rounded" required>
              {availableAuthTypes.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Issuing Authority</label>
            <input type="text" value={issuingAuthority} onChange={(e) => setIssuingAuthority(e.target.value)} className="w-full p-2 border border-gray-300 rounded" required />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Issue Date</label>
            <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded" />
          </div>

          {/* Type-Specific Fields */}
          {authType === 'COURT_ORDER' && (
            <>
              <div>
                <label className="block text-gray-700 mb-1">Court Order Number</label>
                <input type="text" value={courtOrderNumber} onChange={(e) => setCourtOrderNumber(e.target.value)} className="w-full p-2 border border-gray-300 rounded" required />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Court Case Number</label>
                <input type="text" value={courtCaseNumber} onChange={(e) => setCourtCaseNumber(e.target.value)} className="w-full p-2 border border-gray-300 rounded" />
              </div>
              <div className="relative z-30">
                <label className="block text-gray-700 mb-1">Court Name</label>
                <SearchableSelect
                  value={courtName}
                  onChange={setCourtName}
                  fetchOptions={fetchCourts}
                  placeholder="Search for a court..."
                />
              </div>
            </>
          )}

          {authType === 'INQUEST_ORDER' && (
            <>
              <div>
                <label className="block text-gray-700 mb-1">Inquest Order Number</label>
                <input type="text" value={inquestOrderNumber} onChange={(e) => setInquestOrderNumber(e.target.value)} className="w-full p-2 border border-gray-300 rounded" required />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">ISD Officer Name</label>
                <input type="text" value={isdOfficerName} onChange={(e) => setIsdOfficerName(e.target.value)} className="w-full p-2 border border-gray-300 rounded" />
              </div>
              <div className="relative z-20">
                <label className="block text-gray-700 mb-1">Police Station</label>
                <SearchableSelect
                  value={policeStation}
                  onChange={setPoliceStation}
                  fetchOptions={fetchPoliceStations}
                  placeholder="Search for a police station..."
                />
              </div>
            </>
          )}

          {authType === 'MLEF' && (
            <>
              <div>
                <label className="block text-gray-700 mb-1">MLEF Number</label>
                <input type="text" value={mlefNumber} onChange={(e) => setMlefNumber(e.target.value)} className="w-full p-2 border border-gray-300 rounded" required />
              </div>
              <div className="relative z-20">
                <label className="block text-gray-700 mb-1">Police Station</label>
                <SearchableSelect
                  value={policeStation}
                  onChange={setPoliceStation}
                  fetchOptions={fetchPoliceStations}
                  placeholder="Search for a police station..."
                />
              </div>
            </>
          )}

          {authType === 'REQUEST_LETTER' && (
            <>
              <div>
                <label className="block text-gray-700 mb-1">Reference Number</label>
                <input type="text" value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} className="w-full p-2 border border-gray-300 rounded" />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Requesting Institution</label>
                <input type="text" value={requestingInstitution} onChange={(e) => setRequestingInstitution(e.target.value)} className="w-full p-2 border border-gray-300 rounded" required />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Requesting Officer</label>
                <input type="text" value={requestingOfficer} onChange={(e) => setRequestingOfficer(e.target.value)} className="w-full p-2 border border-gray-300 rounded" />
              </div>
            </>
          )}

          {authType === 'SUMMON' && (
            <>
              <div>
                <label className="block text-gray-700 mb-1">MLEF Number</label>
                <input type="text" value={mlefNumber} onChange={(e) => setMlefNumber(e.target.value)} className="w-full p-2 border border-gray-300 rounded" />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Court Case Number</label>
                <input type="text" value={courtCaseNumber} onChange={(e) => setCourtCaseNumber(e.target.value)} className="w-full p-2 border border-gray-300 rounded" />
              </div>
              <div className="relative z-10">
                <label className="block text-gray-700 mb-1">Court Name</label>
                <SearchableSelect
                  value={courtName}
                  onChange={setCourtName}
                  fetchOptions={fetchCourts}
                  placeholder="Search for a court..."
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Court Date</label>
                <input type="date" value={courtDate} onChange={(e) => setCourtDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded" />
              </div>
            </>
          )}

          <div className="md:col-span-2">
            <label className="block text-gray-700 mb-1">Remarks</label>
            <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} className="w-full p-2 border border-gray-300 rounded" rows={2} />
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 mb-1">Scanned Copy (Optional)</label>
            <input type="file" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} className="w-full text-sm" />
          </div>

          <div className="md:col-span-2 mt-2">
            <button type="submit" disabled={uploading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full md:w-auto disabled:opacity-50">
              {uploading ? 'Adding...' : 'Add Authorization'}
            </button>
          </div>
        </form>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Recorded Authorizations</h3>
        <table className="w-full text-left border-collapse text-sm border border-gray-300">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              <th className="p-2 border-r border-gray-300">Type</th>
              <th className="p-2 border-r border-gray-300">Authority</th>
              <th className="p-2 border-r border-gray-300">Issue Date</th>
              <th className="p-2 border-r border-gray-300">Details</th>
              <th className="p-2">Document</th>
            </tr>
          </thead>
          <tbody>
            {authorizations.length === 0 ? (
              <tr><td colSpan={5} className="p-4 text-center text-gray-500">No authorizations recorded for this case.</td></tr>
            ) : (
              authorizations.map((a: any) => (
                <tr key={a.authorization_id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-2 border-r border-gray-300 font-semibold">{a.authorization_type}</td>
                  <td className="p-2 border-r border-gray-300">{a.issuing_authority}</td>
                  <td className="p-2 border-r border-gray-300">{a.issue_date ? new Date(a.issue_date).toLocaleDateString() : '-'}</td>
                  <td className="p-2 border-r border-gray-300 text-xs text-gray-600">
                    {a.authorization_type === 'COURT_ORDER' && a.court_order && `Order #: ${a.court_order.court_order_number}, Court: ${a.court_order.court_name}`}
                    {a.authorization_type === 'INQUEST_ORDER' && a.inquest_order && `Order #: ${a.inquest_order.inquest_order_number}, ISD: ${a.inquest_order.isd_officer_name}`}
                    {a.authorization_type === 'SUMMON' && a.summon && `MLEF #: ${a.summon.MLEF_number}, Date: ${a.summon.court_date ? new Date(a.summon.court_date).toLocaleDateString() : '-'}`}
                    {a.authorization_type === 'MLEF' && a.details && `MLEF #: ${a.details.MLEF_number || '-'}, Police Station: ${a.details.police_station || '-'}`}
                    {a.authorization_type === 'REQUEST_LETTER' && a.details && `Ref #: ${a.details.reference_number || '-'}, Institution: ${a.details.requesting_institution || '-'}`}
                  </td>
                  <td className="p-2">
                    {a.documents ? (
                      <button 
                        onClick={() => handleDownload(a.documents.document_id, a.documents.file_path ? a.documents.file_path.split('/').pop() : 'authorization_doc')}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Download
                      </button>
                    ) : (
                      <span className="text-gray-400 text-xs">No File</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8 pt-8 border-t border-gray-300">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Case Documents</h2>
        
        <form onSubmit={handleDocUpload} className="flex flex-col gap-4 bg-gray-50 p-4 border border-gray-200 rounded">
          <h3 className="font-semibold text-lg text-gray-700">Upload New Document</h3>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <select 
              value={docCategory}
              onChange={(e) => setDocCategory(e.target.value)}
              className="border border-gray-300 rounded p-2 text-sm bg-white"
            >
              {availableDocCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input 
              type="file" 
              onChange={(e) => setDocUploadFile(e.target.files?.[0] || null)} 
              className="text-sm border border-gray-300 rounded p-1 flex-1"
            />
            <input 
              type="text" 
              placeholder="Add a description (optional)..." 
              value={docDescription}
              onChange={(e) => setDocDescription(e.target.value)}
              className="border border-gray-300 rounded p-2 text-sm flex-1"
            />
            <button type="submit" disabled={!docUploadFile || docUploading} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded disabled:opacity-50 text-sm whitespace-nowrap transition-colors">
              {docUploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </form>

        <div className="space-y-6 mt-6">
          <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Document Gallery</h3>
          {availableDocCategories.map(cat => {
            const items = groupedDocs[cat] || [];
            return (
              <div key={cat} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
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
                            <span className="font-medium text-sm text-gray-800">{m.file_path ? m.file_path.split('/').pop() : 'Unknown file'}</span>
                            {m.description && <span className="text-xs text-gray-500 mt-1">{m.description}</span>}
                          </div>
                          <button 
                            onClick={() => handleMediaDownload(m.media_id, m.file_path ? m.file_path.split('/').pop() : 'download')}
                            className="text-sm bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 py-1 px-4 rounded shadow-sm transition-colors"
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
    </div>
  );
};
