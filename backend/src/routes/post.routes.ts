import { Router } from "express";
import {
  handleCreatePost,
  handleListPosts,
  handleGetPost,
  handleUpdatePost,
  handleDeletePost,
} from "../controller/post.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { createPostSchema, updatePostSchema } from "../schemas/post.schema.js";

const router = Router();

// REST: the URL names the thing, and the HTTP method says what to do to it.
// This router is mounted at /api/v1/posts in app.ts, so "/" here means /api/v1/posts.
//
//   POST    /api/v1/posts        create a post
//   GET     /api/v1/posts        list posts
//   GET     /api/v1/posts/:id    get one post
//   PATCH   /api/v1/posts/:id    update one post
//   DELETE  /api/v1/posts/:id    delete one post

// The collection: all posts.
router.route("/")
  .post(validate(createPostSchema), handleCreatePost)
  .get(handleListPosts);

// One post, picked by its id.
router.route("/:id")
  .get(handleGetPost)
  .patch(validate(updatePostSchema), handleUpdatePost)
  .delete(handleDeletePost);

export default router;
