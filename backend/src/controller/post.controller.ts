import type { Request, Response } from "express";
import { Post } from "../models/post.model.js";
import { AppError } from "../utils/AppError.js";

// There is no try/catch in this file on purpose.
// When something throws, Express sends the error to errorHandler,
// which decides what the client sees.

const createPost = async (req: Request, res: Response) => {
  // Read each field out of the request body one by one.
  const name = req.body.name;
  const description = req.body.description;
  const age = req.body.age;

  if (!name || !description || !age) {
    throw new AppError(400, "All fields are required");
  }

  const post = await Post.create({
    name: name,
    description: description,
    age: age,
  });

  res.status(201).json({
    message: "Post created successfully",
    post: post,
  });
};

const getPost = async (req: Request, res: Response) => {
  const posts = await Post.find();

  res.status(200).json(posts);
};

const updatePost = async (req: Request, res: Response) => {
  const bodyKeys = Object.keys(req.body);
  if (bodyKeys.length === 0) {
    throw new AppError(400, "No data provided");
  }

  const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!post) {
    throw new AppError(404, "Post not found");
  }

  res.status(200).json({
    message: "Post updated",
    post: post,
  });
};

const deletePost = async (req: Request, res: Response) => {
  const deletedPost = await Post.findByIdAndDelete(req.params.id);

  if (!deletedPost) {
    throw new AppError(404, "Post not found");
  }

  res.status(200).json({
    message: "Post successfully deleted",
  });
};

export { createPost, getPost, updatePost, deletePost };
