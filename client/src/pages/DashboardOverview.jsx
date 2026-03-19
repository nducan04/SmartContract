import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import axios from "axios";

import StatsCard from "../components/StatsCard";
import ContractStepper from "../components/ContractStepper";
import AddressDisplay from "../components/AddressDisplay";
import ContractStatusChart from "../components/ContractStatusChart";

// Hàm giải mã JSON (Phòng hờ cho các hợp đồng cũ đã tạo bằng form JSON)
const parseTerms = (termsString) => {
  if (!termsString) return null;
  try {
    const parsed = JSON.parse(termsString);
    if (parsed && typeof parsed === "object" && "partyA_name" in parsed) return parsed;
    return null;
  } catch (error) {
    return null;
  }
};

const DashboardOverview = () => {
  const { walletAddress } = useWeb3();
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
        setStats({ client: 0, provider: 0, receiver: 0, waitingConfirm: 0, completed: 0, totalContracts: 0 });
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

  return (
    <div className="p-2 space-y-8 animate-fade-in">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Tổng quan hệ thống
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Theo dõi hiệu suất chuỗi cung ứng của bạn
          </p>
        </div>
        <Link
          to="/dashboard/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-200 transition-all flex items-center gap-2 transform hover:-translate-y-1"
        >
          <i className="uil uil-plus"></i> Tạo hợp đồng
        </Link>
      </div>

      {/* XỬ LÝ GIAO DIỆN KHI CHƯA KẾT NỐI VÍ */}
      {!walletAddress ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200 animate-slide-up">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="uil uil-wallet text-3xl"></i>
          </div>
          <h3 className="text-lg font-bold text-gray-700">Chưa kết nối ví</h3>
          <p className="text-gray-500 mt-2 px-4">
            Vui lòng kết nối ví MetaMask để xem tổng quan hệ thống của bạn.
          </p>
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
              className="cursor-pointer h-full animate-slide-up" style={{ animationDelay: "0.1s" }}
            >
              <StatsCard title="Đơn hàng đã tạo" value={stats.client} icon="uil-file-plus-alt" color="blue" />
            </div>
            <div
              onClick={() => navigate("/dashboard/contracts?role=receiver")}
              className="cursor-pointer h-full animate-slide-up" style={{ animationDelay: "0.2s" }}
            >
              <StatsCard title="Đơn hàng đã nhận" value={stats.receiver} icon="uil-package" color="purple" />
            </div>
            <div
              onClick={() => navigate("/dashboard/contracts?role=provider")}
              className="cursor-pointer h-full animate-slide-up" style={{ animationDelay: "0.3s" }}
            >
              <StatsCard title="Đơn hàng vận chuyển" value={stats.provider} icon="uil-truck" color="green" />
            </div>
            <div
              onClick={() => navigate("/dashboard/contracts?role=receiver&status=3")}
              className="cursor-pointer h-full animate-slide-up" style={{ animationDelay: "0.4s" }}
            >
              <StatsCard title="Chờ xác nhận" value={stats.waitingConfirm} icon="uil-bell" color="orange" />
            </div>
            <div
              onClick={() => navigate("/dashboard/contracts?status=4")}
              className="cursor-pointer h-full animate-slide-up" style={{ animationDelay: "0.5s" }}
            >
              <StatsCard title="Đã hoàn thành" value={stats.completed} icon="uil-check-circle" color="indigo" />
            </div>
            <div
              onClick={() => navigate("/dashboard/contracts")}
              className="cursor-pointer h-full animate-slide-up" style={{ animationDelay: "0.6s" }}
            >
              <StatsCard title="Tổng hoạt động" value={stats.totalContracts} icon="uil-analytics" color="slate" />
            </div>
          </div>

          {/* PHẦN 2: CHART & TIẾN ĐỘ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up" style={{ animationDelay: "0.5s" }}>
            {/* Cột trái: TIẾN ĐỘ GẦN ĐÂY */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                Hoạt động gần đây
              </h3>

              {recentList.length > 0 ? (
                recentList.map((contract) => {
                  const parsedTerms = parseTerms(contract.terms);
                  const displayTitle = parsedTerms ? parsedTerms.art1_items : (contract.terms && contract.terms.length > 20 ? contract.terms : `Hợp đồng #${contract.contractAddress.slice(-4)}`);

                  // Xác định vai trò
                  const isClient = walletAddress?.toLowerCase() === contract.client?.toLowerCase();
                  const isReceiver = walletAddress?.toLowerCase() === contract.receiver?.toLowerCase();
                  const isProvider = walletAddress?.toLowerCase() === contract.provider?.toLowerCase();

                  let roleBadge = { text: "Thành viên", color: "bg-gray-100 text-gray-600" };
                  let partnerLabel = "Đối tác";
                  let partnerAddr = "";

                  if (isClient) {
                    roleBadge = { text: "Chủ hợp đồng (Bên A)", color: "bg-blue-100 text-blue-700" };
                    partnerAddr = contract.receiver;
                    partnerLabel = "Bên nhận (Bên B)";
                  } else if (isReceiver) {
                    roleBadge = { text: "Người nhận (Bên B)", color: "bg-purple-100 text-purple-700" };
                    partnerAddr = contract.client;
                    partnerLabel = "Bên giao (Bên A)";
                  } else if (isProvider) {
                    roleBadge = { text: "Vận chuyển", color: "bg-green-100 text-green-700" };
                    partnerAddr = contract.client;
                    partnerLabel = "Chủ hàng (Bên A)";
                  }

                  return (
                    <div
                      key={contract._id}
                      className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-lg group"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-5">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                             <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-md ${roleBadge.color}`}>
                              {roleBadge.text}
                            </span>
                            {contract.createdAt && (
                              <span className="text-[10px] text-gray-400 font-medium">
                                • {new Date(contract.createdAt).toLocaleDateString('vi-VN')}
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-gray-800 text-xl line-clamp-1 group-hover:text-blue-600 transition-colors" title={displayTitle}>
                            {displayTitle}
                          </h4>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-gray-400">Hợp đồng:</span>
                              <AddressDisplay address={contract.contractAddress} />
                            </div>
                            {partnerAddr && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-gray-400">{partnerLabel}:</span>
                                <AddressDisplay address={partnerAddr} />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 text-center min-w-[100px]">
                          <span className="block text-[10px] font-bold text-blue-400 uppercase tracking-wider">Giá trị</span>
                          <span className="text-blue-700 font-black text-lg">
                            {contract.amount} ETH
                          </span>
                        </div>
                      </div>

                      <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 mb-4">
                        <ContractStepper currentStatus={contract.status} />
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                           <span className={`w-2 h-2 rounded-full ${contract.status >= 4 ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`}></span>
                           <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">
                             Trạng thái: {["Mới tạo", "Đã chấp nhận", "Đang vận chuyển", "Đã hoàn thành", "Đã thanh toán", "Đã hủy"][contract.status] || "N/A"}
                           </span>
                        </div>
                        <button
                          onClick={() => navigate(`/dashboard/contract/${contract.contractAddress}`)}
                          className="flex items-center gap-1 text-sm text-blue-600 font-bold hover:text-blue-800 transition-colors cursor-pointer"
                        >
                          Chi tiết <i className="uil uil-arrow-right"></i>
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-white p-8 rounded-2xl text-center border border-dashed border-gray-300">
                  <p className="text-gray-400">Chưa có hoạt động nào gần đây.</p>
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