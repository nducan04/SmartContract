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

  const [contracts, setContracts] = useState([]);
  const [filteredContracts, setFilteredContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedContractAddress, setSelectedContractAddress] = useState(null);

  const roleFilter = searchParams.get("role") || "all";

  // --- STATE CHO BỘ LỌC NÂNG CAO ---
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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

  // --- LOGIC LỌC ĐA ĐIỀU KIỆN ---
  useEffect(() => {
    let result = [...contracts];

    if (roleFilter === "client")
      result = result.filter((c) => c.client === walletAddress.toLowerCase());
    if (roleFilter === "provider")
      result = result.filter((c) => c.provider === walletAddress.toLowerCase());
    if (roleFilter === "receiver")
      result = result.filter((c) => c.receiver === walletAddress.toLowerCase());

    if (statusFilter !== "all") {
      result = result.filter((c) => c.status.toString() === statusFilter);
    }

    if (startDate) {
      const start = new Date(startDate).getTime();
      result = result.filter((c) => new Date(c.createdAt).getTime() >= start);
    }
    if (endDate) {
      const end = new Date(endDate).getTime() + 86400000;
      result = result.filter((c) => new Date(c.createdAt).getTime() <= end);
    }

    setFilteredContracts(result);
  }, [contracts, roleFilter, startDate, endDate, statusFilter, walletAddress]);

  // --- CÁC HÀM XỬ LÝ SỰ KIỆN ---
  const handleShowQR = (address) => {
    setSelectedContractAddress(address);
    setShowQRModal(true);
  };

  // ĐÂY LÀ HÀM BỊ THIẾU ĐÃ ĐƯỢC THÊM LẠI
  const handleCloseQR = () => {
    setShowQRModal(false);
    setSelectedContractAddress(null);
  };

  const handleExportExcel = () => {
    if (filteredContracts.length === 0) {
      alert("Không có dữ liệu nào phù hợp với bộ lọc hiện tại để xuất!");
      return;
    }

    const currentFilters = {
      role: roleFilter,
      startDate: startDate,
      endDate: endDate,
      status: statusFilter,
    };

    const fileName = `BaoCao_HD_Logistics`;
    exportContractToExcel(filteredContracts, currentFilters, fileName);
  };

  return (
    <div className="p-2 relative">
      <ContractListHeader
        onCreate={() => navigate("/dashboard/create")}
        onExport={handleExportExcel}
      />

      {/* --- KHU VỰC BỘ LỌC NÂNG CAO --- */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <i className="uil uil-filter text-blue-600 text-lg"></i>
          <h3 className="font-bold text-gray-800">
            Bộ lọc & Trích xuất dữ liệu
          </h3>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="w-full lg:w-auto">
            <ContractFilters
              currentFilter={roleFilter}
              onFilterChange={(role) => setSearchParams({ role })}
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm w-full lg:w-auto p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-medium">Trạng thái:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-gray-700 outline-none focus:border-blue-500 bg-white"
              >
                <option value="all">-- Tất cả --</option>
                <option value="0">Mới tạo (Chờ nhận)</option>
                <option value="1">Đã chấp nhận</option>
                <option value="2">Đang thực hiện</option>
                <option value="3">Đã hoàn thành (Chờ TT)</option>
                <option value="4">Đã thanh toán (Xong)</option>
                <option value="5">Đã hủy</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-medium">Từ:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 outline-none focus:border-blue-500 bg-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-medium">Đến:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 outline-none focus:border-blue-500 bg-white"
              />
            </div>

            {(startDate || endDate || statusFilter !== "all") && (
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setStatusFilter("all");
                }}
                className="text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors font-bold"
              >
                <i className="uil uil-times-circle"></i> Xóa lọc
              </button>
            )}
          </div>
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
          contracts={filteredContracts}
          loading={loading}
          walletAddress={walletAddress}
          onShowQR={handleShowQR}
          onViewDetails={(addr) => navigate(`/dashboard/contract/${addr}`)}
        />
      )}

      {!loading && walletAddress && (
        <p className="text-xs text-gray-400 mt-4 ml-2 font-medium">
          <i className="uil uil-info-circle"></i> Đang hiển thị{" "}
          {filteredContracts.length} / {contracts.length} hợp đồng theo tiêu
          chí.
        </p>
      )}

      <QRModal
        show={showQRModal}
        onClose={handleCloseQR}
        contractId={selectedContractAddress}
      />
    </div>
  );
};

export default ContractListPage;
