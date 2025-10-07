import { Router } from "express";
import {
  getProfile,
  putSeekerProfile,
  putEmployerProfile,
  getPublicProfile,
} from "../controllers/profile.controller";
import authenticate from "../middlewares/auth.middleware";

const router = Router();

// Protected: get logged-in user's profile (auto-detect role)
router.get("/profile", authenticate, getProfile);
// Update seeker profile
router.put("/profile/seeker", authenticate, putSeekerProfile);
// Update employer profile
router.put("/profile/employer", authenticate, putEmployerProfile);
// Public view by profile id (auto-detect role)
router.get("/profile/:id", getPublicProfile);

export default router;
