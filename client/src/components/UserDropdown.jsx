import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";
import { useLanguage } from "../context/LanguageContext";
import { Copy, LogOut, CheckCircle2 } from "lucide-react";

const UserDropdown = ({ walletAddress, walletBalance, disconnectWallet }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef(null);
  const { t } = useLanguage();

  // Logic click ra ngoài để đóng menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleCopy = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Nút Avatar để bật/tắt */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="focus:outline-none rounded-full ring-2 ring-transparent hover:ring-blue-500/40 transition-all cursor-pointer"
      >
        <img
          src={assets.anh_pmt || assets.clientImg}
          className="rounded-full h-9 w-9 object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
          alt="Avatar"
        />
      </button>

      {/* Menu Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl py-4 px-5 z-50 border border-slate-200/80 dark:border-slate-800 animate-fade-in-up">
          {/* Header của Dropdown */}
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <img
              src={assets.anh_pmt || assets.clientImg}
              className="rounded-full h-11 w-11 object-cover border border-slate-200 dark:border-slate-700"
              alt="Avatar"
            />
            <div className="min-w-0 flex-1">
              <p className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">
                {t("userWeb3Account") || "Tài khoản Web3"}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  {t("userConnected") || "Đang kết nối"}
                </span>
              </div>
            </div>
          </div>

          {/* Thông tin Ví */}
          <div className="space-y-3 py-4">
            <div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase font-semibold tracking-wider">
                {t("userWalletAddress") || "Địa chỉ ví"}
              </p>
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl mt-1.5 border border-slate-200/60 dark:border-slate-700/60">
                <p className="text-xs font-mono text-slate-700 dark:text-slate-300 truncate w-52">
                  {walletAddress}
                </p>
                <button
                  onClick={handleCopy}
                  className="p-1 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  title={t("userCopy") || "Sao chép"}
                >
                  {copied ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase font-semibold tracking-wider">
                {t("userBalance") || "Số dư hiện tại"}
              </p>
              <div className="mt-1 flex items-baseline gap-1.5">
                <p className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
                  {walletBalance ? parseFloat(walletBalance).toFixed(4) : "0"}
                </p>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  ETH
                </span>
              </div>
            </div>
          </div>

          {/* Các nút chức năng */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col space-y-1.5">
            <button
              onClick={disconnectWallet}
              className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 p-2.5 rounded-xl w-full transition-colors text-sm font-medium cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{t("navDisconnect") || "Ngắt kết nối ví"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
