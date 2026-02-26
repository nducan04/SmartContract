import React, { useState, useEffect } from "react";
import { useWeb3 } from "../context/Web3Context";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import QRModal from "../components/QRModal";

import ContractListHeader from "../components/contractList/ContractListHeader";
import ContractFilters from "../components/contractList/ContractFilters";
import ContractTable from "../components/contractList/ContractTable";
import { exportContractToExcel } from "../utils/exportExcel";

const ContractListPage = () => {
  const { walletAddress } = useWeb3();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State quản lý dữ liệu gốc và dữ liệu hiển thị
  const [contracts, setContracts] = useState([]);
  const [filteredContracts, setFilteredContracts] = useState([]); // Dữ liệu sau khi lọc
  const [loading, setLoading] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedContractAddress, setSelectedContractAddress] = useState(null);

  const roleFilter = searchParams.get("role") || "all";

  // --- STATE CHO TÙY CHỌN BỘ LỌC XUẤT FILE ---
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // --- LOGIC 1: Lấy dữ liệu từ API ---
  useEffect(() => {
    const fetchContracts = async () => {
      if (!walletAddress) {
        setLoading(false);
        setContracts([]);
        setFilteredContracts([]);
        return;
      }

      try {
        setLoading(true);
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const response = await axios.get(
          `${API_URL}/api/contracts?wallet=${walletAddress}`,
        );

        // Sắp xếp mới nhất lên đầu ngay từ đầu
        const sortedData = response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
        setContracts(sortedData);
      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContracts();
  }, [walletAddress]);

  // --- LOGIC 2: Lọc dữ liệu theo Role và Ngày tháng ---
  useEffect(() => {
    let result = [...contracts];

    // 1. Lọc theo vai trò (Tabs)
    if (roleFilter === "client")
      result = result.filter((c) => c.client === walletAddress.toLowerCase());
    if (roleFilter === "provider")
      result = result.filter((c) => c.provider === walletAddress.toLowerCase());
    if (roleFilter === "receiver")
      result = result.filter((c) => c.receiver === walletAddress.toLowerCase());

    // 2. Lọc theo Ngày bắt đầu (Từ ngày)
    if (startDate) {
      const start = new Date(startDate).getTime();
      result = result.filter((c) => new Date(c.createdAt).getTime() >= start);
    }

    // 3. Lọc theo Ngày kết thúc (Đến ngày)
    if (endDate) {
      // Cộng thêm 1 ngày (24h) để lấy trọn vẹn ngày kết thúc
      const end = new Date(endDate).getTime() + 86400000;
      result = result.filter((c) => new Date(c.createdAt).getTime() <= end);
    }

    setFilteredContracts(result);
  }, [contracts, roleFilter, startDate, endDate, walletAddress]);

  // --- Các hàm xử lý sự kiện ---
  const handleShowQR = (address) => {
    setSelectedContractAddress(address);
    setShowQRModal(true);
  };

  const handleFilterChange = (role) => {
    setSearchParams({ role });
  };

  // Hàm xuất Excel: Chỉ xuất danh sách đã lọc (filteredContracts)
  const handleExportExcel = () => {
    if (filteredContracts.length === 0) {
      alert("Không có dữ liệu nào trong khoảng thời gian này để xuất!");
      return;
    }

    // Đóng gói các tiêu chí lọc hiện tại
    const currentFilters = {
      role: roleFilter,
      startDate: startDate,
      endDate: endDate,
    };

    const fileName = `BaoCao_${startDate || "All"}đến${endDate || "All"}`;

    // Truyền thêm currentFilters vào hàm
    exportContractToExcel(filteredContracts, currentFilters, fileName);
  };

  return (
    <div className="p-2 relative">
      <ContractListHeader
        onCreate={() => navigate("/dashboard/create")}
        onExport={handleExportExcel}
      />

      {/* --- KHU VỰC TÙY CHỌN LỌC (TIÊU CHÍ CHỌN) --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <ContractFilters
          currentFilter={roleFilter}
          onFilterChange={handleFilterChange}
        />

        {/* Lọc theo ngày tháng */}
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-medium">Từ ngày:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-medium">Đến ngày:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 outline-none focus:border-blue-500"
            />
          </div>
          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
              className="text-red-500 hover:bg-red-50 px-2 py-1.5 rounded-lg transition-colors font-medium cursor-pointer"
              title="Xóa bộ lọc ngày"
            >
              Xóa lọc
            </button>
          )}
        </div>
      </div>

      {!walletAddress ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="uil uil-wallet text-3xl"></i>
          </div>
          <h3 className="text-lg font-bold text-gray-700">Chưa kết nối ví</h3>
          <p className="text-gray-500 mt-2 px-4">
            Vui lòng kết nối ví MetaMask.
          </p>
        </div>
      ) : (
        <ContractTable
          contracts={filteredContracts} // <--- Truyền mảng đã lọc vào Table
          loading={loading}
          walletAddress={walletAddress}
          onShowQR={handleShowQR}
          onViewDetails={(addr) => navigate(`/dashboard/contract/${addr}`)}
        />
      )}

      {!loading && walletAddress && (
        <p className="text-xs text-gray-400 mt-4 ml-2">
          Đang hiển thị {filteredContracts.length} / {contracts.length} hợp
          đồng.
        </p>
      )}

      <QRModal
        show={showQRModal}
        onClose={() => setShowQRModal(false)}
        contractId={selectedContractAddress}
      />
    </div>
  );
};

export default ContractListPage;
