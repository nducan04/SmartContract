import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import axios from "axios";

const DashboardOverview = () => {
  const { walletAddress } = useWeb3();

  // State lưu thống kê
  const [stats, setStats] = useState({
    client: 0,
    provider: 0,
    receiver: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      // Nếu chưa kết nối ví thì không làm gì cả
      if (!walletAddress) return;

      try {
        setLoading(true);

        // 1. Gọi API lấy toàn bộ hợp đồng có liên quan đến ví này
        // Lưu ý: Đảm bảo Server (Backend) đang chạy ở port 5000
        const response = await axios.get(
          `http://localhost:5000/api/contracts?wallet=${walletAddress}`
        );
        const contracts = response.data;

        // 2. Tính toán số lượng CHÍNH XÁC theo trạng thái và vai trò
        const currentWallet = walletAddress.toLowerCase();

        // --- LOGIC ĐẾM ---

        // A. Client (Người tạo): Đếm tất cả hợp đồng mình đã tạo (bất kể trạng thái)
        const clientCount = contracts.filter(
          (c) => c.client === currentWallet
        ).length;

        // B. Provider (Nhà vận chuyển): Chỉ đếm những hợp đồng ĐÃ CHẤP NHẬN trở đi
        // (Status >= 1: Đã chấp nhận, Đang làm, Xong, Đã trả...)
        // Bỏ qua Status 0 (Mới tạo) vì lúc đó chưa ai nhận
        const providerCount = contracts.filter(
          (c) => c.provider === currentWallet && c.status >= 1
        ).length;

        // C. Receiver (Người nhận): Chỉ đếm những hợp đồng ĐANG CHỜ XÁC NHẬN
        // (Status == 3: Đã hoàn thành công việc -> Chờ trả tiền)
        // Nếu đã trả tiền (Status 4) thì không đếm vào đây nữa (để nhắc nhở người dùng việc cần làm)
        const receiverCount = contracts.filter(
          (c) => c.receiver === currentWallet && c.status === 3
        ).length;

        // 3. Cập nhật State
        setStats({
          client: clientCount,
          provider: providerCount,
          receiver: receiverCount,
        });
      } catch (error) {
        console.error("Lỗi tải thống kê:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [walletAddress]); // Chạy lại khi địa chỉ ví thay đổi

  // Dữ liệu hiển thị cho các thẻ
  const statsData = {
    client: {
      count: stats.client,
      label: "Hợp đồng bạn đã tạo",
      link: "/dashboard/contracts?role=client",
      color: "bg-blue-100 text-blue-600",
      icon: "uil-file-plus-alt",
    },
    provider: {
      count: stats.provider,
      label: "Hợp đồng bạn đã chấp nhận",
      link: "/dashboard/contracts?role=provider",
      color: "bg-green-100 text-green-600",
      icon: "uil-truck",
    },
    receiver: {
      count: stats.receiver,
      label: "Hợp đồng chờ bạn xác nhận",
      link: "/dashboard/contracts?role=receiver",
      color: "bg-yellow-100 text-yellow-600",
      icon: "uil-check-circle",
    },
  };

  return (
    <div className="p-4">
      {/* === Tiêu đề Chào mừng === */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Chào mừng trở lại!</h1>
        <p className="text-gray-600 mt-1">
          Đây là tổng quan về các hoạt động hợp đồng của bạn.
        </p>
      </div>

      {/* === Lưới Thẻ Thống kê === */}
      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Đang tải số liệu...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Thẻ Client */}
          <Link
            to={statsData.client.link}
            className="block p-6 bg-white rounded-lg shadow-lg border border-gray-100 hover:shadow-xl transition-all"
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${statsData.client.color}`}>
                <i className={`uil ${statsData.client.icon} text-2xl`}></i>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {statsData.client.count}
                </p>
                <p className="text-sm font-medium text-gray-500">
                  {statsData.client.label}
                </p>
              </div>
            </div>
          </Link>

          {/* Thẻ Provider */}
          <Link
            to={statsData.provider.link}
            className="block p-6 bg-white rounded-lg shadow-lg border border-gray-100 hover:shadow-xl transition-all"
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${statsData.provider.color}`}>
                <i className={`uil ${statsData.provider.icon} text-2xl`}></i>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {statsData.provider.count}
                </p>
                <p className="text-sm font-medium text-gray-500">
                  {statsData.provider.label}
                </p>
              </div>
            </div>
          </Link>

          {/* Thẻ Receiver */}
          <Link
            to={statsData.receiver.link}
            className="block p-6 bg-white rounded-lg shadow-lg border border-gray-100 hover:shadow-xl transition-all"
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${statsData.receiver.color}`}>
                <i className={`uil ${statsData.receiver.icon} text-2xl`}></i>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {statsData.receiver.count}
                </p>
                <p className="text-sm font-medium text-gray-500">
                  {statsData.receiver.label}
                </p>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* === Nút "Tạo Hợp đồng" (Call to Action) === */}
      <div className="mt-12 p-6 bg-gray-50 rounded-lg text-center border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          Bạn có hợp đồng mới?
        </h2>
        <p className="text-gray-600 mt-2 mb-4">
          Bắt đầu một thỏa thuận mới an toàn và minh bạch ngay hôm nay.
        </p>
        <Link
          to="/dashboard/create"
          className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all"
        >
          Tạo Hợp đồng mới
        </Link>
      </div>
    </div>
  );
};

export default DashboardOverview;
