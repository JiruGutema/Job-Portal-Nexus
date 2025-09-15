import { createUsers } from "../controllers/user.controller";
import { Router, Request, Response } from "express";
const router = Router();

router.post("/", createUsers);

export default router;
