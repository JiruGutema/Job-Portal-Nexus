import fs from "fs";
import path from "path";
import yaml from "yaml";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

export const setupSwagger = (app: Express): void => {
  const filePath = path.join(__dirname, "../docs/swagger.yaml");
  const fileContents = fs.readFileSync(filePath, "utf8");
  const swaggerDocument = yaml.parse(fileContents);

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
