import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import AddressDisplay from "../AddressDisplay";

const parseTerms = (termsString) => {
  if (!termsString) return null;
  try {
    const parsed = JSON.parse(termsString);
    if (parsed && typeof parsed === "object" && "art1_items" in parsed)
      return parsed;
    return null;
  } catch (error) {
    return null;
  }
};

const ContractRow = ({
  c,
  walletAddress,
  onShowQR,
  onViewDetails,
  getRoleBadge,
  getStatusBadge,
}) => {
  const [terms, setTerms] = useState(c.terms || "");
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (!terms || !terms.includes("partyA_name")) {
      const fetchFromBlockchain = async () => {
        setIsSyncing(true);
        try {
          const rpcProvider = new ethers.JsonRpcProvider(
            "https://ethereum-sepolia-rpc.publicnode.com",
          );
          const abi = [
            "function getAgreementDetails() view returns (uint8, address, address, address, uint256, string terms)",
          ];
          const sc = new ethers.Contract(c.contractAddress, abi, rpcProvider);
          const data = await sc.getAgreementDetails();
          setTerms(data[5]);
        } catch (error) {
          console.error("Lỗi đồng bộ terms:", error);
        } finally {
          setIsSyncing(false);
        }
      };
      fetchFromBlockchain();
    }
  }, [c.contractAddress, terms]);

  const parsedTerms = parseTerms(terms);
  const displayTitle = isSyncing
    ? "⏳ Đang tải dữ liệu từ Blockchain..."
    : parsedTerms
      ? parsedTerms.art1_items
      : terms || "Không có nội dung";

  return (
    <tr className="hover:bg-gray-50/50 transition-colors border-b border-gray-100">
      {/* Thêm align-top để các cột luôn thẳng hàng ở mép trên */}
      <td className="px-4 py-5 align-top">
        <AddressDisplay address={c.contractAddress} />
      </td>

      <td className="px-4 py-5 align-top">
        {/* Đã bỏ line-clamp và max-w, thêm break-words và whitespace-normal */}
        <p className="text-sm font-semibold text-gray-800 whitespace-normal break-words leading-relaxed">
          {displayTitle}
        </p>
      </td>

      <td className="px-4 py-5 align-top">{getRoleBadge(c)}</td>

      <td className="px-4 py-5 align-top">
        <span className="font-bold text-gray-900 whitespace-nowrap">
          {c.amount} ETH
        </span>
      </td>

      <td className="px-4 py-5 align-top">{getStatusBadge(c.status)}</td>

      <td className="px-4 py-5 align-top text-center">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onShowQR(c.contractAddress)}
            className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            title="Hiện mã QR"
          >
            <i className="uil uil-qrcode-scan text-lg"></i>
          </button>
          <button
            onClick={() => onViewDetails(c.contractAddress)}
            className="px-4 py-2 bg-blue-50 text-blue-600 font-bold text-sm hover:bg-blue-600 hover:text-white rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            Chi tiết
          </button>
        </div>
      </td>
    </tr>
  );
};

const ContractTable = ({
  contracts,
  loading,
  walletAddress,
  onShowQR,
  onViewDetails,
}) => {
  if (loading)
    return <div className="text-center p-10">Đang tải dữ liệu...</div>;

  if (contracts.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
        <i className="uil uil-folder-open text-4xl text-gray-300"></i>
        <p className="text-gray-500 mt-2">Không có hợp đồng nào.</p>
      </div>
    );
  }

  const getRoleBadge = (contract) => {
    const current = walletAddress?.toLowerCase();
    if (contract.client.toLowerCase() === current)
      return (
        <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded">
          Client
        </span>
      );
    if (contract.provider?.toLowerCase() === current)
      return (
        <span className="text-xs font-bold px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
          Provider
        </span>
      );
    if (contract.receiver.toLowerCase() === current)
      return (
        <span className="text-xs font-bold px-2 py-1 bg-purple-100 text-purple-700 rounded">
          Receiver
        </span>
      );
    return null;
  };

  const getStatusBadge = (status) => {
    const map = [
      { text: "Mới tạo", color: "bg-gray-100 text-gray-600" },
      { text: "Đã chấp nhận", color: "bg-purple-100 text-purple-700" },
      { text: "Đang thực hiện", color: "bg-yellow-100 text-yellow-700" },
      { text: "Đã hoàn thành", color: "bg-green-100 text-green-700" },
      { text: "Đã thanh toán", color: "bg-blue-100 text-blue-700" },
      { text: "Đã hủy", color: "bg-red-100 text-red-700" },
    ];
    const s = map[status] || map[0];
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 w-max ${s.color}`}
      >
        <div
          className={`w-1.5 h-1.5 rounded-full ${s.color.split(" ")[1].replace("text", "bg")}`}
        ></div>
        {s.text}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        {/* Thêm table-fixed và chia % độ rộng cột */}
        <table className="w-full text-left border-collapse table-fixed min-w-[1000px]">
          <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-4 w-[18%]">Mã Hợp Đồng (ID)</th>
              <th className="px-4 py-4 w-[34%]">Tên Hàng Hóa / Dịch vụ</th>
              <th className="px-4 py-4 w-[10%]">Vai Trò</th>
              <th className="px-4 py-4 w-[12%]">Giá Trị</th>
              <th className="px-4 py-4 w-[14%]">Trạng Thái</th>
              <th className="px-4 py-4 w-[12%] text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((c) => (
              <ContractRow
                key={c._id}
                c={c}
                walletAddress={walletAddress}
                onShowQR={onShowQR}
                onViewDetails={onViewDetails}
                getRoleBadge={getRoleBadge}
                getStatusBadge={getStatusBadge}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContractTable;
