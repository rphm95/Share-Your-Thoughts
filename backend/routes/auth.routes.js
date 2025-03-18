import express from "express";
import { login, logout, signup } from "../controllers/auth.controller.js";
// from here we can send the function to controllers, just so this page does not get too packed up and hard to read.

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

export default router;
