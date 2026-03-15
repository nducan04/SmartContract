import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useWeb3 } from "../context/Web3Context";
import AddressDisplay from "../components/AddressDisplay";
import { ethers } from "ethers";

// HÀM GIẢI MÃ JSON
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

// COMPONENT DÒNG THÔNG MINH
const ContractRow = ({ contract, walletAddress, navigate }) => {
  const [terms, setTerms] = useState(contract.terms || "");
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (!terms || !terms.includes("partyA_name")) {
      const fetchFromBlockchain = async () => {
        setIsSyncing(true);
        try {
          const rpcProvider = new ethers.JsonRpcProvider(
            "https://ethereum-sepolia-rpc.publicnode.com",
          );
          const abi = [
            "function getAgreementDetails() view returns (uint8, address, address, address, uint256, string terms)",
          ];
          const sc = new ethers.Contract(
            contract.contractAddress,
            abi,
            rpcProvider,
          );
          const data = await sc.getAgreementDetails();
          setTerms(data[5]);
        } catch (error) {
          console.error("Lỗi đồng bộ:", error);
        } finally {
          setIsSyncing(false);
        }
      };
      fetchFromBlockchain();
    }
  }, [contract.contractAddress, terms]);

  const currentWallet = walletAddress ? walletAddress.toLowerCase() : "";
  const isClient = currentWallet === contract.client.toLowerCase();
  const isReceiver = currentWallet === contract.receiver.toLowerCase();

  const parsedTerms = parseTerms(terms);

  const displayTitle = isSyncing
    ? "⏳ Đang tải dữ liệu từ Blockchain..."
    : parsedTerms
      ? parsedTerms.art1_items
      : terms || "Chưa có nội dung";
  const clientName = parsedTerms ? parsedTerms.partyA_name : null;
  const receiverName = parsedTerms ? parsedTerms.partyB_name : null;

  return (
    <tr className="hover:bg-blue-50/50 transition-colors border-b border-gray-100">
      {/* SỬA LẠI: Cho phép text tự xuống dòng (break-words, whitespace-normal) */}
      <td className="px-4 py-5 align-top">
        <p className="text-sm font-bold text-gray-800 mb-2 whitespace-normal break-words leading-relaxed">
          {displayTitle}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold border border-green-200">
            MỚI
          </span>
          <AddressDisplay address={contract.contractAddress} />
        </div>
      </td>

      <td className="px-4 py-5 align-top">
        {clientName ? (
          <div>
            <p
              className="text-sm font-bold text-gray-800 whitespace-normal 
            wrap-break-word leading-relaxed"
            >
              {clientName}
            </p>
            <div className="text-xs text-gray-400 mt-2">
              <AddressDisplay address={contract.client} />
            </div>
          </div>
        ) : (
          <AddressDisplay address={contract.client} />
        )}
      </td>

      <td className="px-4 py-5 align-top">
        {receiverName ? (
          <div>
            <p
              className="text-sm font-bold text-gray-800 whitespace-normal 
            wrap-break-word leading-relaxed"
            >
              {receiverName}
            </p>
            <div className="text-xs text-gray-400 mt-2">
              <AddressDisplay address={contract.receiver} />
            </div>
          </div>
        ) : (
          <AddressDisplay address={contract.receiver} />
        )}
      </td>

      <td className="px-4 py-5 align-top">
        <span className="text-lg font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 whitespace-nowrap">
          {contract.amount} <span className="text-xs">ETH</span>
        </span>
      </td>

      <td className="px-4 py-5 align-top text-center">
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
              navigate(`/dashboard/contract/${contract.contractAddress}`)
            }
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 hover:shadow-lg transition-all cursor-pointer whitespace-nowrap"
          >
            Nhận việc ngay
          </button>
        )}
      </td>
    </tr>
  );
};

const MarketplacePage = () => {
  const { walletAddress } = useWeb3();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("newest");
  const navigate = useNavigate();

  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  useEffect(() => {
    const fetchAvailableContracts = async () => {
      try {
        setLoading(true);
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const response = await axios.get(`${API_URL}/api/contracts/available?page=${pagination.page}&limit=10`);
        
        let data = [];
        // Mới: API trả về { data, pagination }
        if (response.data && response.data.data) {
          data = response.data.data;
          setPagination(response.data.pagination);
        } else {
          // Fallback nếu api cũ
          data = response.data;
        }

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
  }, [filter, pagination.page]);

  return (
    <div className="p-2 md:p-6">
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
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${filter === "newest" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
          >
            Mới nhất
          </button>
          <button
            onClick={() => setFilter("high-price")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${filter === "high-price" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
          >
            Giá cao nhất
          </button>
        </div>
      </div>

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
            {/* THÊM table-fixed VÀ CHIA % ĐỘ RỘNG CÁC CỘT ĐỂ TRÁNH XÔ LỆCH BẢNG */}
            <table className="w-full text-left border-collapse table-fixed min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-bold tracking-wider">
                  <th className="px-4 py-4 w-[32%]">Nội dung đơn hàng</th>
                  <th className="px-4 py-4 w-[24%]">Bên Giao (Bên A)</th>
                  <th className="px-4 py-4 w-[24%]">Bên Nhận (Bên B)</th>
                  <th className="px-4 py-4 w-[10%]">Ký quỹ</th>
                  <th className="px-4 py-4 w-[10%] text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((contract) => (
                  <ContractRow
                    key={contract._id}
                    contract={contract}
                    walletAddress={walletAddress}
                    navigate={navigate}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Điều khiển Phân trang */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <span className="text-sm text-gray-500 font-medium">
              Trang {pagination.page} / {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                className="px-4 py-2 text-sm font-medium border border-gray-200 bg-white rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Trước
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                className="px-4 py-2 text-sm font-medium border border-gray-200 bg-white rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Tiếp
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketplacePage;
