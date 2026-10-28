import * as postRepository from "../repositories/post.repository.js";
import { AppError } from "../utils/AppError.js";
import type {
  CreatePostInput,
  UpdatePostInput,
} from "../schemas/post.schema.js";

// The post service holds the business rules for posts.
// It never sees `req` or `res`, and it never talks to the database directly.
// For data, it asks the post repository.

const createPost = async (input: CreatePostInput) => {
  // No rules yet, so this only passes the call through.
  const post = await postRepository.create(input);

  return post;
};

const listPosts = async () => {
  // No rules yet, so this only passes the call through.
  const posts = await postRepository.findAll();

  return posts;
};

const getPost = async (id: string) => {
  const post = await postRepository.findById(id);

  // Rule: you can only read a post that exists.
  // The repository returns null when nothing matched; here we decide that means 404.
  if (!post) {
    throw new AppError(404, "Post not found");
  }

  return post;
};

const updatePost = async (id: string, input: UpdatePostInput) => {
  // Rule: an update must change at least one field.
  // Zod removes unknown fields, so a body like { "admin": true } arrives here as {}.
  const providedFields = Object.keys(input);
  if (providedFields.length === 0) {
    throw new AppError(400, "No data provided");
  }

  const post = await postRepository.updateById(id, input);

  // Rule: you can only update a post that exists.
  // The repository returns null when nothing matched; here we decide that means 404.
  if (!post) {
    throw new AppError(404, "Post not found");
  }

  return post;
};

const deletePost = async (id: string) => {
  const deletedPost = await postRepository.deleteById(id);

  // Rule: you can only delete a post that exists.
  if (!deletedPost) {
    throw new AppError(404, "Post not found");
  }
};

export { createPost, listPosts, getPost, updatePost, deletePost };
