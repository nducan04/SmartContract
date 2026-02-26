import express from "express";
import {
  getAvailableContracts,
  getMyContracts,
  updateStatus,
} from "../controllers/contractController.js";
import { getAllContractsForAdmin } from "../controllers/contractController.js";

const router = express.Router();

// GET /api/contracts
router.get("/", getMyContracts);

router.put("/update-status", updateStatus);
router.get("/available", getAvailableContracts);
router.get("/all-admin", getAllContractsForAdmin);

export default router;
