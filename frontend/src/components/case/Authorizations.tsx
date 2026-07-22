import React, { useEffect, useState } from 'react';
import api from '../../api/client';

export const Authorizations = ({ caseId }: { caseId: string }) => {
  const [authorizations, setAuthorizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
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

  useEffect(() => {
    fetchAuthorizations();
  }, [caseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        authorization_type: authType,
        issuing_authority: issuingAuthority,
        issue_date: issueDate || null,
        remarks
      };

      if (authType === 'COURT_ORDER') {
        payload.court_order_number = courtOrderNumber;
        payload.court_case_number = courtCaseNumber;
        payload.court_name = courtName;
      } else if (authType === 'INQUEST_ORDER') {
        payload.inquest_order_number = inquestOrderNumber;
        payload.isd_officer_name = isdOfficerName;
        payload.police_station = policeStation;
      } else if (authType === 'SUMMON') {
        payload.MLEF_number = mlefNumber;
        payload.court_case_number = courtCaseNumber;
        payload.court_name = courtName;
        payload.court_date = courtDate || null;
      }

      await api.post(`/cases/${caseId}/authorizations`, payload);
      
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
      
      fetchAuthorizations();
    } catch (err) {
      alert('Failed to add authorization');
    }
  };

  if (loading) return <div>Loading authorizations...</div>;

  return (
    <div className="space-y-6">
      {error && <div className="text-red-600 bg-red-100 p-2">{error}</div>}

      <div className="bg-white p-4 border border-gray-200 rounded shadow-sm">
        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Add Legal Authorization</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="block text-gray-700 mb-1">Authorization Type</label>
            <select value={authType} onChange={(e) => setAuthType(e.target.value)} className="w-full p-2 border border-gray-300 rounded" required>
              <option value="COURT_ORDER">Court Order</option>
              <option value="INQUEST_ORDER">Inquest Order</option>
              <option value="SUMMON">Summon</option>
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
              <div>
                <label className="block text-gray-700 mb-1">Court Name</label>
                <input type="text" value={courtName} onChange={(e) => setCourtName(e.target.value)} className="w-full p-2 border border-gray-300 rounded" />
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
              <div>
                <label className="block text-gray-700 mb-1">Police Station</label>
                <input type="text" value={policeStation} onChange={(e) => setPoliceStation(e.target.value)} className="w-full p-2 border border-gray-300 rounded" />
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
              <div>
                <label className="block text-gray-700 mb-1">Court Name</label>
                <input type="text" value={courtName} onChange={(e) => setCourtName(e.target.value)} className="w-full p-2 border border-gray-300 rounded" />
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

          <div className="md:col-span-2 mt-2">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full md:w-auto">
              Add Authorization
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
              <th className="p-2">Details</th>
            </tr>
          </thead>
          <tbody>
            {authorizations.length === 0 ? (
              <tr><td colSpan={4} className="p-4 text-center text-gray-500">No authorizations recorded for this case.</td></tr>
            ) : (
              authorizations.map((a: any) => (
                <tr key={a.authorization_id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-2 border-r border-gray-300 font-semibold">{a.authorization_type}</td>
                  <td className="p-2 border-r border-gray-300">{a.issuing_authority}</td>
                  <td className="p-2 border-r border-gray-300">{a.issue_date ? new Date(a.issue_date).toLocaleDateString() : '-'}</td>
                  <td className="p-2 text-xs text-gray-600">
                    {a.authorization_type === 'COURT_ORDER' && a.court_order && `Order #: ${a.court_order.court_order_number}, Court: ${a.court_order.court_name}`}
                    {a.authorization_type === 'INQUEST_ORDER' && a.inquest_order && `Order #: ${a.inquest_order.inquest_order_number}, ISD: ${a.inquest_order.isd_officer_name}`}
                    {a.authorization_type === 'SUMMON' && a.summon && `MLEF #: ${a.summon.MLEF_number}, Date: ${a.summon.court_date ? new Date(a.summon.court_date).toLocaleDateString() : '-'}`}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
