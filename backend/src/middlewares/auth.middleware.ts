import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { isTokenRevoked } from "../models/token.model";

export interface AuthRequest extends Request {
  user?: { id: number; email?: string; role: string };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization header missing" });
  }
  const token = auth.split(" ")[1];
  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "secretKey"
    ) as any;
    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role || "",
    };
    next();
  } catch (err: any) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default authenticate;

// src/middleware/auth.ts
// Middleware to protect routes and verify JWT tokens

interface JwtPayload {
  id: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "secretkey";

    // Check blacklist first
    const revoked = await isTokenRevoked(token);
    if (revoked) {
      return res
        .status(401)
        .json({ message: "Token revoked. Please login again." });
    }

    // Verify token
    const decoded = jwt.verify(token, secret) as JwtPayload;

    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
