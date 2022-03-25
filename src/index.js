/* "If it works, it works." */

require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const join = (...p) => require("path").resolve(__dirname, ...p);

const app = express();

const { mongoCred } = require("./config");

// database
mongoose
  .connect(mongoCred, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
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