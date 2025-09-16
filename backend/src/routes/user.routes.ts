import { createUsers, login } from "../controllers/user.controller";
import { Router, Request, Response } from "express";
const router = Router();

router.post("/auth/register", createUsers);
router.post("/auth/login", login);

export default router;
