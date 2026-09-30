import Contract from "../models/Contract.js";

// Helper to get pagination data
const getPaginationOptions = (req) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const getMyContracts = async (req, res) => {
  try {
    const { wallet, role, status, startDate, endDate } = req.query;

    if (!wallet) {
      return res
        .status(400)
        .json({ message: "Thiếu địa chỉ ví (wallet param)" });
    }

    const lowerWallet = wallet.toLowerCase();
    const { page, limit, skip } = getPaginationOptions(req);

    const query = {};

    if (role === "client") {
      query.client = lowerWallet;
    } else if (role === "provider") {
      query.provider = lowerWallet;
    } else if (role === "receiver") {
      query.receiver = lowerWallet;
    } else {
      query.$or = [
        { client: lowerWallet },
        { provider: lowerWallet },
        { receiver: lowerWallet },
      ];
    }

    if (status && status !== "all") {
      query.status = parseInt(status);
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        query.createdAt.$lt = end;
      }
    }

    const total = await Contract.countDocuments(query);
    const contracts = await Contract.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      data: contracts,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { contractAddress, status, provider } = req.body;

    if (!contractAddress || status === undefined) {
      return res.status(400).json({ message: "Thiếu thông tin cần thiết" });
    }

    let updateData = { status: status };

    if (provider) {
      updateData.provider = provider.toLowerCase();
    }

    const updatedContract = await Contract.findOneAndUpdate(
      { contractAddress: contractAddress },
      updateData,
      { new: true },
    );

    if (!updatedContract) {
      return res.status(404).json({ message: "Không tìm thấy hợp đồng" });
    }

    console.log(
      `🔄 Đã cập nhật: ${contractAddress} -> Status: ${status}, Provider: ${provider || "Giữ nguyên"
      }`,
    );

    res.status(200).json({ message: "Success", contract: updatedContract });
  } catch (error) {
    console.error("Lỗi update:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

export const getAvailableContracts = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationOptions(req);
    const query = { status: 0 };

    const total = await Contract.countDocuments(query);
    const contracts = await Contract.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      data: contracts,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách sẵn có:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

export const getAllContractsForAdmin = async (req, res) => {
  try {
    const { requester } = req.query;

    // Đọc danh sách Admin từ .env, thay vì hardcode
    const envAdmins = process.env.ADMIN_WALLETS || "";
    const ADMIN_WALLETS_SERVER = envAdmins
      .split(",")
      .map((addr) => addr.trim().toLowerCase())
      .filter((addr) => addr !== "");

    if (!requester || !ADMIN_WALLETS_SERVER.includes(requester.toLowerCase())) {
      return res.status(403).json({
        message: "⛔ Quyền truy cập bị từ chối: Bạn không phải Admin!",
      });
    }

    const { page, limit, skip } = getPaginationOptions(req);
    const { status, startDate, endDate } = req.query;

    const query = {};
    if (status && status !== "all") {
      query.status = parseInt(status);
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        query.createdAt.$lt = end;
      }
    }

    const total = await Contract.countDocuments(query);
    const contracts = await Contract.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      data: contracts,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Lỗi lấy dữ liệu Admin:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getAllContracts = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationOptions(req);
    const { status, startDate, endDate } = req.query;

    const query = {};
    if (status && status !== "all") {
      query.status = parseInt(status);
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        query.createdAt.$lt = end;
      }
    }

    const total = await Contract.countDocuments(query);
    const contracts = await Contract.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      data: contracts,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Lỗi lấy tất cả dữ liệu:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const { wallet } = req.query;
    if (!wallet) {
      return res.status(400).json({ message: "Missing wallet parameter" });
    }
    const lowerWallet = wallet.toLowerCase();

    // Thực hiện đếm song song để tối ưu tốc độ
    const [clientCount, providerCount, receiverCount, waitingConfirmCount, completedCount, totalContracts] = await Promise.all([
      Contract.countDocuments({ client: lowerWallet }),
      Contract.countDocuments({ provider: lowerWallet }),
      Contract.countDocuments({ receiver: lowerWallet }),
      Contract.countDocuments({ receiver: lowerWallet, status: 3 }),
      Contract.countDocuments({
        $or: [
          { client: lowerWallet },
          { provider: lowerWallet },
          { receiver: lowerWallet },
        ],
        status: 4
      }),
      Contract.countDocuments({
        $or: [
          { client: lowerWallet },
          { provider: lowerWallet },
          { receiver: lowerWallet },
        ]
      })
    ]);

    // Trả về cả danh sách hợp đồng gần đây (2 cái mới nhất)
    const recentContracts = await Contract.find({
      $or: [
        { client: lowerWallet },
        { provider: lowerWallet },
        { receiver: lowerWallet },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(2);

    // Tính toán phân bố trạng thái cho biểu đồ thống kê
    const statusAgg = await Contract.aggregate([
      {
        $match: {
          $or: [
            { client: lowerWallet },
            { provider: lowerWallet },
            { receiver: lowerWallet },
          ],
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const statusDistribution = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    statusAgg.forEach((item) => {
      if (item._id !== null && item._id !== undefined) {
        statusDistribution[item._id] = item.count;
      }
    });

    res.status(200).json({
      client: clientCount,
      provider: providerCount,
      receiver: receiverCount,
      waitingConfirm: waitingConfirmCount,
      completed: completedCount,
      totalContracts: totalContracts,
      statusDistribution: statusDistribution,
      recentList: recentContracts,
    });
  } catch (error) {
    console.error("Lỗi thống kê:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

export const uploadProofHash = async (req, res) => {
  try {
    const { contractAddress, step, ipfsHash } = req.body;

    if (!contractAddress || !step || !ipfsHash) {
      return res.status(400).json({ message: "Thiếu dữ liệu (contractAddress, step, ipfsHash)" });
    }

    // Tìm hợp đồng và cập nhật đúng cái trường proofs.stepX
    const updateKey = `proofs.${step}`;
    const updatedContract = await Contract.findOneAndUpdate(
      { contractAddress: contractAddress },
      { $set: { [updateKey]: ipfsHash } },
      { new: true }
    );

    if (!updatedContract) {
      return res.status(404).json({ message: "Không tìm thấy hợp đồng" });
    }

    res.status(200).json({ message: "Cập nhật minh chứng thành công", contract: updatedContract });
  } catch (error) {
    console.error("Lỗi cập nhật minh chứng:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

// API Lấy dữ liệu 1 hợp đồng công khai (Dành cho trang Tracking quét QR)
export const getContractByAddress = async (req, res) => {
  try {
    const { address } = req.params;

    // Dùng $regex để tìm kiếm KHÔNG PHÂN BIỆT chữ hoa chữ thường (Case-insensitive)
    const contract = await Contract.findOne({
      contractAddress: { $regex: new RegExp("^" + address + "$", "i") }
    });

    if (!contract) {
      return res.status(404).json({ message: "Không tìm thấy hợp đồng" });
    }

    res.status(200).json(contract);
  } catch (error) {
    console.error("Lỗi tra cứu Tracking:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

export const addCheckpoint = async (req, res) => {
  try {
    const { contractAddress, lat, lng, locationName } = req.body;

    if (!contractAddress || lat === undefined || lng === undefined || !locationName) {
      return res.status(400).json({ message: "Thiếu dữ liệu Checkpoint (lat, lng, locationName)" });
    }

    const checkpoint = {
      lat: Number(lat),
      lng: Number(lng),
      locationName: locationName,
      timestamp: new Date()
    };

    const updatedContract = await Contract.findOneAndUpdate(
      { contractAddress: contractAddress },
      { $push: { trackingHistory: checkpoint } },
      { new: true }
    );

    if (!updatedContract) {
      return res.status(404).json({ message: "Không tìm thấy hợp đồng" });
    }

    res.status(200).json({ message: "Cập nhật checkpoint thành công", contract: updatedContract });
  } catch (error) {
    console.error("Lỗi cập nhật checkpoint:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

export const deleteCheckpoint = async (req, res) => {
  try {
    const { contractAddress, index } = req.body;

    if (!contractAddress || index === undefined) {
      return res.status(400).json({ message: "Thiếu dữ liệu để xóa (contractAddress, index)" });
    }

    const contract = await Contract.findOne({ contractAddress: contractAddress });
    if (!contract) {
      return res.status(404).json({ message: "Không tìm thấy hợp đồng" });
    }

    if (index >= 0 && index < contract.trackingHistory.length) {
      contract.trackingHistory.splice(index, 1);
      await contract.save();
    } else {
      return res.status(400).json({ message: "Index không hợp lệ" });
    }

    res.status(200).json({ message: "Đã xóa checkpoint", contract });
  } catch (error) {
    console.error("Lỗi xóa checkpoint:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};