import { createUsers, login, logout } from "../controllers/user.controller";
import { Router, Request, Response } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { changePassword } from "../controllers/user.controller";
const router = Router();

router.post("/register", createUsers);
router.post("/login", login);
router.post("/logout", authMiddleware, logout); // <-- logout route (protected)
router.put("/change-password", changePassword);
export default router;
