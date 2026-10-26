import { Router } from "express";
import { registeredUser, loginUser, logoutUser } from "../controller/user.controllers.js";

const router = Router();

router.route("/register").post(registeredUser);
router.route("/login").post(loginUser);
router.route("/logout").post(logoutUser);

export default router;
