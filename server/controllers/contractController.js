import Contract from "../models/Contract.js";

export const getMyContracts = async (req, res) => {
  try {
    const { wallet } = req.query;

    if (!wallet) {
      return res
        .status(400)
        .json({ message: "Thiếu địa chỉ ví (wallet param)" });
    }

    const lowerWallet = wallet.toLowerCase();

    // Tìm trong DB tất cả hợp đồng mà ví này có tham gia (bất kể vai trò)
    const contracts = await Contract.find({
      $or: [
        { client: lowerWallet },
        { provider: lowerWallet },
        { receiver: lowerWallet },
      ],
    }).sort({ createdAt: -1 }); // sắp xếp mới nhất lên đầu

    res.status(200).json(contracts);
  } catch (error) {
    console.error("Lỗi lấy danh sách:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};
