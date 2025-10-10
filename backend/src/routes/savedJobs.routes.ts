import { Router } from 'express';
import { SavedJobController } from '../controllers/savedJobs.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { seekerOnly } from '../middlewares/role.middleware';

const router = Router();
const savedJobController = new SavedJobController();

// Get saved jobs list (Seeker only)
router.get(
  '/jobs/saved',         
  authenticate,
  seekerOnly,
  savedJobController.getSavedJobs.bind(savedJobController)
);

// Save job for later (Seeker only)
router.post(
  '/jobs/:id/save',
  authenticate,
  seekerOnly,
  savedJobController.saveJob.bind(savedJobController)
);

// Remove job from saved list (Seeker only)
router.delete(
  '/jobs/:id/save',
  authenticate,
  seekerOnly,
  savedJobController.removeSavedJob.bind(savedJobController)
);

export default router;