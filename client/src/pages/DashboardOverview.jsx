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
        setStats({ client: 0, provider: 0, receiver: 0, totalContracts: 0 });
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
            Tổng quan Hệ thống
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Theo dõi hiệu suất chuỗi cung ứng của bạn
          </p>
        </div>
        <Link
          to="/dashboard/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-200 transition-all flex items-center gap-2 transform hover:-translate-y-1"
        >
          <i className="uil uil-plus"></i> Tạo Hợp đồng
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-fr">
            <div
              onClick={() => navigate("/dashboard/contracts?role=client")}
              className="cursor-pointer h-full animate-slide-up" style={{ animationDelay: "0.1s" }}
            >
              <StatsCard title="Đơn hàng đã tạo" value={stats.client} icon="uil-file-plus-alt" color="blue" />
            </div>
            <div
              onClick={() => navigate("/dashboard/contracts?role=provider")}
              className="cursor-pointer h-full animate-slide-up" style={{ animationDelay: "0.2s" }}
            >
              <StatsCard title="Đơn hàng nhận vận chuyển" value={stats.provider} icon="uil-truck" color="green" />
            </div>
            <div
              onClick={() => navigate("/dashboard/contracts?role=receiver")}
              className="cursor-pointer h-full animate-slide-up" style={{ animationDelay: "0.3s" }}
            >
              <StatsCard title="Chờ xác nhận" value={stats.receiver} icon="uil-bell" color="orange" />
            </div>
            <div className="cursor-default h-full animate-slide-up" style={{ animationDelay: "0.4s" }}>
              <StatsCard title="Tổng hoạt động" value={stats.totalContracts} icon="uil-analytics" color="purple" />
            </div>
          </div>

          {/* PHẦN 2: CHART & TIẾN ĐỘ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up" style={{ animationDelay: "0.5s" }}>
            {/* Cột trái: TIẾN ĐỘ GẦN ĐÂY */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <i className="uil uil-clock-three text-blue-500"></i> Hoạt động gần đây
              </h3>

              {recentList.length > 0 ? (
                recentList.map((contract) => {
                  // XỬ LÝ TEXT: Hiển thị an toàn dù là text thường hay JSON
                  const parsedTerms = parseTerms(contract.terms);
                  const displayTitle = parsedTerms ? parsedTerms.art1_items : (contract.terms || "Không có nội dung");

                  return (
                    <div
                      key={contract._id}
                      className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          {/* Đã thêm line-clamp-1 để chữ dài không làm vỡ giao diện */}
                          <h4 className="font-bold text-gray-800 text-lg line-clamp-1" title={displayTitle}>
                            {displayTitle}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-400">ID:</span>
                            <AddressDisplay address={contract.contractAddress} />
                          </div>
                        </div>
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                          {contract.amount} ETH
                        </span>
                      </div>

                      <ContractStepper currentStatus={contract.status} />

                      <div className="mt-4 text-right">
                        <button
                          onClick={() => navigate(`/dashboard/contract/${contract.contractAddress}`)}
                          className="text-sm text-blue-600 font-semibold hover:text-blue-800 hover:underline cursor-pointer"
                        >
                          Xem chi tiết &rarr;
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