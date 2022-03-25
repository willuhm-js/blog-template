require("dotenv").config();

module.exports = {
  mongoCred: process.env.MONGO, // The MongoDB connection string
  blogTitle: "My Blog", //The title of your blog
  jwtSecret: process.env.JWT_SECRET, // A long, random and secure string
  username: "admin", // The admin username
  password: "admin", // The admin password
};
