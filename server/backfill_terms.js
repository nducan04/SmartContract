import mongoose from "mongoose";
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const contractSchema = new mongoose.Schema(
  {
    contractAddress: { type: String, required: true, unique: true, trim: true },
    client: { type: String, required: true, lowercase: true, trim: true },
    provider: { type: String, lowercase: true, trim: true, default: null },
    receiver: { type: String, required: true, lowercase: true, trim: true },
    amount: { type: String, required: true },
    terms: { type: String },
    termsHash: { type: String },
    deliveryDeadline: { type: Number },
    penaltyAmount: { type: String },
    isLate: { type: Boolean, default: false },
    status: { type: Number, default: 0 },
    proofs: {
      step0: { type: String, default: "" },
      step1: { type: String, default: "" },
      step2: { type: String, default: "" },
      step3: { type: String, default: "" },
      step4: { type: String, default: "" },
    }
  },
  { timestamps: true }
);

const Contract = mongoose.model("Contract", contractSchema);

const escrowABI = [
  "function getAgreementDetails() view returns (uint8, address, address, address, uint256, string terms)"
];

async function backfill() {
  try {
    const uri = process.env.MONGO_URI || "mongodb+srv://nducan08_db_user:nducan081311242@cluster0.pu5qdx7.mongodb.net/logistics_db?retryWrites=true&w=majority";
    await mongoose.connect(uri);
    console.log("Connected to MongoDB.");

    const rpcUrl = process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    const contracts = await Contract.find({ $or: [{ terms: { $exists: false } }, { terms: "" }] });
    console.log(`Found ${contracts.length} contracts needing terms backfill.`);

    for (const c of contracts) {
      try {
        console.log(`Fetching terms for ${c.contractAddress}...`);
        const sc = new ethers.Contract(c.contractAddress, escrowABI, provider);
        const data = await sc.getAgreementDetails();
        const terms = data[5];
        c.terms = terms;
        await c.save();
        console.log(`Updated ${c.contractAddress} successfully.`);
      } catch (err) {
        console.error(`Failed to fetch for ${c.contractAddress}:`, err.message);
      }
    }

    console.log("Backfill complete.");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

backfill();
