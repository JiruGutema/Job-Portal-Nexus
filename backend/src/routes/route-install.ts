import install from "../models/install";
import { Router, Request, Response } from "express";
const router = Router();

router.post("/create-tables", async (req: Request, res: Response) => {
  try {
    await install();
    res.status(200).json({ message: "Installation completed successfully." });
  } catch (error) {
    res.status(500).json({ message: "Installation failed.", error });
  }
});
