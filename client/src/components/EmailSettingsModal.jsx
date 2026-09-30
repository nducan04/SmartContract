import React, { useState, useEffect } from "react";
import axios from "axios";
import { ethers } from "ethers";
import { Mail, X, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";

const EmailSettingsModal = ({ isOpen, onClose, walletAddress }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    if (isOpen && walletAddress) {
      setMessage("");
      setError("");

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
      if (!window.ethereum) throw new Error("Vui lòng cài đặt MetaMask");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const messageToSign = `Cập nhật email nhận thông báo: ${email}`;
      const signature = await signer.signMessage(messageToSign);

      await axios.post(`${backendUrl}/api/users/settings`, {
        walletAddress,
        email,
        signature,
      });

      setMessage("Đã lưu thiết lập email thành công!");
      setTimeout(() => {
        onClose();
        setMessage("");
      }, 1500);
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
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 sm:p-7 w-full max-w-md relative border border-slate-200/80 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
          <Mail className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1.5">
          Cài đặt nhận thông báo
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
          Nhận email cảnh báo tự động khi hợp đồng vận chuyển sắp đến hạn chót (trước 48 giờ).
        </p>

        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Địa chỉ Email của bạn
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@gmail.com"
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 transition-all font-medium"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-semibold border border-rose-200 dark:border-rose-900/50 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-semibold border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Đang ký ví...</span>
              </>
            ) : (
              <span>Lưu cài đặt</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailSettingsModal;
