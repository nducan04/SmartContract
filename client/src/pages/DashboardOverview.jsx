import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import { useLanguage } from "../context/LanguageContext";
import axios from "axios";

import StatsCard from "../components/StatsCard";
import ContractStepper from "../components/ContractStepper";
import AddressDisplay from "../components/AddressDisplay";
import ContractStatusChart from "../components/ContractStatusChart";
import StatusPill from "../components/ui/StatusPill";
import {
  Plus,
  ArrowRight,
  Wallet,
  FilePlus,
  Package,
  Truck,
  Bell,
  CheckCircle2,
  BarChart3,
  Sparkles,
  Coins
} from "lucide-react";

// Hàm giải mã JSON (Phòng hờ cho các hợp đồng cũ đã tạo bằng form JSON)
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

const DashboardOverview = () => {
  const { walletAddress } = useWeb3();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    client: 0,
    provider: 0,
    receiver: 0,
    waitingConfirm: 0,
    completed: 0,
    totalContracts: 0,
  });
  const [recentList, setRecentList] = useState([]);
  const [allContracts, setAllContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!walletAddress) {
        setLoading(false);
        setRecentList([]);
        setStats({
          client: 0,
          provider: 0,
          receiver: 0,
          waitingConfirm: 0,
          completed: 0,
          totalContracts: 0,
        });
        return;
      }

      try {
        setLoading(true);
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

        const response = await axios.get(
          `${API_URL}/api/contracts/stats?wallet=${walletAddress}`,
        );
        const data = response.data;

        setStats({
          client: data.client || 0,
          provider: data.provider || 0,
          receiver: data.receiver || 0,
          waitingConfirm: data.waitingConfirm || 0,
          completed: data.completed || 0,
          totalContracts: data.totalContracts || 0,
        });

        setRecentList(data.recentList || []);
        setAllContracts(data.recentList || []);
      } catch (error) {
        console.error("Lỗi tải thống kê:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [walletAddress]);

  const getStatusText = (status) => {
    const statusKeys = [
      "statusCreated",
      "statusAccepted",
      "statusShipping",
      "statusCompleted",
      "statusPaid",
      "statusCancelled",
    ];
    return t(statusKeys[status]) || "N/A";
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Web3 Escrow Dashboard
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t("dashOverviewTitle")}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {t("dashOverviewSub")}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            to="/dashboard/create"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 transition-all transform hover:-translate-y-0.5 active:scale-95 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{t("dashCreateBtn")}</span>
          </Link>
        </div>
      </div>

      {/* KHI CHƯA KẾT NỐI VÍ */}
      {!walletAddress ? (
        <div className="text-center py-20 px-6 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800/80 animate-fade-in-up">
          <div className="w-20 h-20 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400 rounded-3xl flex items-center justify-center mx-auto mb-5 border border-blue-200/50 dark:border-blue-900/40 shadow-inner">
            <Wallet className="w-9 h-9" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            {t("dashNotConnected")}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto text-sm leading-relaxed">
            {t("dashNotConnectedSub")}
          </p>
        </div>
      ) : loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent"></div>
          <p className="text-xs font-semibold text-slate-400">Đang đồng bộ dữ liệu blockchain...</p>
        </div>
      ) : (
        <>
          {/* PHẦN 1: BENTO STATS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4 items-stretch">
            <div
              onClick={() => navigate("/dashboard/contracts?role=client")}
              className="h-full flex flex-col cursor-pointer transition-transform active:scale-95"
            >
              <StatsCard
                title={t("statCreated")}
                value={stats.client}
                icon={FilePlus}
                color="blue"
              />
            </div>

            <div
              onClick={() => navigate("/dashboard/contracts?role=receiver")}
              className="h-full flex flex-col cursor-pointer transition-transform active:scale-95"
            >
              <StatsCard
                title={t("statReceived")}
                value={stats.receiver}
                icon={Package}
                color="purple"
              />
            </div>

            <div
              onClick={() => navigate("/dashboard/contracts?role=provider")}
              className="h-full flex flex-col cursor-pointer transition-transform active:scale-95"
            >
              <StatsCard
                title={t("statShipping")}
                value={stats.provider}
                icon={Truck}
                color="green"
              />
            </div>

            <div
              onClick={() =>
                navigate("/dashboard/contracts?role=receiver&status=3")
              }
              className="h-full flex flex-col cursor-pointer transition-transform active:scale-95"
            >
              <StatsCard
                title={t("statWaiting")}
                value={stats.waitingConfirm}
                icon={Bell}
                color="orange"
              />
            </div>

            <div
              onClick={() => navigate("/dashboard/contracts?status=4")}
              className="h-full flex flex-col cursor-pointer transition-transform active:scale-95"
            >
              <StatsCard
                title={t("statCompleted")}
                value={stats.completed}
                icon={CheckCircle2}
                color="indigo"
              />
            </div>

            <div
              onClick={() => navigate("/dashboard/contracts")}
              className="h-full flex flex-col cursor-pointer transition-transform active:scale-95"
            >
              <StatsCard
                title={t("statTotal")}
                value={stats.totalContracts}
                icon={BarChart3}
                color="slate"
              />
            </div>
          </div>

          {/* PHẦN 2: CHART & TIẾN ĐỘ HỢP ĐỒNG GẦN ĐÂY */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
            {/* Cột trái: TIẾN ĐỘ GẦN ĐÂY */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  {t("dashRecentTitle")}
                </h3>
                <Link
                  to="/dashboard/contracts"
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>Xem tất cả</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {recentList.length > 0 ? (
                <div className="space-y-4">
                  {recentList.map((contract) => {
                    const parsedTerms = parseTerms(contract.terms);
                    const displayTitle = parsedTerms
                      ? parsedTerms.art1_items
                      : contract.terms && contract.terms.length > 20
                        ? contract.terms
                        : `${t("labelContract")} #${contract.contractAddress.slice(-4)}`;

                    // Xác định vai trò
                    const isClient =
                      walletAddress?.toLowerCase() ===
                      contract.client?.toLowerCase();
                    const isReceiver =
                      walletAddress?.toLowerCase() ===
                      contract.receiver?.toLowerCase();
                    const isProvider =
                      walletAddress?.toLowerCase() ===
                      contract.provider?.toLowerCase();

                    let roleBadge = {
                      text: t("roleMember"),
                      className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
                    };
                    let partnerLabel = t("labelPartner");
                    let partnerAddr = "";

                    if (isClient) {
                      roleBadge = {
                        text: t("roleClient"),
                        className: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/50 dark:border-blue-900/50",
                      };
                      partnerAddr = contract.receiver;
                      partnerLabel = t("labelReceiverB");
                    } else if (isReceiver) {
                      roleBadge = {
                        text: t("roleReceiver"),
                        className: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200/50 dark:border-purple-900/50",
                      };
                      partnerAddr = contract.client;
                      partnerLabel = t("labelClientA");
                    } else if (isProvider) {
                      roleBadge = {
                        text: t("roleProvider"),
                        className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-900/50",
                      };
                      partnerAddr = contract.client;
                      partnerLabel = t("labelOwnerA");
                    }

                    return (
                      <div
                        key={contract._id}
                        className="bg-white dark:bg-slate-900/90 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md hover:border-blue-400/40 dark:hover:border-blue-500/30 transition-all duration-200 group"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span
                                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${roleBadge.className}`}
                              >
                                {roleBadge.text}
                              </span>
                              {contract.createdAt && (
                                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                                  {new Date(
                                    contract.createdAt,
                                  ).toLocaleDateString("vi-VN")}
                                </span>
                              )}
                            </div>

                            <h4
                              className="font-bold text-slate-900 dark:text-slate-100 text-base sm:text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1"
                              title={displayTitle}
                            >
                              {displayTitle}
                            </h4>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-xs text-slate-500 dark:text-slate-400">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-slate-400">Hợp đồng:</span>
                                <AddressDisplay address={contract.contractAddress} />
                              </div>
                              {partnerAddr && (
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-slate-400">{partnerLabel}:</span>
                                  <AddressDisplay address={partnerAddr} />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 px-4 py-2.5 rounded-xl border border-blue-100 dark:border-blue-900/40 text-right shrink-0 w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end">
                            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">
                              Giá trị ký quỹ
                            </span>
                            <span className="text-slate-900 dark:text-white font-extrabold text-base sm:text-lg">
                              {contract.amount} <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">ETH</span>
                            </span>
                          </div>
                        </div>

                        {/* Stepper */}
                        <div className="bg-slate-50/70 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 my-4">
                          <ContractStepper currentStatus={contract.status} />
                        </div>

                        {/* Bottom Action & Status */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60">
                          <div className="flex items-center gap-2">
                            <StatusPill status={contract.status} />
                          </div>

                          <button
                            onClick={() =>
                              navigate(
                                `/dashboard/contract/${contract.contractAddress}`,
                              )
                            }
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                          >
                            <span>{t("btnDetails")}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl text-center border border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-slate-400 dark:text-slate-500 text-sm">
                    {t("dashNoRecent")}
                  </p>
                </div>
              )}
            </div>

            {/* Cột phải: BIỂU ĐỒ TRÒN THỐNG KÊ */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <ContractStatusChart contracts={allContracts} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardOverview;
