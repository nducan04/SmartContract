import React, { useState, useEffect } from "react";
import { useWeb3 } from "../context/Web3Context";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import AddressDisplay from "../components/AddressDisplay";
// 1. IMPORT QR MODAL
import QRModal from "../components/QRModal";

const ContractListPage = () => {
  const { walletAddress } = useWeb3();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 2. STATE CHO QR MODAL
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedContractAddress, setSelectedContractAddress] = useState(null);

  const roleFilter = searchParams.get("role") || "all";

  // Config màu sắc cho Badge trạng thái
  const statusConfig = {
    0: {
      label: "Mới tạo",
      bg: "bg-blue-50",
      text: "text-blue-600",
      dot: "bg-blue-600",
    },
    1: {
      label: "Đã chấp nhận",
      bg: "bg-purple-50",
      text: "text-purple-600",
      dot: "bg-purple-600",
    },
    2: {
      label: "Đang thực hiện",
      bg: "bg-yellow-50",
      text: "text-yellow-600",
      dot: "bg-yellow-600",
    },
    3: {
      label: "Đã hoàn thành",
      bg: "bg-green-50",
      text: "text-green-600",
      dot: "bg-green-600",
    },
    4: {
      label: "Đã thanh toán",
      bg: "bg-gray-100",
      text: "text-gray-600",
      dot: "bg-gray-600",
    },
    5: {
      label: "Đã hủy",
      bg: "bg-red-50",
      text: "text-red-600",
      dot: "bg-red-600",
    },
  };

  useEffect(() => {
    const fetchContracts = async () => {
      if (!walletAddress) return;
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/api/contracts?wallet=${walletAddress}`,
        );
        let data = response.data;

        if (roleFilter === "client")
          data = data.filter((c) => c.client === walletAddress.toLowerCase());
        if (roleFilter === "provider")
          data = data.filter((c) => c.provider === walletAddress.toLowerCase());
        if (roleFilter === "receiver")
          data = data.filter((c) => c.receiver === walletAddress.toLowerCase());

        setContracts(
          data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
        );
      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContracts();
  }, [walletAddress, roleFilter]);

  // 3. HÀM XỬ LÝ MỞ/ĐÓNG MODAL
  const handleShowQR = (address) => {
    setSelectedContractAddress(address);
    setShowQRModal(true);
  };

  const handleCloseQR = () => {
    setShowQRModal(false);
    setSelectedContractAddress(null);
  };

  return (
    <div className="p-2 relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <i className="uil uil-list-ul text-blue-600"></i> Quản lý Hợp đồng
        </h1>
        <button
          onClick={() => navigate("/dashboard/create")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
        >
          + Tạo mới
        </button>
      </div>

      {/* Tabs Filter */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
        {["all", "client", "provider", "receiver"].map((role) => (
          <button
            key={role}
            onClick={() => navigate(`/dashboard/contracts?role=${role}`)}
            className={`px-4 py-2 text-sm font-medium rounded-lg capitalize transition-all 
            ${
              roleFilter === role
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {role === "all" ? "Tất cả" : role}
          </button>
        ))}
      </div>

      {/* TABLE CONTENT */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : contracts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <i className="uil uil-file-slash text-4xl mb-2"></i>
            <p>Không tìm thấy dữ liệu.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-bold tracking-wider">
                  <th className="px-6 py-4">ID Hợp đồng</th>
                  <th className="px-6 py-4">Nội dung</th>
                  <th className="px-6 py-4">Vai trò</th>
                  <th className="px-6 py-4">Giá trị</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {contracts.map((contract) => {
                  const status =
                    statusConfig[contract.status] || statusConfig[0];
                  let myRole = "Liên quan";
                  const currentWallet = walletAddress.toLowerCase();
                  if (currentWallet === contract.client)
                    myRole = "Người Gửi (Client)";
                  else if (currentWallet === contract.provider)
                    myRole = "Vận Chuyển (Provider)";
                  else if (currentWallet === contract.receiver)
                    myRole = "Người Nhận (Receiver)";

                  return (
                    <tr
                      key={contract._id}
                      className="hover:bg-blue-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <AddressDisplay address={contract.contractAddress} />
                      </td>

                      <td className="px-6 py-4 max-w-xs">
                        <p
                          className="text-sm font-medium text-gray-900 truncate"
                          title={contract.terms}
                        >
                          {contract.terms}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(contract.createdAt).toLocaleDateString()}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {myRole}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-gray-800">
                          {contract.amount} ETH
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${status.bg} ${status.text}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-2 ${status.dot}`}
                          ></span>
                          {status.label}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* 4. NÚT MỞ QR CODE */}
                          <button
                            onClick={() =>
                              handleShowQR(contract.contractAddress)
                            }
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-500 
                            hover:text-white transition-all shadow-sm cursor-pointer"
                            title="Lấy mã QR"
                          >
                            <i className="uil uil-qrcode-scan text-lg"></i>
                          </button>

                          {/* Nút Xem chi tiết */}
                          <button
                            onClick={() =>
                              navigate(
                                `/dashboard/contract/${contract.contractAddress}`,
                              )
                            }
                            className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold 
                            hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                          >
                            Xem chi tiết
                            <i className="uil uil-arrow-right text-lg"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && contracts.length > 0 && (
        <p className="text-xs text-gray-400 mt-4 ml-2">
          Hiển thị {contracts.length} bản ghi.
        </p>
      )}

      {/* 5. NHÚNG COMPONENT QR MODAL */}
      <QRModal
        show={showQRModal}
        onClose={handleCloseQR}
        contractId={selectedContractAddress}
      />
    </div>
  );
};

export default ContractListPage;
