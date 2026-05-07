import express from "express";
import { signin, getme, login } from "./controller.js";
import { authenticateToken } from "../middleware/auth.js";
const router = express.Router();

router.route("/signin").post(signin);
router.route("/login").post(login);
router.route("/getme").get(authenticateToken, getme);
export default router;
