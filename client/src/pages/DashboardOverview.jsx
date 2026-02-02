import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import axios from "axios";

import StatsCard from "../components/StatsCard";
import ContractStepper from "../components/ContractStepper";
import AddressDisplay from "../components/AddressDisplay";
import ContractStatusChart from "../components/ContractStatusChart";

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
      if (!walletAddress) return;

      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/api/contracts?wallet=${walletAddress}`,
        );
        const contracts = response.data;

        setAllContracts(contracts); // <--- 3. Lưu dữ liệu vào state

        const currentWallet = walletAddress.toLowerCase();
        const clientCount = contracts.filter(
          (c) => c.client === currentWallet,
        ).length;
        const providerCount = contracts.filter(
          (c) => c.provider === currentWallet && c.status >= 1,
        ).length;
        const receiverCount = contracts.filter(
          (c) => c.receiver === currentWallet && c.status === 3,
        ).length;

        setStats({
          client: clientCount,
          provider: providerCount,
          receiver: receiverCount,
          totalContracts: contracts.length,
        });

        const sorted = [...contracts].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
        setRecentList(sorted.slice(0, 2));
      } catch (error) {
        console.error("Lỗi tải thống kê:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [walletAddress]);

  return (
    <div className="p-2 space-y-8">
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

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* PHẦN 1: THẺ THỐNG KÊ */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-fr">
            <div
              onClick={() => navigate("/dashboard/contracts?role=client")}
              className="cursor-pointer h-full"
            >
              <StatsCard
                title="Đơn hàng đã tạo"
                value={stats.client}
                icon="uil-file-plus-alt"
                color="blue"
              />
            </div>
            <div
              onClick={() => navigate("/dashboard/contracts?role=provider")}
              className="cursor-pointer h-full"
            >
              <StatsCard
                title="Đơn hàng nhận vận chuyển"
                value={stats.provider}
                icon="uil-truck"
                color="green"
              />
            </div>
            <div
              onClick={() => navigate("/dashboard/contracts?role=receiver")}
              className="cursor-pointer h-full"
            >
              <StatsCard
                title="Chờ xác nhận"
                value={stats.receiver}
                icon="uil-bell"
                color="orange"
              />
            </div>
            <div className="cursor-default h-full">
              <StatsCard
                title="Tổng hoạt động"
                value={stats.totalContracts}
                icon="uil-analytics"
                color="purple"
              />
            </div>
          </div>

          {/* PHẦN 2: CHART & TIẾN ĐỘ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cột trái: TIẾN ĐỘ GẦN ĐÂY (2/3 chiều rộng) */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <i className="uil uil-clock-three text-blue-500"></i> Hoạt động
                gần đây
              </h3>

              {recentList.length > 0 ? (
                recentList.map((contract) => (
                  <div
                    key={contract._id}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-gray-800 text-lg">
                          {contract.terms}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400">ID:</span>
                          <AddressDisplay address={contract.contractAddress} />
                        </div>
                      </div>
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
                        {contract.amount} ETH
                      </span>
                    </div>

                    <ContractStepper currentStatus={contract.status} />

                    <div className="mt-4 text-right">
                      <button
                        onClick={() =>
                          navigate(
                            `/dashboard/contract/${contract.contractAddress}`,
                          )
                        }
                        className="text-sm text-blue-600 font-semibold hover:text-blue-800 hover:underline"
                      >
                        Xem chi tiết &rarr;
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white p-8 rounded-2xl text-center border border-dashed border-gray-300">
                  <p className="text-gray-400">
                    Chưa có hoạt động nào gần đây.
                  </p>
                </div>
              )}
            </div>

            {/* Cột phải: BIỂU ĐỒ TRÒN (1/3 chiều rộng) - THAY CHO BANNER CŨ */}
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
