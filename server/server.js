import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import startListener from "./services/eventListener.js";
import contractRoutes from "./routes/contractRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

connectDB();

app.get("/", (req, res) =>
  res.send("Logistics DApp Backend is Running on Render!"),
);
app.use("/api/contracts", contractRoutes);

app.listen(PORT, () => {
  console.log(`Server đang chạy tại port ${PORT}`);
  startListener();
});
