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
      // Nếu chưa có ví, tắt loading ngay và thoát hàm
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

        // GỌI API THỐNG KÊ SIÊU TỐC CỦA BẠN
        const response = await axios.get(
          `${API_URL}/api/contracts/stats?wallet=${walletAddress}`,
        );
        const data = response.data;

        setStats({
          client: data.client,
          provider: data.provider,
          receiver: data.receiver,
          waitingConfirm: data.waitingConfirm,
          completed: data.completed,
          totalContracts: data.totalContracts,
        });

        setRecentList(data.recentList || []);

        // Lưu ý: Biểu đồ ContractStatusChart cần toàn bộ hợp đồng để vẽ
        // Tạm thời truyền danh sách gần đây, hoặc bạn có thể nâng cấp API stats trả về nhóm dữ liệu cho biểu đồ sau
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
    <div className="p-2 space-y-8 animate-fade-in">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {t("dashOverviewTitle")}
          </h1>
          <p className="text-gray-500 text-sm mt-1 dark:text-gray-300">{t("dashOverviewSub")}</p>
        </div>
        <Link
          to="/dashboard/create"
          className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-5 py-2.5 rounded-xl font-semibold 
          shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-1 w-full md:w-auto"
        >
          <i className="uil uil-plus"></i> {t("dashCreateBtn")}
        </Link>
      </div>

      {/* XỬ LÝ GIAO DIỆN KHI CHƯA KẾT NỐI VÍ */}
      {!walletAddress ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 animate-slide-up transition-colors">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="uil uil-wallet text-3xl"></i>
          </div>
          <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200">
            {t("dashNotConnected")}
          </h3>
          <p className="text-gray-500 dark:text-gray-300 mt-2 px-4">{t("dashNotConnectedSub")}</p>
        </div>
      ) : loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* PHẦN 1: THẺ THỐNG KÊ (Có hiệu ứng hover) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            <div
              onClick={() => navigate("/dashboard/contracts?role=client")}
              className="cursor-pointer h-full animate-slide-up"
              style={{ animationDelay: "0.1s" }}
            >
              <StatsCard
                title={t("statCreated")}
                value={stats.client}
                icon="uil-file-plus-alt"
                color="blue"
              />
            </div>
            <div
              onClick={() => navigate("/dashboard/contracts?role=receiver")}
              className="cursor-pointer h-full animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              <StatsCard
                title={t("statReceived")}
                value={stats.receiver}
                icon="uil-package"
                color="purple"
              />
            </div>
            <div
              onClick={() => navigate("/dashboard/contracts?role=provider")}
              className="cursor-pointer h-full animate-slide-up"
              style={{ animationDelay: "0.3s" }}
            >
              <StatsCard
                title={t("statShipping")}
                value={stats.provider}
                icon="uil-truck"
                color="green"
              />
            </div>
            <div
              onClick={() =>
                navigate("/dashboard/contracts?role=receiver&status=3")
              }
              className="cursor-pointer h-full animate-slide-up"
              style={{ animationDelay: "0.4s" }}
            >
              <StatsCard
                title={t("statWaiting")}
                value={stats.waitingConfirm}
                icon="uil-bell"
                color="orange"
              />
            </div>
            <div
              onClick={() => navigate("/dashboard/contracts?status=4")}
              className="cursor-pointer h-full animate-slide-up"
              style={{ animationDelay: "0.5s" }}
            >
              <StatsCard
                title={t("statCompleted")}
                value={stats.completed}
                icon="uil-check-circle"
                color="indigo"
              />
            </div>
            <div
              onClick={() => navigate("/dashboard/contracts")}
              className="cursor-pointer h-full animate-slide-up"
              style={{ animationDelay: "0.6s" }}
            >
              <StatsCard
                title={t("statTotal")}
                value={stats.totalContracts}
                icon="uil-analytics"
                color="slate"
              />
            </div>
          </div>

          {/* PHẦN 2: CHART & TIẾN ĐỘ */}
          <div
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up"
            style={{ animationDelay: "0.5s" }}
          >
            {/* Cột trái: TIẾN ĐỘ GẦN ĐÂY */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                {t("dashRecentTitle")}
              </h3>

              {recentList.length > 0 ? (
                recentList.map((contract) => {
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
                    color: "bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300",
                  };
                  let partnerLabel = t("labelPartner");
                  let partnerAddr = "";

                  if (isClient) {
                    roleBadge = {
                      text: t("roleClient"),
                      color: "bg-blue-100 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300",
                    };
                    partnerAddr = contract.receiver;
                    partnerLabel = t("labelReceiverB");
                  } else if (isReceiver) {
                    roleBadge = {
                      text: t("roleReceiver"),
                      color: "bg-purple-100 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300",
                    };
                    partnerAddr = contract.client;
                    partnerLabel = t("labelClientA");
                  } else if (isProvider) {
                    roleBadge = {
                      text: t("roleProvider"),
                      color: "bg-green-100 dark:bg-green-950/20 text-green-700 dark:text-green-300",
                    };
                    partnerAddr = contract.client;
                    partnerLabel = t("labelOwnerA");
                  }

                  return (
                    <div
                      key={contract._id}
                      className="bg-white dark:bg-gray-800 dark:border-gray-700 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-lg group"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-5">
                        <div className="flex-1 min-w-0 w-full">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-md ${roleBadge.color}`}
                            >
                              {roleBadge.text}
                            </span>
                            {contract.createdAt && (
                              <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                                •{" "}
                                {new Date(
                                  contract.createdAt,
                                ).toLocaleDateString("vi-VN")}
                              </span>
                            )}
                          </div>
                          <h4
                            className="font-bold text-gray-800 text-lg md:text-xl line-clamp-2 md:line-clamp-1 group-hover:text-blue-600 transition-colors"
                            title={displayTitle}
                          >
                            {displayTitle}
                          </h4>
                          <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-x-4 gap-y-2 mt-2">
                            <div className="flex items-center gap-1.5 w-full sm:w-auto">
                              <span className="text-xs font-bold text-gray-400 dark:text-gray-400 shrink-0">
                                {t("labelContract")}
                              </span>
                              <div className="truncate">
                                <AddressDisplay
                                  address={contract.contractAddress}
                                />
                              </div>
                            </div>
                            {partnerAddr && (
                              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                                <span className="text-xs font-bold text-gray-400 dark:text-gray-400 shrink-0">
                                  {partnerLabel}
                                </span>
                                <div className="truncate">
                                  <AddressDisplay address={partnerAddr} />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-950/20 px-4 py-2 mt-2 md:mt-0 rounded-xl border border-blue-100 dark:border-blue-900/20 text-center md:min-w-[100px] shrink-0 w-full md:w-auto flex flex-row md:flex-col items-center md:items-stretch justify-between md:justify-start">
                          <span className="block text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                            {t("labelValue")}
                          </span>
                          <span className="text-blue-700 dark:text-blue-300 font-black text-lg md:text-lg">
                            {contract.amount}{" "}
                            <span className="text-sm">ETH</span>
                          </span>
                        </div>
                      </div>

                      <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 mb-4">
                        <ContractStepper currentStatus={contract.status} />
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <StatusPill status={contract.status >= 4 ? "completed" : contract.status === 0 ? "pending" : "active"} />
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                            {t("labelStatus")} {getStatusText(contract.status)}
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            navigate(
                              `/dashboard/contract/${contract.contractAddress}`,
                            )
                          }
                          className="flex items-center justify-center w-full sm:w-auto gap-1 text-sm text-blue-600 font-bold bg-blue-50 sm:bg-transparent px-4 py-2 sm:p-0 rounded-lg sm:rounded-none hover:text-blue-800 transition-colors cursor-pointer shrink-0"
                        >
                          {t("btnDetails")}{" "}
                          <i className="uil uil-arrow-right"></i>
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl text-center border border-dashed border-gray-300 dark:border-gray-600 transition-colors">
                  <p className="text-gray-400 dark:text-gray-500">{t("dashNoRecent")}</p>
                </div>
              )}
            </div>

            {/* Cột phải: BIỂU ĐỒ TRÒN */}
            <div className="lg:col-span-1 h-[400px] lg:h-full min-h-[400px]">
              <ContractStatusChart contracts={allContracts} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardOverview;
