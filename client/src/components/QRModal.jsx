import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { QrCode, X, Copy, Check, ExternalLink, Printer } from "lucide-react";

const QRModal = ({ show, onClose, contractId }) => {
  const [copySuccess, setCopySuccess] = useState(false);

  if (!show) return null;

  const currentDomain = window.location.origin;
  const qrUrl = `${currentDomain}/tracking/${contractId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(contractId);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 print:p-0 print:bg-white print:absolute animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in border border-slate-200/80 dark:border-slate-800 print:shadow-none print:w-full print:max-w-none">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center print:hidden">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-sm">
            <QrCode className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Mã QR Định Danh Blockchain</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 flex flex-col items-center text-center">
          {/* QR Canvas Container */}
          <div className="p-4 bg-white rounded-2xl shadow-md border border-slate-200 mb-5 print:border-4 print:border-black">
            <QRCodeCanvas
              value={qrUrl}
              size={200}
              level={"H"}
              includeMargin={true}
            />
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 print:text-black">
            Quét mã để tra cứu hành trình & điều khoản hợp đồng.
          </p>

          {/* Contract Address + Copy */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 mb-5 print:hidden max-w-full">
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs truncate">
              {contractId
                ? `${contractId.slice(0, 8)}...${contractId.slice(-6)}`
                : "..."}
            </span>

            <button
              onClick={handleCopy}
              className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              title="Sao chép địa chỉ"
            >
              {copySuccess ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          <a
            href={qrUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-xs font-bold hover:underline print:hidden"
          >
            <span>Mở liên kết tra cứu</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex gap-3 border-t border-slate-100 dark:border-slate-800 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In tem</span>
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-slate-900 dark:bg-slate-700 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRModal;
