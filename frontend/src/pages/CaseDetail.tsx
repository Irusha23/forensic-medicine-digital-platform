import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { CaseInfo } from '../components/case/CaseInfo';
import { AutopsyDetails } from '../components/case/AutopsyDetails';
import { Subjects } from '../components/case/Subjects';
import { Authorizations } from '../components/case/Authorizations';
import { Referrals } from '../components/case/Referrals';
import { Findings } from '../components/case/Findings';
import { Investigations } from '../components/case/Investigations';
import { MediaGallery } from '../components/case/MediaGallery';
import { AuditTrail } from '../components/case/AuditTrail';
import { ClinicalDetails } from '../components/case/ClinicalDetails';
import { AutopsyIntake } from '../components/case/AutopsyIntake';
import { CourtEvents } from '../components/case/CourtEvents';
import { Evidence } from '../components/case/Evidence';
import { IssueReportModal } from '../components/case/IssueReportModal';
import { RequireRole } from '../components/layout/RequireRole';
import { useAuth } from '../context/AuthContext';

export const CaseDetail = () => {
  const { id } = useParams();
  const { hasRole } = useAuth();
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('INFO');
  const [showReportModal, setShowReportModal] = useState(false);

  const fetchCase = async () => {
    try {
      const res = await api.get(`/cases/${id}`);
      setCaseData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch case');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCase();
  }, [id]);

  const handleGenerateReportClick = () => {
    setShowReportModal(true);
  };

  if (loading) return <div>Loading case...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!caseData) return <div>Case not found.</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <Link to="/" className="text-blue-600 hover:underline mb-2 inline-block">&larr; Back to Dashboard</Link>
          <h1 className="text-2xl font-bold">Case {caseData.case_number || id}</h1>
        </div>
        <RequireRole roles={['Admin', 'Doctor']}>
          {!(caseData.status === 'CLOSED' || caseData.status === 'closed' || caseData.case_status_lu?.id === 2) && (
            <button 
              className="bg-green-600 text-white px-4 py-2 hover:bg-green-700 font-medium"
              onClick={handleGenerateReportClick}
            >
              Issue Official Report
            </button>
          )}
        </RequireRole>
      </div>

      <CaseInfo caseData={caseData} onUpdate={fetchCase} />

      {showReportModal && (
        <IssueReportModal 
          caseId={id!} 
          caseNumber={caseData.case_number} 
          onClose={() => setShowReportModal(false)} 
        />
      )}

      <div className="bg-white border border-gray-300">
        <div className="flex border-b border-gray-300 bg-gray-50 flex-wrap">
          {(() => {
            let tabs = ['INFO'];
            const canViewMedical = hasRole(['Doctor', 'Admin']);
            
            if (caseData.case_type_lu?.code === 'clinical') {
              if (canViewMedical) tabs.push('CLINICAL');
            } else if (caseData.case_type_lu?.code === 'autopsy') {
              if (canViewMedical) tabs.push('AUTOPSY INTAKE', 'AUTOPSY FINDINGS');
            }
            tabs.push('SUBJECTS', 'AUTHORIZATIONS');
            if (canViewMedical) tabs.push('FINDINGS', 'INVESTIGATIONS');
            tabs.push('EVIDENCE', 'REFERRALS', 'MEDIA', 'COURT', 'AUDIT');
            return tabs;
          })().map(tab => (
            <button
              key={tab}
              className={`p-3 font-medium text-sm border-r border-gray-300 ${activeTab === tab ? 'bg-white text-blue-600 border-b-2 border-b-blue-600 -mb-[1px]' : 'text-gray-600 hover:bg-gray-100'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="p-4">
          {activeTab === 'INFO' && <div>General information is displayed above.</div>}
          {activeTab === 'CLINICAL' && <ClinicalDetails caseData={caseData} onUpdate={fetchCase} />}
          {activeTab === 'AUTOPSY INTAKE' && <AutopsyIntake caseData={caseData} onUpdate={fetchCase} />}
          {activeTab === 'AUTOPSY FINDINGS' && <AutopsyDetails caseId={id!} />}
          {activeTab === 'SUBJECTS' && <Subjects caseId={id!} />}
          {activeTab === 'AUTHORIZATIONS' && <Authorizations caseId={id!} />}
          {activeTab === 'FINDINGS' && <Findings caseId={id!} />}
          {activeTab === 'INVESTIGATIONS' && <Investigations caseId={id!} />}
          {activeTab === 'EVIDENCE' && <Evidence caseId={id!} />}
          {activeTab === 'REFERRALS' && <Referrals caseId={id!} />}
          {activeTab === 'MEDIA' && <MediaGallery caseId={id!} />}
          {activeTab === 'COURT' && <CourtEvents caseId={id!} />}
          {activeTab === 'AUDIT' && <AuditTrail caseId={id!} />}
        </div>
      </div>
    </div>
  );
};
