import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import { ethers } from "ethers";
import axios from "axios";
import AddressDisplay from "../components/AddressDisplay"; // <--- 1. Import Component mới

const ContractDetailsPage = () => {
  const { id } = useParams();
  const { walletAddress, getAgreementContract } = useWeb3();

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const stateLabels = [
    "Mới tạo",
    "Đã chấp nhận",
    "Đang thực hiện",
    "Đã hoàn thành",
    "Đã thanh toán",
    "Đã hủy",
  ];
  const stateColors = [
    "bg-blue-100 text-blue-800",
    "bg-purple-100 text-purple-800",
    "bg-yellow-100 text-yellow-800",
    "bg-green-100 text-green-800",
    "bg-gray-100 text-gray-800",
    "bg-red-100 text-red-800",
  ];

  // Hàm format ngày tháng
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  const syncToBackend = async (newStatus, providerAddr = null) => {
    try {
      const payload = {
        contractAddress: id,
        status: newStatus,
      };
      if (providerAddr) {
        payload.provider = providerAddr;
      }

      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      await axios.put(`${API_URL}/api/contracts/update-status`, payload);
      console.log("✅ Đã đồng bộ Database!");
    } catch (error) {
      console.error("❌ Lỗi đồng bộ:", error);
    }
  };

  const fetchDetails = async () => {
    if (!id || !getAgreementContract) return;

    try {
      setLoading(true);
      const contract = getAgreementContract(id);
      if (!contract) return;

      const data = await contract.getAgreementDetails();
      const realState = Number(data[0]);

      setDetails({
        state: realState,
        client: data[1],
        provider: data[2],
        receiver: data[3],
        amount: ethers.formatEther(data[4]),
        terms: data[5],
        termsHash: data[6],
        deadline: data[7],
        penalty: ethers.formatEther(data[8]),
        isLate: data[9],
      });

      syncToBackend(realState);
    } catch (error) {
      console.error("Lỗi tải hợp đồng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (walletAddress) fetchDetails();
  }, [id, walletAddress, getAgreementContract]);

  // === CÁC HÀM TƯƠNG TÁC ===
  const handleAccept = async () => {
    try {
      setActionLoading(true);
      const contract = getAgreementContract(id);
      const tx = await contract.acceptAgreement();
      await tx.wait();
      await syncToBackend(1, walletAddress);
      alert("Đã chấp nhận hợp đồng thành công!");
      fetchDetails();
    } catch (error) {
      console.error(error);
      alert("Lỗi: " + (error.reason || "Giao dịch thất bại"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatusText) => {
    try {
      setActionLoading(true);
      const contract = getAgreementContract(id);
      let tx;
      let statusNumber;
      if (newStatusText === "InProgress") {
        tx = await contract.updateStatusInProgress();
        statusNumber = 2;
      }
      if (newStatusText === "Completed") {
        tx = await contract.updateStatusCompleted();
        statusNumber = 3;
      }
      await tx.wait();
      await syncToBackend(statusNumber);
      alert("Đã cập nhật trạng thái!");
      fetchDetails();
    } catch (error) {
      console.error(error);
      alert("Lỗi: " + error.reason);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirm = async () => {
    try {
      setActionLoading(true);
      const contract = getAgreementContract(id);
      const tx = await contract.confirmAndPay();
      await tx.wait();
      await syncToBackend(4);
      alert("Đã xác nhận và thanh toán!");
      fetchDetails();
    } catch (error) {
      console.error(error);
      alert("Lỗi: " + error.reason);
    } finally {
      setActionLoading(false);
    }
  };

  // === RENDER ===
  if (loading)
    return <div className="p-8 text-center text-gray-500">Đang tải...</div>;
  if (!details)
    return (
      <div className="p-8 text-center text-red-500">
        Không tìm thấy hợp đồng!
      </div>
    );

  const currentWallet = walletAddress?.toLowerCase();
  const isProvider =
    currentWallet === details.provider?.toLowerCase() ||
    (details.state === 0 && currentWallet !== details.client?.toLowerCase());
  const isReceiver = currentWallet === details.receiver?.toLowerCase();
  const isOverdue =
    Date.now() / 1000 > Number(details.deadline) && details.state < 4;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Chi tiết Hợp đồng
          </h1>

          {/* 2. THAY THẾ ID TEXT BẰNG ADDRESS DISPLAY */}
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm text-gray-500">ID:</span>
            <AddressDisplay address={id} />
          </div>
        </div>

        <div className="text-right">
          <span
            className={`px-4 py-2 rounded-full font-semibold ${
              stateColors[details.state]
            }`}
          >
            {stateLabels[details.state]}
          </span>
          {details.isLate && (
            <p className="mt-2 text-xs font-bold text-red-600 border border-red-200 bg-red-50 px-2 py-1 rounded">
              ⚠ ĐÃ BỊ PHẠT VI PHẠM
            </p>
          )}
        </div>
      </div>

      {/* Thông tin chính */}
      <div className="bg-white shadow rounded-lg border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase">
              Mô tả dịch vụ
            </h3>
            <p className="mt-1 text-lg text-gray-900">{details.terms}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase">
              Giá trị ký quỹ
            </h3>
            <p className="mt-1 text-2xl font-bold text-blue-600">
              {details.amount} ETH
            </p>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <h3 className="text-sm font-bold text-orange-800 uppercase flex items-center gap-2">
              <i className="uil uil-clock"></i> Thời hạn cam kết
            </h3>
            <p
              className={`text-lg font-mono mt-1 ${
                isOverdue ? "text-red-600 font-bold" : "text-gray-800"
              }`}
            >
              {formatDate(details.deadline)}
            </p>
            {isOverdue && (
              <p className="text-xs text-red-500 font-bold mt-1">
                ⚠ Đã quá hạn! Sẽ bị trừ tiền phạt khi thanh toán.
              </p>
            )}
          </div>

          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h3 className="text-sm font-bold text-red-800 uppercase flex items-center gap-2">
              <i className="uil uil-bill"></i> Mức phạt vi phạm
            </h3>
            <p className="text-lg font-mono text-gray-800 mt-1">
              -{details.penalty} ETH
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Trừ vào tiền công nếu giao muộn.
            </p>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-sm font-medium text-gray-500 uppercase">
              File đính kèm
            </h3>
            <a
              href={`https://gateway.pinata.cloud/ipfs/${details.termsHash}`}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex items-center text-blue-600 hover:underline"
            >
              Xem tài liệu điều khoản
            </a>
          </div>
        </div>
      </div>

      {/* Các bên tham gia */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="font-bold text-gray-900 mb-4">Các bên tham gia</h3>
        <div className="space-y-4">
          {/* 3. THAY THẾ CÁC DÒNG ĐỊA CHỈ BẰNG COMPONENT */}
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">
              Client (Người Gửi):
            </span>
            <AddressDisplay address={details.client} />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">
              Provider (Vận Chuyển):
            </span>
            <AddressDisplay address={details.provider} />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">
              Receiver (Người Nhận):
            </span>
            <AddressDisplay address={details.receiver} />
          </div>
        </div>
      </div>

      {/* Khu vực hành động */}
      <div className="flex justify-end gap-4">
        {details.state === 0 &&
          currentWallet !== details.client?.toLowerCase() &&
          currentWallet !== details.receiver?.toLowerCase() && (
            <button
              onClick={handleAccept}
              disabled={actionLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400"
            >
              {actionLoading ? "Đang xử lý..." : "Chấp nhận Hợp đồng này"}
            </button>
          )}
        {details.state === 1 && isProvider && (
          <button
            onClick={() => handleUpdateStatus("InProgress")}
            disabled={actionLoading}
            className="px-6 py-3 bg-yellow-500 text-white rounded-lg font-bold hover:bg-yellow-600 disabled:bg-gray-400"
          >
            Cập nhật: Đang thực hiện
          </button>
        )}
        {details.state === 2 && isProvider && (
          <button
            onClick={() => handleUpdateStatus("Completed")}
            disabled={actionLoading}
            className="px-6 py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 disabled:bg-gray-400"
          >
            Cập nhật: Đã hoàn thành
          </button>
        )}
        {details.state === 3 && isReceiver && (
          <div className="flex flex-col items-end gap-2">
            {isOverdue && (
              <span className="text-red-600 font-bold text-sm">
                ⚠ Cảnh báo: Đơn hàng đã quá hạn. Hệ thống sẽ tự động trừ phạt.
              </span>
            )}
            <button
              onClick={handleConfirm}
              disabled={actionLoading}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 disabled:bg-gray-400"
            >
              {actionLoading
                ? "Đang xử lý..."
                : isOverdue
                  ? `Xác nhận & Phạt (${details.penalty} ETH)`
                  : "Xác nhận & Thanh toán"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractDetailsPage;
