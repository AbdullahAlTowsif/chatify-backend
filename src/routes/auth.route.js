import express from 'express';
const router = express.Router();

router.get("/signup", (req, res) => {
  res.send({ message: "Signup route" });
});

router.get("/login", (req, res) => {
  res.send({ message: "Login route" });
});

router.get("/logout", (req, res) => {
  res.send({ message: "Signup route" });
});


export default router;