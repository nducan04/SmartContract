import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

const QRModal = ({ show, onClose, contractId }) => {
  const [copySuccess, setCopySuccess] = useState(false);

  if (!show) return null;

  // Lấy domain hiện tại
  const currentDomain = window.location.origin;
  // Tạo link đích
  const qrUrl = `${currentDomain}/tracking/${contractId}`;

  // Hàm xử lý copy
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(contractId);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // Reset sau 2s
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  // Hàm in mã QR (Mô phỏng in tem)
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:p-0 print:bg-white print:absolute">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in-up print:shadow-none print:w-full print:max-w-none">
        {/* Header - Ẩn khi in */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center print:hidden">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <i className="uil uil-qrcode-scan text-blue-600 text-xl"></i>
            Mã QR Định Danh
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-colors text-2xl cursor-pointer w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="p-8 flex flex-col items-center text-center">
          {/* Khung chứa QR */}
          <div className="p-4 bg-white border-2 border-blue-100 rounded-xl shadow-sm mb-5 print:border-4 print:border-black">
            <QRCodeCanvas
              value={qrUrl}
              size={220}
              level={"H"}
              includeMargin={true}
            />
          </div>

          <p className="text-sm text-gray-500 mb-6 print:text-black print:font-bold">
            Quét mã để xem chi tiết hợp đồng.
          </p>

          {/* Địa chỉ rút gọn + Nút Copy */}
          <div className="flex flex-col items-center gap-2 mb-6 w-full print:hidden">
            <span className="text-xs text-gray-400 uppercase tracking-wide font-bold">
              Contract Address
            </span>

            <div className="flex items-center justify-center gap-2 bg-gray-50 pl-4 pr-2 py-1.5 rounded-full border border-gray-100 max-w-full mt-1.5">
              <span className="font-mono font-bold text-blue-500 text-sm truncate">
                {contractId
                  ? `${contractId.slice(0, 8)}...${contractId.slice(-6)}`
                  : "..."}
              </span>

              <button
                onClick={handleCopy}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm text-gray-400 
                hover:text-blue-600 transition-all cursor-pointer relative"
                title="Sao chép toàn bộ địa chỉ"
              >
                {copySuccess ? (
                  <i className="uil uil-check text-green-500"></i>
                ) : (
                  <i className="uil uil-copy"></i>
                )}
              </button>
            </div>
          </div>

          {/* Nút mở link trực tiếp - Ẩn khi in */}
          <a
            href={qrUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-100 
            transition-colors print:hidden"
          >
            <i className="uil uil-external-link-alt"></i>
            Mở liên kết
          </a>
        </div>

        {/* Footer - Ẩn khi in */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between gap-3 border-t border-gray-100 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-100 hover:text-black transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <i className="uil uil-print"></i> In mã
          </button>

          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-900 transition-colors shadow-lg shadow-gray-200 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRModal;
