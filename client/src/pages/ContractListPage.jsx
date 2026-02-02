import React, { useState, useEffect } from "react";
import { useWeb3 } from "../context/Web3Context";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import QRModal from "../components/QRModal";

// Import các Components con đã tách
import ContractListHeader from "../components/contractList/ContractListHeader";
import ContractFilters from "../components/contractList/ContractFilters";
import ContractTable from "../components/contractList/ContractTable";

const ContractListPage = () => {
  const { walletAddress } = useWeb3();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State quản lý dữ liệu và UI
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedContractAddress, setSelectedContractAddress] = useState(null);

  const roleFilter = searchParams.get("role") || "all";

  // --- LOGIC 1: Lấy dữ liệu từ API ---
  useEffect(() => {
    const fetchContracts = async () => {
      if (!walletAddress) return;
      try {
        setLoading(true);
        // Sử dụng biến môi trường để tránh hardcode localhost
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

        const response = await axios.get(
          `${API_URL}/api/contracts?wallet=${walletAddress}`,
        );
        let data = response.data;

        // Lọc dữ liệu theo vai trò
        if (roleFilter === "client")
          data = data.filter((c) => c.client === walletAddress.toLowerCase());
        if (roleFilter === "provider")
          data = data.filter((c) => c.provider === walletAddress.toLowerCase());
        if (roleFilter === "receiver")
          data = data.filter((c) => c.receiver === walletAddress.toLowerCase());

        // Sắp xếp mới nhất lên đầu
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

  // --- LOGIC 2: Các hàm xử lý sự kiện ---
  const handleShowQR = (address) => {
    setSelectedContractAddress(address);
    setShowQRModal(true);
  };

  const handleCloseQR = () => {
    setShowQRModal(false);
    setSelectedContractAddress(null);
  };

  const handleFilterChange = (role) => {
    setSearchParams({ role });
  };

  return (
    <div className="p-2 relative">
      {/* 1. Header & Nút Tạo */}
      <ContractListHeader onCreate={() => navigate("/dashboard/create")} />

      {/* 2. Bộ lọc */}
      <ContractFilters
        currentFilter={roleFilter}
        onFilterChange={handleFilterChange}
      />

      {/* 3. Bảng Dữ liệu */}
      <ContractTable
        contracts={contracts}
        loading={loading}
        walletAddress={walletAddress}
        onShowQR={handleShowQR}
        onViewDetails={(addr) => navigate(`/dashboard/contract/${addr}`)}
      />

      {/* 4. Footer đếm số lượng */}
      {!loading && contracts.length > 0 && (
        <p className="text-xs text-gray-400 mt-4 ml-2">
          Hiển thị {contracts.length} bản ghi.
        </p>
      )}

      {/* 5. Modal QR */}
      <QRModal
        show={showQRModal}
        onClose={handleCloseQR}
        contractId={selectedContractAddress}
      />
    </div>
  );
};

export default ContractListPage;
