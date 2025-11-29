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

    // Nếu có gửi kèm provider (thường là lúc bấm Chấp nhận), thì update luôn vào DB
    // Quan trọng: Chuyển về chữ thường (toLowerCase) để đồng bộ với Schema
    if (provider) {
      updateData.provider = provider.toLowerCase();
    }

    // Tìm và cập nhật
    const updatedContract = await Contract.findOneAndUpdate(
      { contractAddress: contractAddress }, // Tìm theo địa chỉ hợp đồng
      updateData, // Cập nhật object dữ liệu mới
      { new: true }
    );

    if (!updatedContract) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy hợp đồng trong DB" });
    }

    console.log(
      `🔄 Đã cập nhật hợp đồng ${contractAddress}: Status=${status} ${
        provider ? `, Provider=${provider}` : ""
      }`
    );

    res
      .status(200)
      .json({ message: "Cập nhật thành công", contract: updatedContract });
  } catch (error) {
    console.error("Lỗi cập nhật trạng thái:", error);
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
