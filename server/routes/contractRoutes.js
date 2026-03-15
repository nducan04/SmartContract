import express from "express";
import {
  getAvailableContracts,
  getMyContracts,
  updateStatus,
  getAllContractsForAdmin,
  getStats,
} from "../controllers/contractController.js";

const router = express.Router();

// GET /api/contracts
router.get("/", getMyContracts);
router.get("/stats", getStats);

router.put("/update-status", updateStatus);
router.get("/available", getAvailableContracts);
router.get("/all-admin", getAllContractsForAdmin);

export default router;
