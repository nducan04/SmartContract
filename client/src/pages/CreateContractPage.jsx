import React, { useState } from "react";
import { useWeb3 } from "../context/Web3Context";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import axios from "axios";

const CreateContractPage = () => {
  const [receiver, setReceiver] = useState("");
  const [terms, setTerms] = useState("");
  const [amount, setAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [penalty, setPenalty] = useState("");
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const { factoryContract, signer, walletAddress } = useWeb3();
  const navigate = useNavigate();

  const uploadToIPFS = async () => {
    if (!file) {
      setError("Vui lòng chọn một file điều khoản.");
      return null;
    }
    setStatus("⏳ Đang tải file lên IPFS...");
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(url, formData, {
        maxBodyLength: "Infinity",
        headers: {
          "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
          Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
        },
      });
      return response.data.IpfsHash;
    } catch (err) {
      console.error(err);
      setError("❌ Lỗi tải IPFS. Kiểm tra API Key.");
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("");

    if (!factoryContract || !signer) {
      setError("Vui lòng kết nối ví.");
      return;
    }
    if (!ethers.isAddress(receiver)) {
      setError("Địa chỉ ví không hợp lệ.");
      return;
    }

    // Validate số tiền
    const amountNum = parseFloat(amount);
    const penaltyNum = parseFloat(penalty);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Số tiền ký quỹ phải lớn hơn 0.");
      return;
    }
    if (penaltyNum > amountNum) {
      setError("Tiền phạt không được lớn hơn ký quỹ.");
      return;
    }

    setLoading(true);

    const termsHash = await uploadToIPFS();
    if (!termsHash) {
      setLoading(false);
      return;
    }

    try {
      setStatus("✍ Đang ký xác nhận trên ví...");
      const amountInWei = ethers.parseEther(amount);
      const penaltyInWei = ethers.parseEther(penalty || "0");
      const deadlineTimestamp = Math.floor(new Date(deadline).getTime() / 1000);

      const tx = await factoryContract.createAgreement(
        receiver,
        terms,
        termsHash,
        deadlineTimestamp,
        penaltyInWei,
        { value: amountInWei }
      );

      setStatus("🚀 Đang chờ Blockchain xác nhận...");
      await tx.wait();

      setStatus("✅ Thành công! Đang chuyển hướng...");
      setTimeout(() => navigate("/dashboard/contracts"), 2000);
    } catch (err) {
      console.error(err);
      setError("❌ Giao dịch thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <i className="uil uil-plus-circle text-blue-600"></i> Tạo Hợp Đồng Mới
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CỘT TRÁI: FORM NHẬP LIỆU */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nhóm 1: Người nhận & Nội dung */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Người nhận (Receiver Wallet)
                </label>
                <div className="relative">
                  <i className="uil uil-wallet absolute left-3 top-3 text-gray-400 text-lg"></i>
                  <input
                    type="text"
                    required
                    value={receiver}
                    onChange={(e) => setReceiver(e.target.value)}
                    placeholder="0x..."
                    className="pl-10 w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Nội dung Hợp đồng
                </label>
                <textarea
                  rows={3}
                  required
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  placeholder="Mô tả chi tiết công việc..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Nhóm 2: Tiền nong (Grid 2 cột) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Ký quỹ (ETH)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-gray-500 font-bold">
                    ETH
                  </span>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-14 w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Phạt vi phạm (ETH)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-red-500 font-bold">
                    ETH
                  </span>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={penalty}
                    onChange={(e) => setPenalty(e.target.value)}
                    className="pl-14 w-full px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none text-red-600"
                  />
                </div>
              </div>
            </div>

            {/* Nhóm 3: Thời gian & File */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Hạn chót (Deadline)
                </label>
                <input
                  type="datetime-local"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  File đính kèm
                </label>
                <input
                  type="file"
                  required
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4
                        file:rounded-xl file:border-0 file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>
            </div>

            {/* Submit & Messages */}
            <div className="pt-4">
              {status && (
                <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>{" "}
                  {status}
                </div>
              )}
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm font-medium">
                  <i className="uil uil-exclamation-triangle"></i> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer
                    ${
                      loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-linear-to-r from-blue-600 to-indigo-600 hover:shadow-blue-200"
                    }`}
              >
                {loading ? "Đang xử lý..." : "Xác nhận & Tạo Hợp đồng"}
              </button>
            </div>
          </form>
        </div>

        {/* CỘT PHẢI: LIVE PREVIEW (XEM TRƯỚC) */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="text-lg font-bold text-gray-700">Xem trước</h3>

          {/* Card mô phỏng */}
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
              MỚI
            </div>

            <div className="mb-4">
              <p className="text-xs text-gray-400 uppercase font-bold">
                Giá trị hợp đồng
              </p>
              <p className="text-3xl font-bold text-blue-600">
                {amount || "0.0"} ETH
              </p>
            </div>

            <div className="space-y-3 border-t border-gray-100 pt-4">
              <div>
                <p className="text-xs text-gray-400 font-bold">
                  Người tạo (Bạn)
                </p>
                <p className="text-sm font-mono text-gray-600 truncate">
                  {walletAddress || "Chưa kết nối"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold">Người nhận</p>
                <p className="text-sm font-mono text-gray-600 truncate">
                  {receiver || "Chưa nhập..."}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold">Nội dung</p>
                <p className="text-sm text-gray-800 line-clamp-2 italic">
                  "{terms || "Chưa nhập nội dung..."}"
                </p>
              </div>
            </div>

            {penalty && (
              <div className="mt-4 bg-red-50 p-3 rounded-xl border border-red-100">
                <p className="text-xs text-red-500 font-bold flex items-center gap-1">
                  <i className="uil uil-info-circle"></i> Điều khoản phạt
                </p>
                <p className="text-sm text-red-700 font-medium">
                  Trừ {penalty} ETH nếu trễ hạn.
                </p>
              </div>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-2xl text-blue-800 text-sm leading-relaxed">
            <p>
              <strong>💡 Lưu ý:</strong> Sau khi tạo, tiền ký quỹ sẽ bị khóa
              trong Smart Contract. Chỉ khi Người nhận xác nhận, tiền mới được
              chuyển đi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateContractPage;
