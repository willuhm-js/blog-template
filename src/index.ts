/* "If it works, it works." */

import dotenv from "dotenv";
dotenv.config();
import express from "express";
import ejs from "ejs";
import mongoose from "mongoose"
import cookieParser from "cookie-parser"
import path from "path"
import { mongoCred } from "./config";

const join = (...p: string[]) => path.resolve(__dirname, ...p);
const app = express();

// database
mongoose
  .connect(mongoCred)
  .then(() => {
    app.listen(process.env.PORT || 8082, () => {
      console.log("App Started");
    });
  });

// view engine
app.engine("ejs", ejs.renderFile);
app.set("view engine", "ejs");
app.set("views", join("views"));

// cookie and body
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

// static files
app.use(express.static(join("public")));

// route handler
app.use("/posts", require("./routes/posts"));
app.use("/login", require("./routes/login"));

app.get("/", (_, res) => res.redirect("/posts"));
app.get("/error/:code", (req, res) => res.render("error", { code: req.params.code }));
app.get("*", (req, res) => res.redirect("/error/404"));