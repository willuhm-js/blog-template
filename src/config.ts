import crypto from "crypto";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

export const jwtSecret = process.env.JWT_SECRET || (() => {
  // No JWT_SECRET token found. Using crypto, generate a secure string.
  console.log("You have not set the JWT_SECRET environment variable.");
  if (!fs.existsSync(".env")) {
    console.log("No .env file detected -- Generating a secure JWT_SECRET token...");
    const randomBits = crypto.randomBytes(32).toString("hex");
    fs.writeFileSync(".env", `JWT_SECRET=${crypto.randomBytes(32).toString("hex")}`);
    return randomBits
  }

  process.exit(1);
})();

export const mongoCred = process.env.MONGO || (() => {
  console.log("You have not set the MONGO environment variable.");
  process.exit(1);
})();

export const blogTitle = "My Blog";

export const username = "admin";

export const password = "admin";
