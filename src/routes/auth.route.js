import express from 'express';
import { signup } from '../controller/auth.controller.js';
const router = express.Router();

router.post("/signup", signup);

router.post("/login", (req, res) => {
  res.send({ message: "Login route" });
});

router.post("/logout", (req, res) => {
  res.send({ message: "Logout route" });
});


export default router;