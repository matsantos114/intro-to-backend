import { Router } from "express";
import {
  createPost,
  getPost,
  updatePost,
  deletePost
} from "../controller/post.controller.js";

const router = Router();

router.route("/create").post(createPost);
router.route("/feed").get(getPost);
router.route("/update/:id").patch(updatePost);
router.route("/delete/:id").delete(deletePost);

export default router;
