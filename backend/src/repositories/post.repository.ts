import { Post } from "../models/post.model.js";
import type {
  CreatePostInput,
  UpdatePostInput,
} from "../schemas/post.schema.js";

// The post repository is the ONLY file that talks to the Post model.
// It does database work and nothing else:
//   - no business rules (no "post must exist" checks)
//   - no AppError, no status codes
//   - no req or res
// When something is not found, it returns null and lets the service decide what that means.
// When we move to Postgres, this file is rewritten and the service does not change.

const create = async (fields: CreatePostInput) => {
  const post = await Post.create({
    name: fields.name,
    description: fields.description,
    age: fields.age,
  });

  return post;
};

const findAll = async () => {
  const posts = await Post.find();

  return posts;
};

// Returns the post with this id, or null if there is none.
const findById = async (id: string) => {
  const post = await Post.findById(id);

  return post;
};

// Returns the updated post, or null if no post has this id.
const updateById = async (id: string, fields: UpdatePostInput) => {
  const post = await Post.findByIdAndUpdate(id, fields, {
    new: true,
  });

  return post;
};

// Returns the deleted post, or null if no post has this id.
const deleteById = async (id: string) => {
  const deletedPost = await Post.findByIdAndDelete(id);

  return deletedPost;
};

export { create, findAll, findById, updateById, deleteById };
