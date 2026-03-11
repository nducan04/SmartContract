import React, { useState, useEffect } from "react";
import { useWeb3 } from "../context/Web3Context";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ethers } from "ethers";
import AddressDisplay from "../components/AddressDisplay";

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
      className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 w-max ${s.color}`}
    >
      <div
        className={`w-1.5 h-1.5 rounded-full ${s.color.split(" ")[1].replace("text", "bg")}`}
      ></div>
      {s.text}
    </span>
  );
};

// COMPONENT DÒNG THÔNG MINH CHO ADMIN
const AdminContractRow = ({ c }) => {
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
    ? "⏳ Đang tải dữ liệu..."
    : parsedTerms
      ? parsedTerms.art1_items
      : terms || "Không có nội dung";
  const clientName = parsedTerms ? parsedTerms.partyA_name : null;
  const receiverName = parsedTerms ? parsedTerms.partyB_name : null;

  return (
    <tr className="hover:bg-gray-50/80 transition-colors border-b border-gray-100">
      <td className="p-4 align-top">
        <AddressDisplay address={c.contractAddress} />
      </td>
      <td className="p-4 align-top">
        <p className="text-sm font-semibold text-gray-800 whitespace-normal break-words leading-relaxed">
          {displayTitle}
        </p>
      </td>
      <td className="p-4 align-top">
        {clientName ? (
          <div>
            <p className="text-sm font-bold text-gray-800 whitespace-normal break-words leading-relaxed">
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
            <p className="text-sm font-bold text-gray-800 whitespace-normal break-words leading-relaxed">
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
      <td className="p-4 align-top">
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
    </tr>
  );
};

const AdminPage = () => {
  const { walletAddress } = useWeb3();
  const navigate = useNavigate();
  const [allContracts, setAllContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  const ADMIN_WALLETS = [
    "0xC64803Cad03E12c34EF3C822cCB4Cb78E9298091",
    "0xd526cD242d52EFb14686c95248453Afc656c6994",
  ].map((addr) => addr.toLowerCase());

  useEffect(() => {
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
        const response = await axios.get(
          `${API_URL}/api/contracts/all-admin?requester=${walletAddress}`,
        );
        // Sắp xếp mới nhất lên đầu
        const sortedData = response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
        setAllContracts(sortedData);
      } catch (error) {
        console.error("Lỗi Admin:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [walletAddress, navigate]);

  if (!walletAddress || !ADMIN_WALLETS.includes(walletAddress.toLowerCase()))
    return null;

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <i className="uil uil-shield-check text-blue-600 text-3xl"></i> Quản
          trị Hệ thống
        </h1>
        <p className="text-gray-500 mt-1">
          Trung tâm giám sát toàn bộ hoạt động giao dịch trên Blockchain.
        </p>
      </div>

      {/* THỐNG KÊ NHANH */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-blue-500 relative overflow-hidden">
          <i className="uil uil-file-contract absolute -right-4 -bottom-4 text-8xl text-blue-50 opacity-50"></i>
          <p className="text-gray-500 text-xs font-bold uppercase relative z-10">
            Tổng số Hợp đồng
          </p>
          <p className="text-4xl font-bold text-gray-800 mt-2 relative z-10">
            {allContracts.length}
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
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h2 className="font-bold text-gray-700">Tất cả giao dịch</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed min-w-[1200px]">
            <thead className="bg-gray-800 text-white text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 w-[12%]">ID Blockchain</th>
                <th className="p-4 w-[28%]">Nội dung / Tên hàng</th>
                <th className="p-4 w-[18%]">Người tạo (Bên A)</th>
                <th className="p-4 w-[18%]">Người nhận (Bên B)</th>
                <th className="p-4 w-[10%]">Vận chuyển</th>
                <th className="p-4 w-[14%]">Trạng thái</th>
                <th className="p-4 w-[10%]">Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {allContracts.length > 0 ? (
                allContracts.map((c) => <AdminContractRow key={c._id} c={c} />)
              ) : (
                <tr>
                  <td colSpan="7" className="p-10 text-center text-gray-400">
                    Chưa có dữ liệu hợp đồng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
