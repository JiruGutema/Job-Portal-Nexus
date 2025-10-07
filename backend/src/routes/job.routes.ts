import { Router } from 'express';
import JobController from '../controllers/job.controller'; // Import class
import { authenticate } from '../middlewares/auth.middleware';
import { employerOnly } from '../middlewares/role.middleware';

const router = Router();

// ✅ Create controller instance here
const jobController = new JobController();

// Public routes
router.get('/jobs', jobController.getAllJobs.bind(jobController));
router.get('/jobs/:id', jobController.getJobById.bind(jobController));

// Protected employer routes
router.post('/jobs', authenticate, employerOnly, jobController.createJob.bind(jobController));
router.get('/employer/jobs', authenticate, employerOnly, jobController.getEmployerJobs.bind(jobController));
router.put('/jobs/:id', authenticate, employerOnly, jobController.updateJob.bind(jobController));
router.delete('/jobs/:id', authenticate, employerOnly, jobController.deleteJob.bind(jobController));

export default router;