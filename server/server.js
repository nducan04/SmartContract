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

connectDB();

app.get("/", (req, res) => {
  res.send("Logistics DApp Backend is Running on Vercel!");
});

app.use("/api/contracts", contractRoutes);

// 1. Nếu đang chạy ở máy cá nhân (Localhost), dùng app.listen()
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại port ${PORT}`);
    startListener();
  });
}
// 2. Nếu đang chạy trên Vercel (Production)
else {
  startListener();
}

export default app;
