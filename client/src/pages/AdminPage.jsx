import React, { useState, useEffect } from "react";
import { useWeb3 } from "../context/Web3Context";
import { useLanguage } from "../context/LanguageContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ethers } from "ethers";
import AddressDisplay from "../components/AddressDisplay";
import QRModal from "../components/QRModal";
import StatusPill from "../components/ui/StatusPill";
import Swal from "sweetalert2";
import {
  ShieldCheck,
  FileText,
  Coins,
  Truck,
  QrCode,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Lock,
  Sparkles
} from "lucide-react";

// HÀM GIẢI MÃ JSON
const parseTerms = (termsString) => {
  if (!termsString) return null;
  try {
    const parsed = JSON.parse(termsString);
    if (parsed && typeof parsed === "object" && "partyA_name" in parsed)
      return parsed;
    return null;
  } catch (error) {
    return null;
  }
};

// COMPONENT DÒNG THÔNG MINH CHO ADMIN
const AdminContractRow = ({ c, onShowQR, onViewDetails }) => {
  const { t, language } = useLanguage();
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
    ? t("adminLoadingData")
    : parsedTerms
      ? parsedTerms.art1_items
      : terms || t("adminNoContent");
  const clientName = parsedTerms ? parsedTerms.partyA_name : null;
  const receiverName = parsedTerms ? parsedTerms.partyB_name : null;

  return (
    <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors border-b border-slate-100 dark:border-slate-800/80">
      <td className="p-4 align-top whitespace-nowrap">
        <AddressDisplay address={c.contractAddress} />
      </td>
      <td className="p-4 align-top min-w-[280px]">
        <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">
          {displayTitle}
        </p>
      </td>
      <td className="p-4 align-top">
        {clientName ? (
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
              {clientName}
            </p>
            <div className="text-[11px] text-slate-400 mt-0.5">
              <AddressDisplay address={c.client} />
            </div>
          </div>
        ) : (
          <AddressDisplay address={c.client} />
        )}
      </td>
      <td className="p-4 align-top">
        {receiverName ? (
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
              {receiverName}
            </p>
            <div className="text-[11px] text-slate-400 mt-0.5">
              <AddressDisplay address={c.receiver} />
            </div>
          </div>
        ) : (
          <AddressDisplay address={c.receiver} />
        )}
      </td>
      <td className="p-4 align-top whitespace-nowrap">
        {c.provider &&
        c.provider !== "0x0000000000000000000000000000000000000000" ? (
          <AddressDisplay address={c.provider} />
        ) : (
          <span className="text-[11px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
            {t("adminUnassigned")}
          </span>
        )}
      </td>
      <td className="p-4 align-top">
        <StatusPill status={c.status} size="sm" />
      </td>
      <td className="p-4 align-top text-xs text-slate-500 font-medium whitespace-nowrap">
        {new Date(c.createdAt).toLocaleDateString(language === "vi" ? "vi-VN" : "en-US")}
      </td>

      <td className="p-4 align-top text-right">
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => onShowQR(c.contractAddress)}
            className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title={t("adminActionQR")}
          >
            <QrCode className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onViewDetails(c.contractAddress)}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold text-xs hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white rounded-lg transition-all cursor-pointer whitespace-nowrap"
          >
            <span>{t("adminActionViewDetails")}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </td>
    </tr>
  );
};

