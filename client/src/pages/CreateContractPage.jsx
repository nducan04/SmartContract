import React, { useState } from "react";
import { useWeb3 } from "../context/Web3Context";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import axios from "axios";

const CreateContractPage = () => {
  // State form
  const [receiver, setReceiver] = useState("");
  const [terms, setTerms] = useState("");
  const [amount, setAmount] = useState("");
  const [deadline, setDeadline] = useState(""); // Mới: Hạn chót
  const [penalty, setPenalty] = useState(""); // Mới: Tiền phạt
  const [file, setFile] = useState(null);

  // State xử lý
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const { factoryContract, signer } = useWeb3();
  const navigate = useNavigate();

  // 1. HÀM TẢI FILE LÊN IPFS (PINATA)
  const uploadToIPFS = async () => {
    if (!file) {
      setError("Vui lòng chọn một file điều khoản (PDF, JPG...)");
      return null;
    }

    setStatus("Đang tải file điều khoản lên IPFS...");
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
    } catch (ipfsError) {
      console.error("Lỗi khi tải lên IPFS:", ipfsError);
      setError("Không thể tải file lên IPFS. Vui lòng kiểm tra API Key.");
      return null;
    }
  };

  // 2. HÀM SUBMIT FORM
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("");

    // --- Validate cơ bản ---
    if (!factoryContract || !signer) {
      setError("Vui lòng kết nối ví trước khi tạo hợp đồng.");
      return;
    }
    if (!ethers.isAddress(receiver)) {
      setError("Địa chỉ ví Người nhận không hợp lệ.");
      return;
    }
    if (parseFloat(penalty) > parseFloat(amount)) {
      setError("Tiền phạt không được lớn hơn tổng số tiền ký quỹ.");
      return;
    }

    setLoading(true);

    // --- BƯỚC A: Tải file lên IPFS ---
    const termsHash = await uploadToIPFS();
    if (!termsHash) {
      setLoading(false);
      return;
    }
    setStatus(`File đã tải lên IPFS! Hash: ${termsHash}`);

    try {
      // --- BƯỚC B: CHUẨN BỊ DỮ LIỆU BLOCKCHAIN ---
      setStatus("Đang chuẩn bị giao dịch...");

      // 1. Chuyển tiền sang Wei
      const amountInWei = ethers.parseEther(amount);
      const penaltyInWei = ethers.parseEther(penalty);

      // 2. Chuyển đổi ngày giờ sang Unix Timestamp (giây)
      const deadlineTimestamp = Math.floor(new Date(deadline).getTime() / 1000);

      // --- BƯỚC C: GỌI SMART CONTRACT ---
      // Hàm createAgreement mới nhận 5 tham số: receiver, terms, hash, deadline, penalty
      const tx = await factoryContract.createAgreement(
        receiver,
        terms,
        termsHash,
        deadlineTimestamp,
        penaltyInWei,
        { value: amountInWei } // Gửi kèm tiền ký quỹ
      );

      setStatus("Đang chờ xác nhận giao dịch (xin chờ)...");
      await tx.wait();

      setLoading(false);
      setStatus("Thành công! Hợp đồng đã được tạo.");

      // Chuyển hướng
      setTimeout(() => {
        navigate("/dashboard/contracts");
      }, 2000);
    } catch (txError) {
      setLoading(false);
      console.error("Lỗi khi tạo hợp đồng:", txError);
      setError("Giao dịch thất bại. Bạn đã hủy, hoặc không đủ Gas.");
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Tạo Hợp Đồng Mới
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-8 shadow-lg rounded-lg border border-gray-200"
      >
        {/* Địa chỉ người nhận */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Địa chỉ ví người nhận (Receiver)
          </label>
          <input
            type="text"
            required
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            placeholder="0x..."
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Mô tả */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Mô tả Dịch vụ / Hàng hóa
          </label>
          <textarea
            rows={3}
            required
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            placeholder="Ví dụ: Vận chuyển lô hàng A..."
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Lưới 2 cột cho Tiền và Phạt */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Số tiền Ký quỹ (ETH)
            </label>
            <input
              type="number"
              step="0.0001"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="VD: 0.1"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* INPUT MỚI: TIỀN PHẠT */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phạt nếu muộn (ETH)
            </label>
            <input
              type="number"
              step="0.0001"
              required
              value={penalty}
              onChange={(e) => setPenalty(e.target.value)}
              placeholder="VD: 0.01"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Sẽ trừ vào tiền ký quỹ nếu quá hạn.
            </p>
          </div>
        </div>

        {/* INPUT MỚI: THỜI HẠN */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Thời hạn giao hàng (Deadline)
          </label>
          <input
            type="datetime-local"
            required
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            File Điều khoản (PDF, JPG...)
          </label>
          <input
            type="file"
            required
            onChange={(e) => setFile(e.target.files[0])}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0 file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full px-6 py-3 text-white font-semibold rounded-lg shadow-md transition-all
                    ${
                      loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
          >
            {loading ? "Đang xử lý..." : "Tạo Hợp đồng & Ký quỹ"}
          </button>

          {/* Error & Status Message */}
          {status && (
            <p className="mt-4 text-sm text-green-600 font-medium">{status}</p>
          )}
          {error && (
            <p className="mt-4 text-sm text-red-600 font-medium">{error}</p>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateContractPage;
