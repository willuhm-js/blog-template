import { Router } from "express";
import jwt from "jsonwebtoken";
import { username, password, blogTitle, jwtSecret } from "../config";

require("dotenv").config();
const app = Router();
module.exports = app;

app.get("/", (req, res) => {
  res.render("login", { blogTitle });
});

app.post("/", (req, res) => {
  const aUsername = req.body.username;
  const aPassword = req.body.password;
  if (aUsername === username && aPassword === password) {
    try {
      const token = jwt.sign({ username, password }, jwtSecret, { expiresIn: "7h" });
      res.cookie("token", token, {
        maxAge: 7 * 60 * 60 * 1000,
        httpOnly: true,
      });
      return res.redirect("/posts");
    } catch {
      return res.redirect("/error/500");
    }
  } else {
    res.render("login", { blogTitle, error: "Invalid username or password." });
  }
});
