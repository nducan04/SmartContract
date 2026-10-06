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
import {
  Filter,
  Calendar,
  RotateCcw,
  Info,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from "lucide-react";

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

  useEffect(() => {
    setPagination((p) => {
      if (p.page !== 1) {
        return { ...p, page: 1 };
      }
      return p;
    });
  }, [roleFilter, statusFilter, startDate, endDate, walletAddress]);

  const handleShowQR = (address) => {
    setSelectedContractAddress(address);
    setShowQRModal(true);
  };

  const handleCloseQR = () => {
    setShowQRModal(false);
    setSelectedContractAddress(null);
  };

  const handleExportExcel = () => {
    if (filteredContracts.length === 0) {
      Swal.fire({
        title: t("alertNoDataTitle") || "Không có dữ liệu",
        text: t("alertNoDataText") || "Không có dữ liệu nào phù hợp với bộ lọc hiện tại để xuất!",
        icon: "warning",
        confirmButtonColor: "#3085d6",
        confirmButtonText: t("alertUnderstandBtn") || "Đã hiểu",
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
    <div className="space-y-6 animate-fade-in">
      <ContractListHeader
        onCreate={() => navigate("/dashboard/create")}
        onExport={handleExportExcel}
      />

      {!walletAddress && (
        <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-blue-800 dark:text-blue-200 px-4 py-3.5 rounded-2xl shadow-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm text-blue-900 dark:text-blue-100">
              {t("listGuestWarning")}
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
              {t("listGuestSub")}
            </p>
          </div>
        </div>
      )}

      {/* KHU VỰC BỘ LỌC NÂNG CAO */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            {t("listFilterTitle")}
          </h3>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="w-full lg:w-auto">
            <ContractFilters
              currentFilter={roleFilter}
              onFilterChange={(role) => setSearchParams({ role })}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm w-full lg:w-auto p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            {/* Status select */}
            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400 font-semibold">{t("listFilterStatus")}</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 bg-white dark:bg-slate-900 cursor-pointer"
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

            {/* Date range */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 dark:text-slate-400 font-semibold">{t("listFilterFrom")}</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 bg-white dark:bg-slate-900"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 dark:text-slate-400 font-semibold">{t("listFilterTo")}</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 bg-white dark:bg-slate-900"
              />
            </div>

            {(startDate || endDate || statusFilter !== "all") && (
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setStatusFilter("all");
                }}
                className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-2.5 py-1.5 rounded-lg transition-colors font-bold text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t("listFilterClear")}</span>
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
            <Info className="w-4 h-4 text-slate-400" />
            <span>
              {t("listShowing")} {filteredContracts.length} / {pagination.total || contracts.length}{" "}
              {t("listContractsByCriteria")}
            </span>
          </p>

          {pagination.totalPages > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold mr-2">
                {t("listPage")} {pagination.page} / {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page <= 1}
                onClick={() =>
                  setPagination((p) => ({ ...p, page: p.page - 1 }))
                }
                className="p-2 text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() =>
                  setPagination((p) => ({ ...p, page: p.page + 1 }))
                }
                className="p-2 text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
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
