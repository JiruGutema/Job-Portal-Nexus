import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminOnly } from "../middlewares/role.middleware";
import {
  getAllUsersService,
  deleteUserService,
  getAllJobsService,
  getAllApplicationsService,
  banUserService,
  removeJobService,
} from "../services/admin.service";

const router = Router();

// protect all admin routes with auth + admin role
router.use(authMiddleware, adminOnly);

// GET /admin/users - list users
router.get("/users", async (req, res) => {
  try {
    const users = await getAllUsersService();
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET /admin/jobs - list jobs
router.get("/jobs", async (req, res) => {
  try {
    const jobs = await getAllJobsService();
    res.json(jobs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET /admin/applications - list all applications
router.get("/applications", async (req, res) => {
  try {
    const apps = await getAllApplicationsService();
    res.json(apps);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST /admin/users/:id/ban - soft-ban a user
router.post("/users/:id/ban", async (req, res) => {
  const userId = Number(req.params.id);
  try {
    const user = await banUserService(userId);
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /admin/users/:id - alias to soft-ban (keeps API backward compat)
router.delete("/users/:id", async (req, res) => {
  const userId = Number(req.params.id);
  try {
    await deleteUserService(userId);
    res.status(200).json({ message: "User banned" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /admin/jobs/:id - soft-remove job
router.delete("/jobs/:id", async (req, res) => {
  const jobId = Number(req.params.id);
  try {
    const job = await removeJobService(jobId);
    res.json(job);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
