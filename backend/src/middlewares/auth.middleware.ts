import pool from "../config/db";
import {request, response, Express} from "express";

const dotenv = require("dotenv");
dotenv.config();

const app = Express();

app.use("/v1");


app.get("/register", async(req: Request, res: Response)=>{
res.send("Welcome to backend server!");
})
