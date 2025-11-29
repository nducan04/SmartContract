import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const MarketplacePage = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvailableContracts = async () => {
      try {
        setLoading(true);
        // Gọi API lấy hợp đồng chưa có người nhận (status = 0)
        const response = await axios.get(
          "http://localhost:5000/api/contracts/available"
        );
        setContracts(response.data);
      } catch (error) {
        console.error("Lỗi tải sàn hợp đồng:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableContracts();
  }, []);

  return (
    <div className="p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Sàn Hợp Đồng (Tìm Việc)
        </h1>
        <p className="text-gray-600 mt-2">
          Danh sách các đơn hàng đang chờ Nhà vận chuyển.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Đang tải danh sách...</p>
        </div>
      ) : contracts.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500">
            Hiện tại không có hợp đồng nào cần vận chuyển.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {contracts.map((contract) => (
            <div
              key={contract._id}
              className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full uppercase">
                    Mới tạo
                  </span>
                  <span className="text-gray-400 text-xs font-mono">
                    ID: {contract.contractAddress.substring(0, 8)}...
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  {contract.terms}
                </h3>
                <div className="text-sm text-gray-500 mt-1 flex flex-col sm:flex-row gap-2 sm:gap-6">
                  <span>
                    <i className="uil uil-user mr-1"></i> Khách hàng:{" "}
                    {contract.client.substring(0, 6)}...
                  </span>
                  <span>
                    <i className="uil uil-map-marker mr-1"></i> Người nhận:{" "}
                    {contract.receiver.substring(0, 6)}...
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3 min-w-[150px]">
                <span className="text-2xl font-bold text-blue-600">
                  {contract.amount} ETH
                </span>
                <Link
                  to={`/dashboard/contract/${contract.contractAddress}`}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors w-full text-center"
                >
                  Xem & Nhận việc
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;
