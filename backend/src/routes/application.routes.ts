import { Router } from "express";
import { ApplicationController } from "../controllers/application.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { employerOnly, seekerOnly } from "../middlewares/role.middleware";

const router = Router();
const applicationController = new ApplicationController();

// Apply to a job (Seeker only)
router.post(
  "/jobs/:id/apply",
  authenticate,
  seekerOnly,
  applicationController.applyToJob.bind(applicationController)
);

// Get applications for a specific job (Employer only)
router.get(
  "/jobs/:id/applications",
  authenticate,
  employerOnly,
  applicationController.getApplicationsForJob.bind(applicationController)
);

// Get logged-in seeker's applications
router.get(
  "/applications",
  authenticate,
  seekerOnly,
  applicationController.getMyApplications.bind(applicationController)
);

// Update application status (Employer only)
router.put(
  "/applications/:id/status",
  authenticate,
  employerOnly,
  applicationController.updateApplicationStatus.bind(applicationController)
);

// Withdraw application (Seeker only)
router.delete(
  "/applications/:id",
  authenticate,
  seekerOnly,
  applicationController.withdrawApplication.bind(applicationController)
);

export default router;
