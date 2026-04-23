import React, { useState, useEffect } from "react";
import axios from "axios";
import { ethers } from "ethers";

const EmailSettingsModal = ({ isOpen, onClose, walletAddress }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    if (isOpen && walletAddress) {
      // Reset state mỗi lần mở modal
      setMessage("");
      setError("");

      // Gọi API lấy email hiện tại
      axios
        .get(`${backendUrl}/api/users/settings/${walletAddress}`)
        .then((res) => {
          if (res.data.email) {
            setEmail(res.data.email);
          }
        })
        .catch((err) => {
          console.log("Chưa có email hoặc lỗi lấy email", err);
        });
    }
  }, [isOpen, walletAddress, backendUrl]);

  const handleSave = async () => {
    if (!email) {
      setError("Vui lòng nhập email hợp lệ.");
      return;
    }
    setError("");
    setMessage("");
    setLoading(true);

    try {
      // Yêu cầu user ký xác nhận bằng MetaMask
      if (!window.ethereum) throw new Error("Vui lòng cài đặt MetaMask");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const messageToSign = `Cập nhật email nhận thông báo: ${email}`;
      const signature = await signer.signMessage(messageToSign);

      const response = await axios.post(`${backendUrl}/api/users/settings`, {
        walletAddress,
        email,
        signature,
      });

      setMessage("Đã lưu thiết lập email thành công!");
      setTimeout(() => {
        onClose();
        setMessage("");
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          err.message ||
          "Đã xảy ra lỗi khi lưu email.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 animation-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-[400px] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
        >
          <i className="uil uil-times text-2xl"></i>
        </button>

        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Cài đặt thông báo
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Nhận email nhắc nhở khi hợp đồng vận chuyển sắp đến hạn chót (trước 48
          giờ).
        </p>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Địa chỉ Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="vd: nguyenvanA@gmail.com"
          />
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {message && (
          <p className="text-green-500 text-sm mb-4 font-semibold">{message}</p>
        )}

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center cursor-pointer"
        >
          {loading ? (
            <span className="flex items-center">
              <i className="uil uil-spinner-alt animate-spin text-xl mr-2"></i>
              Đang xử lý...
            </span>
          ) : (
            "Lưu Thiết Lập"
          )}
        </button>
      </div>
    </div>
  );
};

export default EmailSettingsModal;
