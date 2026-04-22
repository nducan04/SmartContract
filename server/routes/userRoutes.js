import express from "express";
import { getEmail, updateEmail } from "../controllers/userController.js";

const router = express.Router();

router.get("/:walletAddress", getEmail);
router.post("/", updateEmail);

export default router;
