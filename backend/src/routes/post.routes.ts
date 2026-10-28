import { Router } from "express";
import {
  handleCreatePost,
  handleListPosts,
  handleUpdatePost,
  handleDeletePost,
} from "../controller/post.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { createPostSchema, updatePostSchema } from "../schemas/post.schema.js";

const router = Router();

// validate(createPostSchema) is called once, right here, when the server starts.
// It returns a middleware, which Express runs on each POST /create before handleCreatePost.
router.route("/create").post(validate(createPostSchema), handleCreatePost);
router.route("/feed").get(handleListPosts);
router.route("/update/:id").patch(validate(updatePostSchema), handleUpdatePost);
router.route("/delete/:id").delete(handleDeletePost);

export default router;
