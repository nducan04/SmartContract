import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";
import EmailSettingsModal from "./EmailSettingsModal";

const UserDropdown = ({ walletAddress, walletBalance, disconnectWallet }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Nút Avatar để bật/tắt */}
      <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none">
        <img
          src={assets.anh_pmt || assets.clientImg} // Fallback nếu chưa có ảnh
          className="rounded-full h-9 w-9 border border-gray-200 hover:ring-2 hover:ring-blue-300 transition-all"
          alt="Avatar"
        />
      </button>

      {/* Menu Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl py-4 px-5 z-50 border border-gray-100 animation-fade-in">
          {/* Header của Dropdown */}
          <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
            <img
              src={assets.anh_pmt || assets.clientImg}
              className="rounded-full h-12 w-12"
              alt="Avatar"
            />
            <div>
              <p className="font-bold text-gray-800">Tài khoản của tôi</p>
              <p className="text-xs text-green-600 font-medium">
                ● Đang kết nối
              </p>
            </div>
          </div>

          {/* Thông tin Ví */}
          <div className="space-y-3 py-4">
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">
                Địa chỉ ví
              </p>
              <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg mt-1">
                <p className="text-sm font-mono text-gray-700 truncate w-48">
                  {walletAddress}
                </p>
                <button
                  onClick={() => navigator.clipboard.writeText(walletAddress)}
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                  title="Sao chép"
                >
                  <i className="uil uil-copy"></i>
                </button>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">
                Số dư hiện tại
              </p>
              <p className="text-xl font-bold text-blue-600 mt-1">
                {walletBalance ? parseFloat(walletBalance).toFixed(4) : "0"} ETH
              </p>
            </div>
          </div>

          {/* Các nút chức năng */}
          <div className="pt-2 border-t border-gray-100 flex flex-col space-y-1">
            <button
              onClick={() => {
                setIsOpen(false);
                setIsEmailModalOpen(true);
              }}
              className="flex items-center justify-center space-x-2 text-blue-600 hover:bg-blue-50 p-2 rounded-lg w-full transition-colors font-medium"
            >
              <i className="uil uil-envelope text-lg"></i>
              <span>Cài đặt Email Thông Báo</span>
            </button>
            <button
              onClick={disconnectWallet}
              className="flex items-center justify-center space-x-2 text-red-500 hover:bg-red-50 p-2 rounded-lg w-full transition-colors font-medium"
            >
              <i className="uil uil-sign-out-alt text-lg"></i>
              <span>Ngắt kết nối ví</span>
            </button>
          </div>
        </div>
      )}

      {/* Thêm Modal Cài đặt Email */}
      <EmailSettingsModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        walletAddress={walletAddress}
      />
    </div>
  );
};

export default UserDropdown;
