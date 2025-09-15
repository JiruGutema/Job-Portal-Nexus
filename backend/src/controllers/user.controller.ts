import { Request, Response } from "express";
import { addUser } from "../services/user.service";

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
