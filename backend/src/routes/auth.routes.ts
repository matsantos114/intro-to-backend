import { Router } from "express";
import { handleRegister, handleLogin, handleLogout } from "../controller/auth.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { registerSchema, loginSchema } from "../schemas/user.schema.js";

const router = Router();

router.route("/register").post(validate(registerSchema), handleRegister);
router.route("/login").post(validate(loginSchema), handleLogin);
// No schema on logout yet. It will change completely when we add real authentication.
router.route("/logout").post(handleLogout);

export default router;
