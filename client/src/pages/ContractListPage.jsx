import React, { useState, useEffect } from "react";
import { useWeb3 } from "../context/Web3Context";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import QRModal from "../components/QRModal";
import Swal from "sweetalert2";
import { useLanguage } from "../context/LanguageContext";

import ContractListHeader from "../components/contractList/ContractListHeader";
import ContractFilters from "../components/contractList/ContractFilters";
import ContractTable from "../components/contractList/ContractTable";
import { exportContractToExcel } from "../utils/exportExcel";

const ContractListPage = () => {
  const { walletAddress } = useWeb3();
  const { t } = useLanguage();
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
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "all",
  );

  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setLoading(true);
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
        
        let params = new URLSearchParams();
        params.append("page", pagination.page);
        params.append("limit", 10);
        
        if (roleFilter !== "all") params.append("role", roleFilter);
        if (statusFilter !== "all") params.append("status", statusFilter);
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        if (walletAddress) params.append("wallet", walletAddress);

        const endpoint = walletAddress ? "/api/contracts" : "/api/contracts/all";
        const apiUrl = `${API_URL}${endpoint}?${params.toString()}`;

        const response = await axios.get(apiUrl);

        if (response.data && response.data.data) {
          setContracts(response.data.data);
          setFilteredContracts(response.data.data);
          setPagination(response.data.pagination);
        } else {
          // Fallback api cũ
          const sortedData = response.data.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
          );
          setContracts(sortedData);
          setFilteredContracts(sortedData);
        }
      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContracts();
  }, [walletAddress, pagination.page, roleFilter, statusFilter, startDate, endDate]);

  // Reset trang về 1 khi thay đổi bộ lọc
  useEffect(() => {
    setPagination((p) => {
      if (p.page !== 1) {
        return { ...p, page: 1 };
      }
      return p;
    });
  }, [roleFilter, statusFilter, startDate, endDate, walletAddress]);

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
      Swal.fire({
        title: "Không có dữ liệu",
        text: "Không có dữ liệu nào phù hợp với bộ lọc hiện tại để xuất!",
        icon: "warning",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Đã hiểu",
      });
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
    <div className="p-2 relative flex flex-col xl:flex-row gap-6 items-start w-full">
      <div className="w-full xl:flex-1 min-w-0">
        <ContractListHeader
          onCreate={() => navigate("/dashboard/create")}
          onExport={handleExportExcel}
        />

        {!walletAddress && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-xl mb-6 shadow-sm flex items-start gap-3">
            <div>
              <p className="font-bold text-blue-900">
                {t("listGuestWarning")}
              </p>
              <p className="text-sm mt-1">
                {t("listGuestSub")}
              </p>
            </div>
          </div>
        )}

        {/* --- KHU VỰC BỘ LỌC NÂNG CAO --- */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-bold text-gray-800">
              {t("listFilterTitle")}
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
                <span className="text-gray-500 font-medium">{t("listFilterStatus")}</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-gray-700 outline-none focus:border-blue-500 bg-white"
                >
                  <option value="all">{t("listFilterAll")}</option>
                  <option value="0">{t("listFilterStatus0")}</option>
                  <option value="1">{t("listFilterStatus1")}</option>
                  <option value="2">{t("listFilterStatus2")}</option>
                  <option value="3">{t("listFilterStatus3")}</option>
                  <option value="4">{t("listFilterStatus4")}</option>
                  <option value="5">{t("listFilterStatus5")}</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-medium">{t("listFilterFrom")}</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 outline-none focus:border-blue-500 bg-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-medium">{t("listFilterTo")}</span>
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
                  <i className="uil uil-times-circle"></i> {t("listFilterClear")}
                </button>
              )}
            </div>
          </div>
        </div>

        <ContractTable
          contracts={filteredContracts}
          loading={loading}
          walletAddress={walletAddress}
          onShowQR={handleShowQR}
          onViewDetails={(addr) => navigate(`/dashboard/contract/${addr}`)}
        />

        {!loading && (
          <p className="text-xs text-gray-400 mt-4 ml-2 font-medium">
            <i className="uil uil-info-circle"></i> {t("listShowing")}{" "}
            {filteredContracts.length} / {pagination.total || contracts.length}{" "}
            {t("listContractsByCriteria")}
          </p>
        )}

        {/* Điều khiển Phân trang */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <span className="text-sm text-gray-500 font-medium">
              {t("listPage")} {pagination.page} / {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() =>
                  setPagination((p) => ({ ...p, page: p.page - 1 }))
                }
                className="px-4 py-2 text-sm font-medium border border-gray-200 bg-white rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {t("listPrev")}
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() =>
                  setPagination((p) => ({ ...p, page: p.page + 1 }))
                }
                className="cursor-pointer px-4 py-2 text-sm font-medium border border-gray-200 bg-white rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {t("listNext")}
              </button>
            </div>
          </div>
        )}
      </div>

      <QRModal
        show={showQRModal}
        onClose={handleCloseQR}
        contractId={selectedContractAddress}
      />
    </div>
  );
};

export default ContractListPage;
