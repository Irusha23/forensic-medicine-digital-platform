import { Router } from 'express';
import { param } from 'express-validator';
import multer from '../../lib/multer';
import { uploadMedia, getMedia, getMediaByCase, downloadMedia } from '../controllers/media.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validation.middleware';

const router = Router();

const idValidator = [
  param('id').isInt().withMessage('ID must be an integer'),
  validateRequest
];

const caseIdValidator = [
  param('caseId').isInt().withMessage('caseId must be an integer'),
  validateRequest
];

// Protected upload endpoint: allowed roles: Clerk, Doctor, Admin
// NOTE: For multer to catch errors nicely without crashing, use a wrapper or let express handle it.
router.post('/upload', authenticateJWT, authorize('Clerk', 'Doctor', 'Admin'), (req, res, next) => {
  multer.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'File upload error' });
    }
    next();
  });
}, uploadMedia);

router.get('/download/:id', authenticateJWT, authorize('Clerk', 'Doctor', 'Admin'), idValidator, downloadMedia);
router.get('/:id', authenticateJWT, authorize('Clerk', 'Doctor', 'Admin'), idValidator, getMedia);
router.get('/case/:caseId', authenticateJWT, authorize('Clerk', 'Doctor', 'Admin'), caseIdValidator, getMediaByCase);

export default router;
