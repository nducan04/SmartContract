import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import axios from "axios";

const ContractListPage = () => {
  const { walletAddress } = useWeb3(); // Lấy địa chỉ ví hiện tại
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();
  const roleFilter = new URLSearchParams(location.search).get("role"); // Lấy role từ URL (client/provider/receiver)

  // Mapping trạng thái từ Số (DB) sang Chữ (Hiển thị)
  const statusMap = {
    0: { text: "Mới tạo", class: "bg-blue-100 text-blue-800" },
    1: { text: "Đã chấp nhận", class: "bg-purple-100 text-purple-800" },
    2: { text: "Đang thực hiện", class: "bg-yellow-100 text-yellow-800" },
    3: { text: "Đã hoàn thành", class: "bg-green-100 text-green-800" },
    4: { text: "Đã thanh toán", class: "bg-gray-100 text-gray-800" },
    5: { text: "Đã hủy", class: "bg-red-100 text-red-800" },
  };

  // Xác định vai trò của mình trong hợp đồng
  const getMyRoleLabel = (contract) => {
    if (!walletAddress) return "Khách";
    const currentWallet = walletAddress.toLowerCase();

    if (contract.client === currentWallet) return "Người Tạo (Client)";
    if (contract.provider === currentWallet) return "Nhà Vận Chuyển (Provider)";
    if (contract.receiver === currentWallet) return "Người Nhận (Receiver)";
    return "Liên quan";
  };

  // Xác định role code để lọc (client/provider/receiver)
  const getMyRoleCode = (contract) => {
    if (!walletAddress) return "";
    const currentWallet = walletAddress.toLowerCase();

    if (contract.client === currentWallet) return "client";
    if (contract.provider === currentWallet) return "provider";
    if (contract.receiver === currentWallet) return "receiver";
    return "";
  };

  useEffect(() => {
    const fetchContracts = async () => {
      // Nếu chưa kết nối ví, không gọi API
      if (!walletAddress) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // 2. GỌI API TỪ BACKEND
        // Lưu ý: Đảm bảo Server đang chạy ở port 5000
        const response = await axios.get(
          `http://localhost:5000/api/contracts?wallet=${walletAddress}`
        );
        const allData = response.data;

        // 3. LỌC DỮ LIỆU (Frontend Filter)
        let filteredData = allData;

        // Nếu trên URL có ?role=..., ta lọc bớt danh sách
        if (roleFilter) {
          filteredData = allData.filter(
            (contract) => getMyRoleCode(contract) === roleFilter
          );
        }

        setContracts(filteredData);
      } catch (err) {
        console.error("Lỗi gọi API:", err);
        setError(
          "Không thể tải danh sách hợp đồng. Hãy đảm bảo Server đang chạy."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, [walletAddress, roleFilter]);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Quản Lý Hợp Đồng
        {roleFilter && (
          <span className="text-lg font-normal text-gray-500 ml-2">
            (Đang lọc: {roleFilter})
          </span>
        )}
      </h1>

      {!walletAddress ? (
        <div className="text-center py-10 bg-red-50 rounded-lg">
          <p className="text-red-600">
            Vui lòng kết nối ví để xem danh sách hợp đồng.
          </p>
        </div>
      ) : loading ? (
        <div className="text-center py-10">
          <p className="text-gray-500">Đang tải dữ liệu từ Server...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10 bg-red-50 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      ) : contracts.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">Không tìm thấy hợp đồng nào.</p>
          <Link
            to="/dashboard/create"
            className="text-blue-600 font-semibold hover:underline"
          >
            + Tạo hợp đồng mới
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Mô tả
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Vai trò của bạn
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Giá trị
                </th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contracts.map((contract) => {
                const statusInfo = statusMap[contract.status] || {
                  text: "Không rõ",
                  class: "bg-gray-100",
                };

                return (
                  <tr
                    key={contract._id}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                        {contract.terms}
                      </p>
                      <p className="text-xs text-gray-500 font-mono mt-1">
                        ID: {contract.contractAddress.substring(0, 6)}...
                        {contract.contractAddress.substring(38)}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700 font-medium">
                        {getMyRoleLabel(contract)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.class}`}
                      >
                        {statusInfo.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-bold text-gray-900">
                        {contract.amount} ETH
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {/* Link trỏ đến trang chi tiết (dùng contractAddress) */}
                      <Link
                        to={`/dashboard/contract/${contract.contractAddress}`}
                        className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-md hover:bg-indigo-100 transition-all"
                      >
                        Chi tiết
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ContractListPage;
