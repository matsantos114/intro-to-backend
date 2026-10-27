import { Router } from "express";
import { registeredUser, loginUser, logoutUser } from "../controller/user.controllers.js";
import { validate } from "../middleware/validate.middleware.js";
import { registerSchema, loginSchema } from "../schemas/user.schema.js";

const router = Router();

router.route("/register").post(validate(registerSchema), registeredUser);
router.route("/login").post(validate(loginSchema), loginUser);
// No schema on logout yet. It will change completely when we add real authentication.
router.route("/logout").post(logoutUser);

export default router;
