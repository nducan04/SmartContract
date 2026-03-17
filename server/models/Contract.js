import mongoose from "mongoose";

const contractSchema = new mongoose.Schema(
  {
    // 1. Định danh
    contractAddress: { type: String, required: true, unique: true, trim: true },

    // 2. Các bên tham gia (Lưu địa chỉ ví)
    client: { type: String, required: true, lowercase: true, trim: true },
    provider: { type: String, lowercase: true, trim: true, default: null },
    receiver: { type: String, required: true, lowercase: true, trim: true },

    // 3. Thông tin chi tiết
    amount: { type: String, required: true },
    terms: { type: String },
    termsHash: { type: String }, // Hash IPFS

    deliveryDeadline: { type: Number },
    penaltyAmount: { type: String },
    isLate: { type: Boolean, default: false },

    // 4. Trạng thái (Mapping với Enum trong Solidity)
    // 0: Created, 1: Accepted, 2: InProgress, 3: Completed, 4: Paid, 5: Cancelled
    status: { type: Number, default: 0 },

    proofs: {
      step0: { type: String, default: "" }, // Khởi tạo
      step1: { type: String, default: "" }, // Chấp nhận
      step2: { type: String, default: "" }, // Đang giao
      step3: { type: String, default: "" }, // Hoàn thành
      step4: { type: String, default: "" }, // Thanh toán
    }
  },
  { timestamps: true }
);

// Tạo index để tìm kiếm nhanh hơn
contractSchema.index({ client: 1 });
contractSchema.index({ provider: 1 });
contractSchema.index({ receiver: 1 });

const Contract = mongoose.model("Contract", contractSchema);

export default Contract;