const AdminPage = () => {
  const { walletAddress } = useWeb3();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [allContracts, setAllContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedContractAddress, setSelectedContractAddress] = useState(null);

  const ADMIN_WALLETS = import.meta.env.VITE_ADMIN_WALLETS
    ? import.meta.env.VITE_ADMIN_WALLETS.split(",").map((addr) =>
        addr.trim().toLowerCase(),
      )
    : [];

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!walletAddress) {
      return;
    }

    if (!ADMIN_WALLETS.includes(walletAddress.toLowerCase())) {
      Swal.fire({
        title: t("adminAccessDenied") || "Từ chối truy cập",
        text: t("adminAccessDeniedDesc") || "⛔ Bạn không có quyền truy cập trang Quản trị!",
        icon: "error",
        confirmButtonColor: "#d33",
        confirmButtonText: t("adminBackBtn") || "Quay lại",
      }).then(() => {
        navigate("/dashboard");
      });
      return;
    }

    setIsAuth(true);

    const fetchAllData = async () => {
      try {
        setLoading(true);
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const response = await axios.get(
          `${API_URL}/api/contracts/all-admin?requester=${walletAddress}&page=${pagination.page}&limit=10`,
        );

        if (response.data && response.data.data) {
          setAllContracts(response.data.data);
          setPagination(response.data.pagination);
        } else {
          const sortedData = response.data.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
          );
          setAllContracts(sortedData);
        }
      } catch (error) {
        console.error("Lỗi Admin:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [walletAddress, navigate, pagination.page, t]);

  const handleShowQR = (address) => {
    setSelectedContractAddress(address);
    setShowQRModal(true);
  };

  const handleCloseQR = () => {
    setShowQRModal(false);
    setSelectedContractAddress(null);
  };

  if (!walletAddress) {
    return (
      <div className="flex flex-col justify-center items-center py-32">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent mb-4"></div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
          {t("adminAuthVerifying")}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {t("adminAuthSub")}
        </p>
      </div>
    );
  }

  if (!isAuth || loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <ShieldCheck className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
              {t("adminBadge")}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t("adminTitle")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t("adminSubtitle")}
          </p>
        </div>
      </div>

      {/* STATS BENTO CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              {t("adminTotalContracts")}
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
            {pagination.total || allContracts.length}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {t("adminTotalContractsSub")}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              {t("adminTotalVolume")}
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
            {allContracts
              .reduce((sum, c) => sum + parseFloat(c.amount || 0), 0)
              .toFixed(4)}{" "}
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">ETH</span>
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {t("adminTotalVolumeSub")}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              {t("adminOperating")}
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
            {allContracts.filter((c) => c.status > 0 && c.status < 3).length}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {t("adminOperatingSub")}
          </span>
        </div>
      </div>

      {/* BẢNG DỮ LIỆU TOÀN CỤC */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center">
          <h2 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            {t("adminAllTableTitle")}
          </h2>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse table-auto min-w-[1200px]">
            <thead className="bg-slate-800 dark:bg-slate-950 text-white text-[11px] uppercase tracking-wider font-bold">
              <tr>
                <th className="p-4 whitespace-nowrap">{t("adminThId")}</th>
                <th className="p-4 whitespace-nowrap">{t("adminThContent")}</th>
                <th className="p-4 whitespace-nowrap">{t("adminThPartyA")}</th>
                <th className="p-4 whitespace-nowrap">{t("adminThPartyB")}</th>
                <th className="p-4 whitespace-nowrap">{t("adminThCarrier")}</th>
                <th className="p-4 whitespace-nowrap">{t("adminThStatus")}</th>
                <th className="p-4 whitespace-nowrap">{t("adminThDate")}</th>
                <th className="p-4 text-right whitespace-nowrap">{t("adminThAction")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {allContracts.length > 0 ? (
                allContracts.map((c) => (
                  <AdminContractRow
                    key={c._id}
                    c={c}
                    onShowQR={handleShowQR}
                    onViewDetails={(addr) =>
                      navigate(`/dashboard/contract/${addr}`)
                    }
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="p-12 text-center text-slate-400 text-sm">
                    {t("emptyTable")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              {t("listPage")} {pagination.page} / {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() =>
                  setPagination((p) => ({ ...p, page: p.page - 1 }))
                }
                className="p-2 text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() =>
                  setPagination((p) => ({ ...p, page: p.page + 1 }))
                }
                className="p-2 text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
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

export default AdminPage;
