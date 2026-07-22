import { Router } from 'express';
import * as courtEventController from '../controllers/court-event.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';

const router = Router({ mergeParams: true });

router.use(authenticateJWT);

router.get('/', courtEventController.listCourtEvents);
router.post('/', courtEventController.createCourtEvent);
router.put('/:id', courtEventController.updateCourtEvent);
router.delete('/:id', courtEventController.deleteCourtEvent);

export default router;
