
// Controllers map HTTP requests to service calls and format HTTP responses.
// Keep controllers thin: no DB access here. Business logic belongs in services.
// Controllers return friendly JSON and appropriate HTTP status codes.

import { Request, Response } from "express";
import {
  getOwnProfile,
  updateSeekerProfile,
  updateEmployerProfile,
  getPublicProfileById,
} from "../services/profile.service";
import { AuthRequest } from "../middlewares/auth.middleware";

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const data = await getOwnProfile(req.user);
  if (!data || !data.profile) return res.status(404).json({ message: "First create your profile using PUT profile/seeker or PUT profile/employer" });
    // data: { profile, user } — user.email is only present for the owner
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const putSeekerProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.role !== "seeker")
      return res.status(403).json({ message: "Only seekers can update seeker profile" });
    const data = req.body;
    const updated = await updateSeekerProfile(req.user.id, data);
    res.json({ profile: updated });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const putEmployerProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.role !== "employer")
      return res.status(403).json({ message: "Only employers can update employer profile" });
    const data = req.body;
    const updated = await updateEmployerProfile(req.user.id, data);
    res.json({ profile: updated });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getPublicProfile = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid id" });
    const pub = await getPublicProfileById(id);
    if (!pub) return res.status(404).json({ message: "Profile not found" });
    res.json(pub);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};