import React, { useState, useEffect } from "react";
import { useWeb3 } from "../context/Web3Context";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ethers } from "ethers";
import AddressDisplay from "../components/AddressDisplay";
import QRModal from "../components/QRModal"; // Bổ sung import QRModal

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

// HÀM HIỂN THỊ TRẠNG THÁI CHUẨN ĐẸP
const getStatusBadge = (status) => {
  const map = [
    { text: "Mới tạo", color: "bg-gray-100 text-gray-600" },
    { text: "Đã chấp nhận", color: "bg-purple-100 text-purple-700" },
    { text: "Đang thực hiện", color: "bg-yellow-100 text-yellow-700" },
    { text: "Đã hoàn thành", color: "bg-green-100 text-green-700" },
    { text: "Đã thanh toán", color: "bg-blue-100 text-blue-700" },
    { text: "Đã hủy", color: "bg-red-100 text-red-700" },
  ];
  const s = map[status] || map[0];
  return (
    <span
      className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 whitespace-nowrap ${s.color}`}
    >
      <div
        className={`w-1.5 h-1.5 rounded-full ${s.color.split(" ")[1].replace("text", "bg")}`}
      ></div>
      {s.text}
    </span>
  );
};

// COMPONENT DÒNG THÔNG MINH CHO ADMIN (Đã thêm prop onShowQR và onViewDetails)
const AdminContractRow = ({ c, onShowQR, onViewDetails }) => {
  const [terms, setTerms] = useState(c.terms || "");
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
          const sc = new ethers.Contract(c.contractAddress, abi, rpcProvider);
          const data = await sc.getAgreementDetails();
          setTerms(data[5]);
        } catch (error) {
          console.error("Lỗi đồng bộ terms:", error);
        } finally {
          setIsSyncing(false);
        }
      };
      fetchFromBlockchain();
    }
  }, [c.contractAddress, terms]);

  const parsedTerms = parseTerms(terms);
  const displayTitle = isSyncing
    ? "Đang tải dữ liệu..."
    : parsedTerms
      ? parsedTerms.art1_items
      : terms || "Không có nội dung";
  const clientName = parsedTerms ? parsedTerms.partyA_name : null;
  const receiverName = parsedTerms ? parsedTerms.partyB_name : null;

  return (
    <tr className="hover:bg-gray-50/80 transition-colors border-b border-gray-100">
      <td className="p-4 align-top whitespace-nowrap">
        <AddressDisplay address={c.contractAddress} />
      </td>
      <td className="p-4 align-top min-w-[300px]">
        <p className="text-sm font-semibold text-gray-800 whitespace-normal break-words leading-relaxed line-clamp-2">
          {displayTitle}
        </p>
      </td>
      <td className="p-4 align-top">
        {clientName ? (
          <div>
            <p className="text-sm font-bold text-gray-800 whitespace-normal break-words leading-relaxed line-clamp-2">
              {clientName}
            </p>
            <div className="text-xs text-gray-400 mt-1">
              <AddressDisplay address={c.client} />
            </div>
          </div>
        ) : (
          <AddressDisplay address={c.client} />
        )}
      </td>
      <td className="p-4 align-top">
        {receiverName ? (
          <div>
            <p className="text-sm font-bold text-gray-800 whitespace-normal break-words leading-relaxed line-clamp-2">
              {receiverName}
            </p>
            <div className="text-xs text-gray-400 mt-1">
              <AddressDisplay address={c.receiver} />
            </div>
          </div>
        ) : (
          <AddressDisplay address={c.receiver} />
        )}
      </td>
      <td className="p-4 align-top whitespace-nowrap">
        {c.provider &&
          c.provider !== "0x0000000000000000000000000000000000000000" ? (
          <AddressDisplay address={c.provider} />
        ) : (
          <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded">
            Chưa nhận
          </span>
        )}
      </td>
      <td className="p-4 align-top">{getStatusBadge(c.status)}</td>
      <td className="p-4 align-top text-sm text-gray-500 font-medium">
        {new Date(c.createdAt).toLocaleDateString("vi-VN")}
      </td>

      {/* CỘT HÀNH ĐỘNG MỚI */}
      <td className="p-4 align-top text-center">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onShowQR(c.contractAddress)}
            className="p-2 text-gray-400 hover:text-blue-600 bg-gray-100 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
            title="Hiện mã QR"
          >
            <i className="uil uil-qrcode-scan text-lg"></i>
          </button>
          <button
            onClick={() => onViewDetails(c.contractAddress)}
            className="px-3 py-1.5 bg-blue-50 text-blue-600 font-bold text-xs hover:bg-blue-600 hover:text-white rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            Chi tiết
          </button>
        </div>
      </td>
    </tr>
  );
};

const AdminPage = () => {
  const { walletAddress } = useWeb3();
  const navigate = useNavigate();
  const [allContracts, setAllContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  // STATE CHO QR MODAL
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedContractAddress, setSelectedContractAddress] = useState(null);

  const ADMIN_WALLETS = import.meta.env.VITE_ADMIN_WALLETS
    ? import.meta.env.VITE_ADMIN_WALLETS.split(",").map((addr) =>
      addr.trim().toLowerCase(),
    )
    : [];

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!walletAddress) {
      return;
    }

    if (!ADMIN_WALLETS.includes(walletAddress.toLowerCase())) {
      alert("⛔ Bạn không có quyền truy cập trang Quản trị!");
      navigate("/dashboard");
      return;
    }

    setIsAuth(true);

    const fetchAllData = async () => {
      try {
        setLoading(true);
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const response = await axios.get(
          `${API_URL}/api/contracts/all-admin?requester=${walletAddress}&page=${pagination.page}&limit=10`,
        );

        if (response.data && response.data.data) {
          setAllContracts(response.data.data);
          setPagination(response.data.pagination);
        } else {
          const sortedData = response.data.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
          );
          setAllContracts(sortedData);
        }
      } catch (error) {
        console.error("Lỗi Admin:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [walletAddress, navigate, pagination.page]);

  // HÀM MỞ / ĐÓNG QR
  const handleShowQR = (address) => {
    setSelectedContractAddress(address);
    setShowQRModal(true);
  };

  const handleCloseQR = () => {
    setShowQRModal(false);
    setSelectedContractAddress(null);
  };

  if (!walletAddress) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-6"></div>
        <h2 className="text-xl font-bold text-gray-700">
          Đang xác thực quyền Admin...
        </h2>
        <p className="text-gray-500 mt-2">
          Hệ thống đang kết nối an toàn với ví MetaMask của bạn.
        </p>
      </div>
    );
  }

  if (!isAuth || loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 w-full overflow-hidden">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-blue-500 relative overflow-hidden">
          <i className="uil uil-file-contract absolute -right-4 -bottom-4 text-8xl text-blue-50 opacity-50"></i>
          <p className="text-gray-500 text-xs font-bold uppercase relative z-10">
            Tổng số hợp đồng
          </p>
          <p className="text-4xl font-bold text-gray-800 mt-2 relative z-10">
            {pagination.total || allContracts.length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-green-500 relative overflow-hidden">
          <i className="uil uil-ethereum absolute -right-4 -bottom-4 text-8xl text-green-50 opacity-50"></i>
          <p className="text-gray-500 text-xs font-bold uppercase relative z-10">
            Tổng giá trị lưu chuyển
          </p>
          <p className="text-4xl font-bold text-gray-800 mt-2 relative z-10">
            {allContracts
              .reduce((sum, c) => sum + parseFloat(c.amount || 0), 0)
              .toFixed(4)}{" "}
            <span className="text-lg text-gray-400">ETH</span>
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-purple-500 relative overflow-hidden">
          <i className="uil uil-truck absolute -right-4 -bottom-4 text-8xl text-purple-50 opacity-50"></i>
          <p className="text-gray-500 text-xs font-bold uppercase relative z-10">
            Đang vận hành
          </p>
          <p className="text-4xl font-bold text-gray-800 mt-2 relative z-10">
            {allContracts.filter((c) => c.status > 0 && c.status < 3).length}
          </p>
        </div>
      </div>

      {/* BẢNG DỮ LIỆU TOÀN CỤC */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 max-w-full">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center rounded-t-2xl">
          <h2 className="font-bold text-gray-700">Tất cả giao dịch</h2>
        </div>

        {/* Đảm bảo w-full và overflow-x-auto để cuộn ngang trên mobile */}
        <div className="overflow-x-auto w-full pb-4 scrollbar-thin scrollbar-thumb-gray-300">
          <table className="w-full text-left border-collapse table-auto min-w-[1750px]">
            <thead className="bg-gray-800 text-white text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 min-w-[180px] whitespace-nowrap">ID Blockchain</th>
                <th className="p-4 min-w-[300px] whitespace-nowrap">Nội dung / Tên hàng</th>
                <th className="p-4 min-w-[250px] whitespace-nowrap">Người tạo (Bên A)</th>
                <th className="p-4 min-w-[250px] whitespace-nowrap">Người nhận (Bên B)</th>
                <th className="p-4 min-w-[180px] whitespace-nowrap">Vận chuyển</th>
                <th className="p-4 min-w-[150px] whitespace-nowrap">Trạng thái</th>
                <th className="p-4 min-w-[120px] whitespace-nowrap">Ngày tạo</th>
                <th className="p-4 min-w-[130px] text-center whitespace-nowrap">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allContracts.length > 0 ? (
                allContracts.map((c) => (
                  <AdminContractRow
                    key={c._id}
                    c={c}
                    onShowQR={handleShowQR}
                    onViewDetails={(addr) =>
                      navigate(`/dashboard/contract/${addr}`)
                    }
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="p-10 text-center text-gray-400">
                    Chưa có dữ liệu hợp đồng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-b-2xl">
            <span className="text-sm text-gray-500 font-medium">
              Trang {pagination.page} / {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() =>
                  setPagination((p) => ({ ...p, page: p.page - 1 }))
                }
                className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Trước
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() =>
                  setPagination((p) => ({ ...p, page: p.page + 1 }))
                }
                className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Tiếp
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tích hợp Popup QR */}
      <QRModal
        show={showQRModal}
        onClose={handleCloseQR}
        contractId={selectedContractAddress}
      />
    </div>
  );
};

export default AdminPage;
