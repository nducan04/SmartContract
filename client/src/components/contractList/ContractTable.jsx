import React from "react";
import AddressDisplay from "../AddressDisplay";

// (Giữ nguyên statusConfig cũ của bạn ở đây)
const statusConfig = {
  0: {
    label: "Mới tạo",
    bg: "bg-blue-50",
    text: "text-blue-600",
    dot: "bg-blue-600",
  },
  1: {
    label: "Đã chấp nhận",
    bg: "bg-purple-50",
    text: "text-purple-600",
    dot: "bg-purple-600",
  },
  2: {
    label: "Đang thực hiện",
    bg: "bg-yellow-50",
    text: "text-yellow-600",
    dot: "bg-yellow-600",
  },
  3: {
    label: "Đã hoàn thành",
    bg: "bg-green-50",
    text: "text-green-600",
    dot: "bg-green-600",
  },
  4: {
    label: "Đã thanh toán",
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "bg-gray-600",
  },
  5: {
    label: "Đã hủy",
    bg: "bg-red-50",
    text: "text-red-600",
    dot: "bg-red-600",
  },
};

const ContractTable = ({
  contracts,
  loading,
  walletAddress,
  onShowQR,
  onViewDetails,
}) => {
  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (contracts.length === 0)
    return <div className="text-center py-10">Không có dữ liệu</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-bold tracking-wider">
              {/* Cột ID: Luôn hiện */}
              <th className="px-4 py-4 md:px-6">ID</th>

              {/* Cột Nội dung: Ẩn trên mobile (hidden), hiện trên Desktop (md:table-cell) */}
              <th className="px-6 py-4 hidden md:table-cell">Nội dung</th>

              {/* Cột Vai trò: Ẩn trên mobile */}
              <th className="px-6 py-4 hidden md:table-cell">Vai trò</th>

              {/* Cột Giá trị: Ẩn trên mobile */}
              <th className="px-6 py-4 hidden md:table-cell">Giá trị</th>

              {/* Cột Trạng thái: Luôn hiện */}
              <th className="px-4 py-4 md:px-6">Trạng thái</th>

              {/* Cột Hành động: Luôn hiện */}
              <th className="px-4 py-4 md:px-6 text-center">Hành động</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {contracts.map((contract) => {
              const status = statusConfig[contract.status] || statusConfig[0];

              // (Giữ nguyên logic xác định vai trò myRole của bạn)
              let myRole = "Liên quan";
              const currentWallet = walletAddress
                ? walletAddress.toLowerCase()
                : "";
              if (currentWallet === contract.client) myRole = "Client";
              else if (currentWallet === contract.provider) myRole = "Provider";
              else if (currentWallet === contract.receiver) myRole = "Receiver";

              return (
                <tr
                  key={contract._id}
                  className="hover:bg-blue-50/50 transition-colors"
                >
                  {/* ID */}
                  <td className="px-4 py-4 md:px-6">
                    <AddressDisplay address={contract.contractAddress} />
                  </td>

                  {/* Nội dung - Ẩn mobile */}
                  <td className="px-6 py-4 max-w-xs hidden md:table-cell">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {contract.terms}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(contract.createdAt).toLocaleDateString()}
                    </p>
                  </td>

                  {/* Vai trò - Ẩn mobile */}
                  <td className="px-6 py-4 text-sm text-gray-600 hidden md:table-cell">
                    {myRole}
                  </td>

                  {/* Giá trị - Ẩn mobile */}
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="font-mono font-bold text-gray-800">
                      {contract.amount} ETH
                    </span>
                  </td>

                  {/* Trạng thái */}
                  <td className="px-4 py-4 md:px-6">
                    {/* Trên mobile chỉ hiện chấm tròn màu, trên desktop hiện cả chữ */}
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${status.bg} ${status.text}`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${status.dot} mr-0 md:mr-2`}
                      ></span>
                      <span className="hidden md:inline">{status.label}</span>
                    </span>
                  </td>

                  {/* Hành động - Làm gọn nút trên mobile */}
                  <td className="px-4 py-4 md:px-6 text-center">
                    <div className="flex items-center justify-end md:justify-center gap-2">
                      <button
                        onClick={() => onShowQR(contract.contractAddress)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-800 hover:text-white"
                      >
                        <i className="uil uil-qrcode-scan"></i>
                      </button>

                      <button
                        onClick={() => onViewDetails(contract.contractAddress)}
                        className="w-8 h-8 md:w-auto md:px-3 md:py-1.5 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white"
                      >
                        {/* Mobile hiện icon mũi tên, Desktop hiện chữ "Xem chi tiết" */}
                        <i className="uil uil-arrow-right text-lg md:hidden"></i>
                        <span className="hidden md:inline">Chi tiết</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default ContractTable;
