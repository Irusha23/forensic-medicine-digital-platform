import { Router } from 'express';
import { param } from 'express-validator';
import { createCaseController, deleteCaseController, getCaseController, listCaseController, updateCaseController } from '../controllers/case.controller';
import { createFindingController, deleteFindingController, getAuditLogController, getStatusesController, listFindingsController, transitionStatusController, updateFindingController } from '../controllers/case-workflow.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import courtEventRoutes from './court-event.routes';

const router = Router();

// ID validator
const idValidator = [
  param('id').isInt().withMessage('ID must be an integer'),
  validateRequest
];

// Finding ID validator
const findingIdValidator = [
  ...idValidator,
  param('findingId').isInt().withMessage('findingId must be an integer'),
  validateRequest
];

// Status management (before parameterized routes)
router.get('/statuses', authenticateJWT, authorize('Clerk', 'Doctor', 'Admin'), getStatusesController);

// Case CRUD
router.get('/', authenticateJWT, authorize('Clerk', 'Doctor', 'Admin'), listCaseController);
router.post('/', authenticateJWT, authorize('Clerk', 'Doctor', 'Admin'), createCaseController);
router.get('/:id', authenticateJWT, authorize('Clerk', 'Doctor', 'Admin'), idValidator, getCaseController);
router.put('/:id', authenticateJWT, authorize('Clerk', 'Doctor', 'Admin'), idValidator, updateCaseController);
router.delete('/:id', authenticateJWT, authorize('Doctor', 'Admin'), idValidator, deleteCaseController);

// Workflow: Status transition
router.post('/:id/transition-status', authenticateJWT, authorize('Doctor', 'Admin'), idValidator, transitionStatusController);

// Workflow: Findings/notes
router.post('/:id/findings', authenticateJWT, authorize('Doctor', 'Admin'), idValidator, createFindingController);
router.get('/:id/findings', authenticateJWT, authorize('Doctor', 'Admin'), idValidator, listFindingsController);
router.put('/:id/findings/:findingId', authenticateJWT, authorize('Doctor', 'Admin'), findingIdValidator, updateFindingController);
router.delete('/:id/findings/:findingId', authenticateJWT, authorize('Doctor', 'Admin'), findingIdValidator, deleteFindingController);

// Audit trail
router.get('/:id/audit', authenticateJWT, authorize('Clerk', 'Doctor', 'Admin'), idValidator, getAuditLogController);

// Court Events
router.use('/:caseId/court-events', courtEventRoutes);

// Media
import { getMediaByCase, uploadMedia } from '../controllers/media.controller';
import multer from '../../lib/multer';
router.get('/:id/media', authenticateJWT, authorize('Clerk', 'Doctor', 'Admin'), idValidator, (req, res, next) => {
  req.params.caseId = req.params.id; // Map id to caseId for getMediaByCase
  next();
}, getMediaByCase);
router.post('/:id/media', authenticateJWT, authorize('Clerk', 'Doctor', 'Admin'), idValidator, (req, res, next) => {
  multer.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message || 'File upload error' });
    next();
  });
}, uploadMedia);

// Documents
import { getDocumentsByCase, uploadDocument, downloadDocument } from '../controllers/documents.controller';
router.get('/:id/documents', authenticateJWT, authorize('Clerk', 'Doctor', 'Admin'), idValidator, getDocumentsByCase);
router.post('/:id/documents', authenticateJWT, authorize('Clerk', 'Doctor', 'Admin'), idValidator, (req, res, next) => {
  multer.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message || 'File upload error' });
    next();
  });
}, uploadDocument);
router.get('/documents/download/:documentId', authenticateJWT, authorize('Clerk', 'Doctor', 'Admin'), [
  param('documentId').isInt().withMessage('documentId must be an integer'),
  validateRequest
], (req, res, next) => {
  req.params.id = req.params.documentId;
  next();
}, downloadDocument);

// Phase 2: Subjects, Authorizations, Referrals
import { addSubjectToCase, listCaseSubjects } from '../controllers/subject.controller';
import { addAuthorizationToCase, listCaseAuthorizations } from '../controllers/authorizations.controller';
import { addReferralToCase, listCaseReferrals } from '../controllers/referral.controller';

// Subjects
router.get('/:id/subjects', authenticateJWT, authorize('Clerk', 'Doctor', 'Admin'), idValidator, listCaseSubjects);
router.post('/:id/subjects', authenticateJWT, authorize('Clerk', 'Doctor', 'Admin'), idValidator, addSubjectToCase);

// Authorizations
router.get('/:id/authorizations', authenticateJWT, authorize('Clerk', 'Doctor', 'Admin'), idValidator, listCaseAuthorizations);
router.post('/:id/authorizations', authenticateJWT, authorize('Clerk', 'Doctor', 'Admin'), idValidator, addAuthorizationToCase);

// Referrals
router.get('/:id/referrals', authenticateJWT, authorize('Clerk', 'Doctor', 'Admin'), idValidator, listCaseReferrals);
router.post('/:id/referrals', authenticateJWT, authorize('Clerk', 'Doctor', 'Admin'), idValidator, addReferralToCase);

export default router;
