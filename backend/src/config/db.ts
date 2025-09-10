import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
dotenv.config();
import { User } from "./models/User";
import { Job } from "./models/Job";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST!,
  port: Number(process.env.DB_PORT)!,
  username: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  synchronize: true, // auto-create tables in dev, turn off in prod
  logging: false,
  entities: [User, Job], // all your entities/models here
  migrations: [],
  subscribers: [],
});
