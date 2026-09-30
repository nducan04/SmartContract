import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useWeb3 } from "../context/Web3Context";
import AddressDisplay from "../components/AddressDisplay";
import { ethers } from "ethers";
import { useLanguage } from "../context/LanguageContext";
import {
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Clock,
  ArrowRight,
  PackageOpen,
  ChevronLeft,
  ChevronRight,
  Coins
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

// COMPONENT DÒNG THÔNG MINH
const ContractRow = ({ contract, walletAddress, navigate }) => {
  const { t } = useLanguage();
  const [terms, setTerms] = useState(contract.terms || "");
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
          const sc = new ethers.Contract(
            contract.contractAddress,
            abi,
            rpcProvider,
          );
          const data = await sc.getAgreementDetails();
          setTerms(data[5]);
        } catch (error) {
          console.error("Lỗi đồng bộ:", error);
        } finally {
          setIsSyncing(false);
        }
      };
      fetchFromBlockchain();
    }
  }, [contract.contractAddress, terms]);

  const currentWallet = walletAddress ? walletAddress.toLowerCase() : "";
  const isClient = currentWallet === contract.client.toLowerCase();
  const isReceiver = currentWallet === contract.receiver.toLowerCase();

  const parsedTerms = parseTerms(terms);

  const displayTitle = isSyncing
    ? "⏳ Đang tải từ Blockchain..."
    : parsedTerms
      ? parsedTerms.art1_items
      : terms || "Chưa có nội dung";
  const clientName = parsedTerms ? parsedTerms.partyA_name : null;
  const receiverName = parsedTerms ? parsedTerms.partyB_name : null;

  return (
    <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors border-b border-slate-100 dark:border-slate-800/80">
      <td className="px-5 py-4 align-middle">
        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-1 break-words">
          {displayTitle}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-200/50 dark:border-emerald-800/50">
            {t("marketNew")}
          </span>
          <AddressDisplay address={contract.contractAddress} />
        </div>
      </td>

      <td className="px-5 py-4 align-middle">
        {clientName ? (
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
              {clientName}
            </p>
            <div className="mt-0.5">
              <AddressDisplay address={contract.client} />
            </div>
          </div>
        ) : (
          <AddressDisplay address={contract.client} />
        )}
      </td>

      <td className="px-5 py-4 align-middle">
        {receiverName ? (
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
              {receiverName}
            </p>
            <div className="mt-0.5">
              <AddressDisplay address={contract.receiver} />
            </div>
          </div>
        ) : (
          <AddressDisplay address={contract.receiver} />
        )}
      </td>

      <td className="px-5 py-4 align-middle">
        <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-3 py-1 rounded-xl border border-blue-200/50 dark:border-blue-900/40 whitespace-nowrap">
          {contract.amount} <span className="text-xs font-bold">ETH</span>
        </span>
      </td>

      <td className="px-5 py-4 align-middle text-right pr-6 sm:pr-8">
        {isClient ? (
          <span className="inline-block whitespace-nowrap text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl cursor-not-allowed">
            {t("marketYourContract")}
          </span>
        ) : isReceiver ? (
          <span className="inline-block whitespace-nowrap text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-3 py-1.5 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
            {t("marketYouAreReceiver")}
          </span>
        ) : (
          <button
            onClick={() =>
              navigate(`/dashboard/contract/${contract.contractAddress}`)
            }
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <span>{t("marketTakeJob")}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </td>
    </tr>
  );
};

const MarketplacePage = () => {
  const { walletAddress } = useWeb3();
  const { t } = useLanguage();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("newest");
  const navigate = useNavigate();

  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  useEffect(() => {
    const fetchAvailableContracts = async () => {
      try {
        setLoading(true);
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const response = await axios.get(
          `${API_URL}/api/contracts/available?page=${pagination.page}&limit=10`,
        );

        let data = [];
        if (response.data && response.data.data) {
          data = response.data.data;
          setPagination(response.data.pagination);
        } else {
          data = response.data;
        }

        if (filter === "newest") {
          data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (filter === "high-price") {
          data.sort((a, b) => Number(b.amount) - Number(a.amount));
        }
        setContracts(data);
      } catch (error) {
        console.error("Lỗi tải sàn hợp đồng:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAvailableContracts();
  }, [filter, pagination.page]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <ShoppingBag className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("marketBadge")}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t("marketTitle")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t("marketSubtitle")}
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-xs">
          <button
            onClick={() => setFilter("newest")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              filter === "newest"
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{t("marketFilterNewest")}</span>
          </button>
          <button
            onClick={() => setFilter("high-price")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              filter === "high-price"
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{t("marketFilterHighPrice")}</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        {loading ? (
          <div className="text-center py-24 flex flex-col items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
            <p className="text-xs font-semibold text-slate-400">{t("marketLoading")}</p>
          </div>
        ) : contracts.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <PackageOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-semibold">{t("marketEmpty")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed min-w-[1050px]">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] uppercase text-slate-500 dark:text-slate-400 font-bold tracking-wider">
                  <th className="px-5 py-4 w-[30%]">{t("marketOrderContent")}</th>
                  <th className="px-5 py-4 w-[20%]">{t("marketPartyA")}</th>
                  <th className="px-5 py-4 w-[20%]">{t("marketPartyB")}</th>
                  <th className="px-5 py-4 w-[12%]">{t("marketDeposit")}</th>
                  <th className="px-5 py-4 w-[18%] text-right pr-6 sm:pr-8">{t("marketAction")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {contracts.map((contract) => (
                  <ContractRow
                    key={contract._id}
                    contract={contract}
                    walletAddress={walletAddress}
                    navigate={navigate}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

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
    </div>
  );
};

export default MarketplacePage;
