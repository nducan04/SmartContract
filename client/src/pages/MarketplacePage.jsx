import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useWeb3 } from "../context/Web3Context";
import AddressDisplay from "../components/AddressDisplay";

const MarketplacePage = () => {
  const { walletAddress } = useWeb3();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("newest"); // newest, high-price
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAvailableContracts = async () => {
      try {
        setLoading(true);
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const response = await axios.get(`${API_URL}/api/contracts/available`);
        let data = response.data;

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
  }, [filter]);

  // HÀM GIẢI MÃ JSON (Tương tự bên chi tiết)
  const parseTerms = (termsString) => {
    try {
      const parsed = JSON.parse(termsString);
      if (parsed && typeof parsed === "object" && "partyA_name" in parsed) {
        return parsed;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  return (
    <div className="p-2">
      {/* HEADER + FILTER */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <i className="uil uil-briefcase-alt text-blue-600"></i> Sàn Hợp Đồng
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Danh sách các đơn hàng đang chờ Nhà vận chuyển.
          </p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setFilter("newest")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
              filter === "newest"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Mới nhất
          </button>
          <button
            onClick={() => setFilter("high-price")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
              filter === "high-price"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Giá cao nhất
          </button>
        </div>
      </div>

      {/* TABLE CONTENT */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : contracts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <i className="uil uil-box text-4xl mb-2"></i>
            <p>Hiện tại chưa có đơn hàng nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-bold tracking-wider">
                  <th className="px-6 py-4">Nội dung đơn hàng</th>
                  <th className="px-6 py-4">Bên Giao (Client)</th>
                  <th className="px-6 py-4">Bên Nhận (Receiver)</th>
                  <th className="px-6 py-4">Thù lao / Ký quỹ</th>
                  <th className="px-6 py-4 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {contracts.map((contract) => {
                  const currentWallet = walletAddress
                    ? walletAddress.toLowerCase()
                    : "";
                  const isClient =
                    currentWallet === contract.client.toLowerCase();
                  const isReceiver =
                    currentWallet === contract.receiver.toLowerCase();

                  // SỬ LÝ HIỂN THỊ TÊN THAY VÌ ĐỊA CHỈ VÍ
                  const parsedTerms = parseTerms(contract.terms);
                  const displayTitle = parsedTerms
                    ? parsedTerms.art1_items
                    : contract.terms;
                  const clientName =
                    parsedTerms && parsedTerms.partyA_name
                      ? parsedTerms.partyA_name
                      : null;
                  const receiverName =
                    parsedTerms && parsedTerms.partyB_name
                      ? parsedTerms.partyB_name
                      : null;

                  return (
                    <tr
                      key={contract._id}
                      className="hover:bg-blue-50/50 transition-colors group"
                    >
                      {/* NỘI DUNG */}
                      <td className="px-6 py-4 max-w-xs">
                        <p
                          className="text-sm font-bold text-gray-800 truncate mb-2"
                          title={displayTitle}
                        >
                          {displayTitle}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="shrink-0 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold border border-green-200 uppercase tracking-wide">
                            Mới
                          </span>
                          <span className="text-xs text-gray-400 font-medium ml-1">
                            ID:
                          </span>
                          <div className="-ml-1">
                            <AddressDisplay
                              address={contract.contractAddress}
                            />
                          </div>
                        </div>
                      </td>

                      {/* BÊN GIAO (BÊN A) */}
                      <td className="px-6 py-4">
                        {clientName ? (
                          <div>
                            <p
                              className="text-sm font-bold text-gray-800 truncate max-w-40"
                              title={clientName}
                            >
                              {clientName}
                            </p>
                            <div className="text-xs text-gray-400 mt-1">
                              <AddressDisplay address={contract.client} />
                            </div>
                          </div>
                        ) : (
                          <AddressDisplay address={contract.client} />
                        )}
                      </td>

                      {/* BÊN NHẬN (BÊN B) */}
                      <td className="px-6 py-4">
                        {receiverName ? (
                          <div>
                            <p
                              className="text-sm font-bold text-gray-800 truncate max-w-40"
                              title={receiverName}
                            >
                              {receiverName}
                            </p>
                            <div className="text-xs text-gray-400 mt-1">
                              <AddressDisplay address={contract.receiver} />
                            </div>
                          </div>
                        ) : (
                          <AddressDisplay address={contract.receiver} />
                        )}
                      </td>

                      {/* THÙ LAO */}
                      <td className="px-6 py-4">
                        <span className="text-lg font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                          {contract.amount} <span className="text-xs">ETH</span>
                        </span>
                      </td>

                      {/* NÚT HÀNH ĐỘNG */}
                      <td className="px-6 py-4 text-center">
                        {isClient ? (
                          <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg cursor-not-allowed">
                            Hợp đồng của bạn
                          </span>
                        ) : isReceiver ? (
                          <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100">
                            Bạn là người nhận
                          </span>
                        ) : (
                          <button
                            onClick={() =>
                              navigate(
                                `/dashboard/contract/${contract.contractAddress}`,
                              )
                            }
                            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all transform active:scale-95 cursor-pointer"
                          >
                            Nhận việc ngay
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketplacePage;
