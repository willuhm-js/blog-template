import dotenv from "dotenv";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { blogTitle, username, password, jwtSecret } from "../config";
import Post from "../util/mongoose/Post";
import multer from "multer"

dotenv.config();

const upload = multer();

const app = Router();
export default app;

const checkIfAuth = (req: Express.Request & { cookies: any }) => {
  if (!req.cookies || !req.cookies.token) return false;
  const creds = jwt.verify(req.cookies.token, jwtSecret);
  if ((creds as any).username !== username || (creds as any).password !== password) return false;
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
    thumbnail: `data:${req.file?.mimetype};base64,${req.file?.buffer.toString("base64")}`
  });
  if (req.body.tags) newPost.tags = req.body.tags.split(",");
  await newPost.save();
  return res.redirect(`/posts/${newPost.id}`);
});

app.post("/autho/delete", async (req, res) => {
  if (!req.body.id) return res.status(400).redirect("/error/400");
  try {
    await Post.deleteOne({ id: req.body.id });
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