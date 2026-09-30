import React, { useState } from "react";
import { shortenAddress } from "../utils/shortenAddress.js";
import { Copy, Check } from "lucide-react";

const AddressDisplay = ({ address, showLabel = true }) => {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  if (!address || address === "0x0000000000000000000000000000000000000000") {
    return <span className="text-slate-400 italic text-xs">(Chưa có)</span>;
  }

  return (
    <div className="inline-flex items-center gap-1.5" title={address}>
      {/* 1. Rút gọn địa chỉ với dark mode */}
      <span className="font-mono text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-200/70 dark:border-slate-700/70 text-xs font-semibold select-all">
        {shortenAddress(address)}
      </span>

      {/* 2. Nút Copy */}
      <button
        type="button"
        onClick={handleCopy}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative p-1 cursor-pointer rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
        aria-label="Copy address"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-emerald-500" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}

        {isHovered && !copied && (
          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 px-2 py-0.5 bg-slate-900 text-white text-[10px] font-semibold rounded-md shadow-lg pointer-events-none whitespace-nowrap z-50 animate-fade-in">
            Sao chép
          </span>
        )}
      </button>
    </div>
  );
};

export default AddressDisplay;
