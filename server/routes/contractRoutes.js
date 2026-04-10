import express from "express";
import {
  getAvailableContracts,
  getMyContracts,
  updateStatus,
  getAllContractsForAdmin,
  getStats,
  uploadProofHash,
  getContractByAddress,
  getAllContracts,
} from "../controllers/contractController.js";

const router = express.Router();

// GET /api/contracts
router.get("/", getMyContracts);
router.get("/stats", getStats);

router.put("/update-status", updateStatus);
router.get("/available", getAvailableContracts);
router.get("/all", getAllContracts);
router.get("/all-admin", getAllContractsForAdmin);

router.put("/upload-proof", uploadProofHash);
router.get("/track/:address", getContractByAddress);

export default router;
