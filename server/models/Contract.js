import mongoose from "mongoose";

const contractSchema = new mongoose.Schema(
  {
    // 1. Định danh
    contractAddress: { type: String, required: true, unique: true, trim: true },

    // 2. Các bên tham gia (Lưu địa chỉ ví)
    client: { type: String, required: true, lowercase: true, trim: true },

    provider: { type: String, owercase: true, trim: true, default: null },

    receiver: { type: String, required: true, lowercase: true, trim: true },

    // 3. Thông tin chi tiết
    amount: { type: String, required: true },
    terms: { type: String },
    termsHash: { type: String },

    // 4. Trạng thái (Mapping với Enum trong Solidity)
    // 0: Created, 1: Accepted, 2: InProgress, 3: Completed, 4: Paid, 5: Cancelled
    status: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Tạo index để tìm kiếm nhanh hơn (Ví dụ: tìm tất cả hợp đồng của 1 ông Client)
contractSchema.index({ client: 1 });
contractSchema.index({ provider: 1 });
contractSchema.index({ receiver: 1 });

const Contract = mongoose.model("Contract", contractSchema);

export default Contract;
