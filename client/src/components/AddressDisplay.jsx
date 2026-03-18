import React, { useState } from "react";
import { shortenAddress } from "../utils/shortenAddress.js";

const AddressDisplay = ({ address, showLabel = true }) => {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation(); // Ngăn chặn sự kiện click lan ra ngoài (để không bị nhảy trang khi bấm copy)
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  if (!address || address === "0x0000000000000000000000000000000000000000") {
    return <span className="text-gray-400 italic text-sm">(Chưa có)</span>;
  }

  return (
    <div className="flex items-center gap-2" title={address}>
      {/* 1. Địa chỉ đã rút gọn */}
      <span className="font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded border border-gray-200 text-sm">
        {shortenAddress(address)}
      </span>

      {/* 2. Nút Copy (Sử dụng onMouseEnter thay vì group-hover) */}
      <button
        onClick={handleCopy}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="text-gray-400 hover:text-blue-600 transition-colors relative p-1 cursor-pointer"
      >
        {copied ? (
          <i className="uil uil-check text-green-500 text-lg"></i>
        ) : (
          <i className="uil uil-copy text-lg"></i>
        )}

        {/* Tooltip: Chỉ hiện khi isHovered = true và chưa copy */}
        {isHovered && !copied && (
          <span
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white 
          text-xs rounded shadow-lg transition-opacity pointer-events-none whitespace-nowrap z-50"
          >
            Sao chép
          </span>
        )}
      </button>

    </div>
  );
};

export default AddressDisplay;
