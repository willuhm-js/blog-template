require("dotenv").config();
const { Router } = require("express");
const jwt = require("jsonwebtoken");
const { blogTitle, username, password, jwtSecret } = require("../config.js");
const Post = require("../util/mongoose/Post");
const fs = require("fs-extra");
const join = (...p) => require("path").resolve(__dirname, ...p);

const multer = require("multer");
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    await fs.ensureDir(join("..", "public", "thumbnails"));
    cb(null, join("..", "public", "thumbnails"));
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueName}.${file.mimetype.split("/")[1]}`);
  },
});
const upload = multer({ storage });

const app = Router();
module.exports = app;

const checkIfAuth = (req) => {
  if (!req.cookies || !req.cookies.token) return false;
  const creds = jwt.verify(req.cookies.token, jwtSecret);
  if (creds.username !== username || creds.password !== password) return false;
  return true;
};

app.use("/autho/", (req, res, next) => {
  const autho = checkIfAuth(req);
  if (!autho) return res.status(403).redirect("/login");
  next();
});

app.get("/", async (req, res) => {
  let allPosts = await Post.find();
  allPosts.forEach((post) => (post.body = post.body.split("<br>")[0]));
  res.render("posts", { allPosts, blogTitle, authBool: checkIfAuth(req) });
});

app.get("/:id", async (req, res) => {
  const post = await Post.find({ id: req.params.id });
  if (post.length === 0) return res.status(404).redirect("/error/404");
  res.render("post.ejs", { post: post[0], blogTitle, authBool: checkIfAuth(req) });
});

/* /autho/ route, the following require authorization */
app.get("/autho/create", (req, res) => {
  res.render("create.ejs", { blogTitle });
});

app.post("/autho/create", upload.single("thumbnail"), async (req, res) => {
  if (!req.body.title || !req.body.body) return res.status(400).render("create.ejs", { blogTitle, error: "Missing or malformed input." });
  const existingPost = await Post.findOne({ title: req.body.title });
  if (existingPost) return res.status(400).render("create.ejs", { blogTitle, error: "Post with that title already exists." });
  const newPost = new Post({
    title: req.body.title,
    body: req.body.body,
    id: Date.now(),
  });
  if (req.body.tags) newPost.tags = req.body.tags.split(",");
  if (req.file) {
    newPost.thumbnail = req.file.filename;
    newPost.id = req.file.filename.split(".")[0];
  }
  await newPost.save();
  return res.redirect(`/posts/${newPost.id}`);
});

app.post("/autho/delete", async (req, res) => {
  if (!req.body.id) return res.status(400).redirect("/error/400");
  try {
    await Post.deleteOne({ id: req.body.id });
    if (req.body.thumbnail) fs.unlinkSync(join("..", "public", "thumbnails", req.body.thumbnail));
    return res.redirect("/posts");
  } catch {
    res.status(500).redirect("/error/500");
  }
});

app.get("/autho/edit", async (req, res) => {
  if (!req.query.id) return res.status(400).redirect("/error/400");
  const ePost = await Post.findOne({
    id: req.query.id,
  });
  if (!ePost) return res.status(400).redirect("/error/400");
  res.render("edit", { blogTitle, ePost, authBool: checkIfAuth(req) });
});

app.post("/autho/edit", async (req, res) => {
  const { title, body, tags } = req.body;
  const { id } = req.query;
  if (!id || !title || !body) return res.status(400).redirect("/error/400");
  try {
    await Post.updateOne({ id }, { title, body, tags: tags.split(",") });
    res.redirect(`/posts/${id}`);
  } catch {
    res.status(500).redirect("/error/500");
  }
});