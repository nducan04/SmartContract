import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import startListener from "./services/eventListener.js";
import contractRoutes from "./routes/contractRoutes.js";

// Khởi tạo App
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Kết nối Database
await connectDB();

// API Routes
app.get("/", (req, res) => res.send("Logistics DApp Backend is Running!"));

app.use("/api/contracts", contractRoutes);

// Khởi chạy Server
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại port ${PORT}`);

  startListener();
});
