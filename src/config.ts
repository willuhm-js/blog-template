import crypto from "crypto";
import fs from "fs/promises";
import { constants } from "fs";
import dotenv from "dotenv";
import logger from "./util/logger";
dotenv.config();

const exists = (path: string) => fs.access(path, constants.R_OK | constants.W_OK).then(() => true).catch(() => false);

export const jwtSecret = process.env.JWT_SECRET || (async () => {
  // No JWT_SECRET token found. Using crypto, generate a secure string.
  logger.warn("You have not set the JWT_SECRET environment variable. Generating a secure one...");
  const randomBits = crypto.randomBytes(32).toString("hex");

  const preferredFsFunction = await exists(".env") ? fs.appendFile : fs.writeFile;

  await preferredFsFunction(".env", `JWT_SECRET=${randomBits}`);

  logger.warn("JWT_SECRET has been set, please restart the application.");
  process.exit(1);
})();

export const mongoCred = process.env["MONGO"] || (() => {
  logger.error("You have not set the MONGO environment variable.");
  process.exit(1);
})();

export const blogTitle = "My Blog";

export const username = process.env["USERNAME"] || "admin";

export const password = process.env["PASSWORD"] || "admin";

export const port = process.env.PORT || 8082;
