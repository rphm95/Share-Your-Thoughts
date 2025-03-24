import express from "express";
import { login, logout, signup, getMe } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";
// from here we can send the function to controllers, just so this page does not get too packed up and hard to read.

const router = express.Router();

router.get("/me", protectRoute, getMe);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);


export default router;
