import { Router } from "express";
import {
  createPost,
  getPost,
  updatePost,
  deletePost
} from "../controller/post.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { createPostSchema, updatePostSchema } from "../schemas/post.schema.js";

const router = Router();

// validate(createPostSchema) is called once, right here, when the server starts.
// It returns a middleware, which Express runs on each POST /create before createPost.
router.route("/create").post(validate(createPostSchema), createPost);
router.route("/feed").get(getPost);
router.route("/update/:id").patch(validate(updatePostSchema), updatePost);
router.route("/delete/:id").delete(deletePost);

export default router;
