import User from "../models/User.js";
import { ethers } from "ethers";

export const getEmail = async (req, res) => {
  try {
    const { walletAddress } = req.params;
    if (!walletAddress) {
      return res.status(400).json({ error: "Missing walletAddress" });
    }

    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ email: user.email });
  } catch (error) {
    console.error("Lỗi lấy email:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateEmail = async (req, res) => {
  try {
    const { walletAddress, email, signature } = req.body;

    if (!walletAddress || !email || !signature) {
      return res.status(400).json({ error: "Vui lòng cung cấp đủ địa chỉ ví, email và chữ ký" });
    }

    // Xác thực chữ ký
    const message = `Cập nhật email nhận thông báo: ${email}`;
    const recoveredAddress = ethers.verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(401).json({ error: "Chữ ký không hợp lệ" });
    }

    // Cập nhật hoặc tạo mới
    const user = await User.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase() },
      { email },
      { new: true, upsert: true } // upsert: nếu chưa có thì tạo mới
    );

    res.status(200).json({ message: "Cập nhật email thành công", user });
  } catch (error) {
    console.error("Lỗi cập nhật email:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
