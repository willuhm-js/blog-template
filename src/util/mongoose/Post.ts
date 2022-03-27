import mongoose from "mongoose";
const { Schema, model } = mongoose;

const postSchema = new Schema({
  id: {
    required: true,
    type: String
  },
  title: {
    required: true,
    type: String
  },
  subtitle: String,
  body: {
    required: true,
    type: String
  },
  tags: [{
    type: String
  }],
  thumbnail: String
}, { timestamps: true} );

export default model("Post", postSchema);