import React, { useState, useEffect } from "react";
import { useWeb3 } from "../context/Web3Context";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AddressDisplay from "../components/AddressDisplay";

const AdminPage = () => {
  const { walletAddress } = useWeb3();
  const navigate = useNavigate();
  const [allContracts, setAllContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. DANH SÁCH 3 VÍ ADMIN
  const ADMIN_WALLETS = [
    "0xC64803Cad03E12c34EF3C822cCB4Cb78E9298091",
    "0xFd8fe5838dC6934a400b2663C2FD348E16D1f4EC",
    "0xDB45eB9DB7205eAd8003f3C4D578cd2078Ac4782",
  ].map((addr) => addr.toLowerCase());

  useEffect(() => {
    // 2. Bảo vệ trang: Nếu không nằm trong 3 ví Admin thì đuổi về
    if (
      !walletAddress ||
      !ADMIN_WALLETS.includes(walletAddress.toLowerCase())
    ) {
      alert("⛔ Bạn không có quyền truy cập trang Quản trị!");
      navigate("/");
      return;
    }

    const fetchAllData = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
        // 3. Gửi kèm ví của người đang yêu cầu để server đối chiếu
        const response = await axios.get(
          `${API_URL}/api/contracts/all-admin?requester=${walletAddress}`,
        );
        setAllContracts(response.data);
      } catch (error) {
        console.error("Lỗi Admin:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [walletAddress, navigate]);

  // Chặn render giao diện nếu chưa xác thực xong ví
  if (!walletAddress || !ADMIN_WALLETS.includes(walletAddress.toLowerCase())) {
    return null;
  }

  if (loading)
    return <div className="p-10 text-center">Đang tải dữ liệu quản trị...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Thống kê nhanh */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
          <p className="text-gray-400 text-xs font-bold uppercase">
            Tổng số Hợp đồng
          </p>
          <p className="text-3xl font-bold text-gray-800">
            {allContracts.length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
          <p className="text-gray-400 text-xs font-bold uppercase">
            Tổng giá trị (ETH)
          </p>
          <p className="text-3xl font-bold text-gray-800">
            {allContracts
              .reduce((sum, c) => sum + parseFloat(c.amount || 0), 0)
              .toFixed(4)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
          <p className="text-gray-400 text-xs font-bold uppercase">
            Đang vận hành
          </p>
          <p className="text-3xl font-bold text-gray-800">
            {allContracts.filter((c) => c.status > 0 && c.status < 3).length}
          </p>
        </div>
      </div>

      {/* Bảng dữ liệu toàn cục */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <table className="w-full text-left">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Người tạo (Client)</th>
              <th className="p-4">Vận chuyển (Provider)</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4">Ngày tạo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {allContracts.map((c) => (
              <tr key={c._id} className="hover:bg-gray-50">
                <td className="p-4">
                  <AddressDisplay address={c.contractAddress} />
                </td>
                <td className="p-4 text-sm text-gray-600">{c.client}</td>
                <td className="p-4 text-sm text-gray-600">
                  {c.provider || "Chưa nhận"}
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${c.status === 3 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                  >
                    {c.status === 0
                      ? "Mới"
                      : c.status === 3
                        ? "Hoàn thành"
                        : "Đang xử lý"}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-500">
                  {new Date(c.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPage;
