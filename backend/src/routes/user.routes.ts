import {
  createUsers,
  login,
  logout,
  changePassword,
  deleteAccount,
  getLoggedInUser,
} from "../controllers/user.controller";
import { Router, Request, Response } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { get } from "http";
const router = Router();

router.post("/register", createUsers);
router.post("/login", login);
router.post("/logout", authMiddleware, logout); // <-- logout route (protected)
router.put("/change-password", changePassword);
router.delete("/delete-account/:id", deleteAccount);
router.get("/me", authMiddleware, getLoggedInUser);
export default router;
