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
  addCheckpoint,
  deleteCheckpoint,
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
router.put("/update-tracking", addCheckpoint);
router.put("/delete-tracking", deleteCheckpoint);
router.get("/track/:address", getContractByAddress);

export default router;
