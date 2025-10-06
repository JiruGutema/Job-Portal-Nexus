import { createUsers, login } from "../controllers/user.controller";
import { Router, Request, Response } from "express";
const router = Router();

router.post("/register", createUsers);
router.post("/login", login);

export default router;
