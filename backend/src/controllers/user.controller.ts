import { Request, Response } from "express";
import { addUser, loginUser } from "../services/user.service";
import jwt from "jsonwebtoken";
import { error, log } from "console";
import { revokeToken } from "../models/token.model";
import { changePasswordService } from "../services/user.service";

export const createUsers = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newUser = await addUser({
      name,
      email,
      password,
      role,
      created_at: new Date(),
    });
    // Remove password before sending response
    /*     delete newUser.password;
     */
    res.status(201).json(newUser);
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "Failed to create user", details: err.message });
    console.log(err.message);
  }
};

/*   const user = req.body;
  addUser(user).then((newUser) => {
    res.status(201).json(newUser);
  });
};
 */
/* export const getAllUsers = (req: Request, res: Response) => {
  res.send("Get all users");
}; */

// Login functionality with JWT
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }
    const user = await loginUser(email, password);
    console.log(user);

    // Generate JWT tokens
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || "secretKey",
      { expiresIn: "1h" }
    );
    console.log(token);
    console.log(process.env.JWT_SECRET);

    // send response without password
    delete user.password;
    res.json({
      message: "Login successful",
      user: user,
      token: token,
    });
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
};

// Logout functionality by revoking JWT token

export const logout = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // Try to read token expiry from the token so we store accurate expires_at
    const decoded = jwt.decode(token) as any;
    let expiresAt = new Date();
    if (decoded && decoded.exp) {
      // exp is in seconds since epoch
      expiresAt = new Date(decoded.exp * 1000);
    } else {
      // fallback: one hour from now (or match your token lifetime)
      expiresAt.setHours(expiresAt.getHours() + 1);
    }

    await revokeToken(token, expiresAt);
    return res.json({ message: "Logged out successfully" });
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: "Failed to logout", details: err.message });
  }
};

// Password change functionality can be added here

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;

    if (!userId || !oldPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const result = await changePasswordService(userId, oldPassword, newPassword);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};