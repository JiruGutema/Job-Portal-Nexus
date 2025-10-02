import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: { id: number; email?: string; role: string };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization header missing" });
  }
  const token = auth.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "secretKey") as any;
  req.user = { id: payload.id, email: payload.email, role: payload.role || "" };
    next();
  } catch (err: any) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default authenticate;
