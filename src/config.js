const crypto = require("crypto");
const fs = require("fs");
require("dotenv").config();

module.exports = {
  jwtSecret: process.env.JWT_SECRET || (() => {
    // No JWT_SECRET token found. Using crypto, generate a secure string.
    console.log("You have not set the JWT_SECRET environment variable.");
    if (!fs.existsSync(".env")) {
      console.log("No .env file detected -- Generating a secure JWT_SECRET token...");
      fs.writeFileSync(".env", `JWT_SECRET=${crypto.randomBytes(32).toString("hex")}`);
    }
  })(), // A long, random and secure string
  mongoCred: process.env.MONGO || (() => {
    console.log("You have not set the MONGO environment variable.");
    process.exit(1);
  })(), // The MongoDB connection string
  blogTitle: "My Blog", //The title of your blog
  username: "admin", // The admin username
  password: "admin", // The admin password
};
