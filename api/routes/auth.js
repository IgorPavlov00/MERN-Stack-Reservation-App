import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("hello this is auth request!");
});

router.get("/register", (req, res) => {
  res.send("hello this is register request!");
});
export default router;
