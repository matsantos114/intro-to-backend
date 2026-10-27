import type { Request, Response } from "express";
import { Post } from "../models/post.model.js";
import { AppError } from "../utils/AppError.js";
import type {
  CreatePostInput,
  UpdatePostInput,
} from "../schemas/post.schema.js";

// There is no try/catch in this file on purpose.
// When something throws, Express sends the error to errorHandler,
// which decides what the client sees.

const createPost = async (req: Request, res: Response) => {
  // The validate middleware already checked this body against createPostSchema,
  // so we can tell TypeScript its real shape. There is no need to check for
  // missing fields here anymore.
  const input: CreatePostInput = req.body;

  const post = await Post.create({
    name: input.name,
    description: input.description,
    age: input.age,
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
  // The validate middleware already checked this body against updatePostSchema.
  // It only contains name, description and age, and each one is optional.
  const input: UpdatePostInput = req.body;

  // Zod removes unknown fields, so a body like { "admin": true } arrives here as {}.
  // An update that changes nothing is a client mistake, so we reject it.
  const providedFields = Object.keys(input);
  if (providedFields.length === 0) {
    throw new AppError(400, "No data provided");
  }

  const post = await Post.findByIdAndUpdate(req.params.id, input, {
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
