import express from "express";
import { getMyContracts } from "../controllers/contractController.js";

const router = express.Router();

// GET /api/contracts
router.get("/", getMyContracts);

export default router;
