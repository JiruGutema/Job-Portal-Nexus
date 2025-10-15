import { Request, Response } from "express";
import { addUser, loginUser } from "../services/user.service";
import jwt from "jsonwebtoken";
import { error, log } from "console";

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
