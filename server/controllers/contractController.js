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

export const updateStatus = async (req, res) => {
  try {
    // Lấy thêm 'provider' từ request body
    const { contractAddress, status, provider } = req.body;

    if (!contractAddress || status === undefined) {
      return res.status(400).json({ message: "Thiếu thông tin cần thiết" });
    }

    // Tạo object chứa dữ liệu cần update
    let updateData = { status: status };

    // QUAN TRỌNG: Nếu có gửi kèm provider (lúc bấm Chấp nhận), thì update vào DB
    // Chuyển về chữ thường để đồng bộ
    if (provider) {
      updateData.provider = provider.toLowerCase();
    }

    // Tìm và cập nhật
    const updatedContract = await Contract.findOneAndUpdate(
      { contractAddress: contractAddress },
      updateData,
      { new: true }
    );

    if (!updatedContract) {
      return res.status(404).json({ message: "Không tìm thấy hợp đồng" });
    }

    console.log(
      `🔄 Đã cập nhật: ${contractAddress} -> Status: ${status}, Provider: ${
        provider || "Giữ nguyên"
      }`
    );

    res.status(200).json({ message: "Success", contract: updatedContract });
  } catch (error) {
    console.error("Lỗi update:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

// Theo Dõi Hợp Đồng
export const getAvailableContracts = async (req, res) => {
  try {
    // Tìm tất cả hợp đồng có status = 0 (Mới tạo)
    // Sắp xếp mới nhất lên đầu
    const contracts = await Contract.find({ status: 0 }).sort({
      createdAt: -1,
    });

    res.status(200).json(contracts);
  } catch (error) {
    console.error("Lỗi lấy danh sách sẵn có:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};
