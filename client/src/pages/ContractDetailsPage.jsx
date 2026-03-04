import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import { ethers } from "ethers";
import axios from "axios";
import AddressDisplay from "../components/AddressDisplay";

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

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(Number(timestamp) * 1000).toLocaleString("vi-VN");
  };

  const syncToBackend = async (newStatus, providerAddr = null) => {
    try {
      const payload = { contractAddress: id, status: newStatus };
      if (providerAddr) payload.provider = providerAddr;
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      await axios.put(`${API_URL}/api/contracts/update-status`, payload);
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
      alert("Lỗi: " + error.reason);
    } finally {
      setActionLoading(false);
    }
  };

  // --- SỬA HÀM XUẤT PDF TẠI ĐÂY ---
  const handleDownloadPDF = () => {
    window.print(); // Gọi lệnh in siêu mượt của trình duyệt
  };

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
    // Thêm print:p-0 print:m-0 để khi in nó tràn viền đẹp mắt
    <div className="p-4 md:p-6 max-w-4xl mx-auto relative print:p-0 print:m-0 print:max-w-none">
      {/* NÚT TẢI PDF - Thêm print:hidden để khi in không bị dính cái nút này vào giấy */}
      <div className="flex justify-end mb-4 print:hidden">
        <button
          onClick={handleDownloadPDF}
          className="bg-gray-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-900 transition-all shadow-lg transform active:scale-95 cursor-pointer"
        >
          <i className="uil uil-print text-lg"></i> In / Lưu PDF
        </button>
      </div>

      {/* VÙNG IN PDF */}
      <div
        id="printable-contract"
        className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 print:shadow-none print:border-none print:p-0"
      >
        <div className="text-center mb-8 border-b-2 border-gray-800 pb-6">
          <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wide">
            Chứng Nhận Hợp Đồng Blockchain
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            Được lưu trữ & xác thực minh bạch trên mạng lưới Ethereum (Sepolia
            Testnet)
          </p>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-sm text-gray-500 font-bold uppercase mb-1">
              Mã Hợp Đồng (Smart Contract ID)
            </p>
            <p className="font-mono text-gray-800 font-bold text-sm bg-gray-100 px-3 py-1 rounded inline-block">
              {id}
            </p>
          </div>
          <div className="text-right">
            <span
              className={`px-4 py-2 rounded-full font-bold text-sm ${stateColors[details.state]}`}
            >
              {stateLabels[details.state]}
            </span>
            {details.isLate && (
              <p className="mt-2 text-xs font-bold text-red-600">
                ⚠ Đã ghi nhận vi phạm trễ hạn
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="md:col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-200 print:border print:border-gray-300">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">
              Tóm tắt nội dung dịch vụ
            </h3>
            <p className="text-gray-900 font-medium">{details.terms}</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 print:border print:border-gray-300">
            <h3 className="text-xs font-bold text-blue-500 uppercase mb-1">
              Giá trị ký quỹ / Thanh toán
            </h3>
            <p className="text-2xl font-bold text-blue-700">
              {details.amount} ETH
            </p>
          </div>

          <div
            className={`${isOverdue ? "bg-red-50 border-red-200" : "bg-orange-50 border-orange-100"} p-4 rounded-xl border print:border print:border-gray-300`}
          >
            <h3
              className={`text-xs font-bold uppercase mb-1 ${isOverdue ? "text-red-500" : "text-orange-600"}`}
            >
              Thời hạn cam kết
            </h3>
            <p
              className={`text-lg font-mono font-bold ${isOverdue ? "text-red-700" : "text-gray-800"}`}
            >
              {formatDate(details.deadline)}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 print:border print:border-gray-300">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">
              Quy định phạt vi phạm
            </h3>
            <p className="text-lg font-mono text-gray-800 font-bold">
              -{details.penalty} ETH{" "}
              <span className="text-xs font-normal text-gray-500">
                (nếu giao muộn)
              </span>
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 print:border print:border-gray-300">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">
              Tài liệu đính kèm (Bản gốc)
            </h3>
            <p className="text-xs text-blue-600 font-mono break-all mt-1">
              https://gateway.pinata.cloud/ipfs/{details.termsHash}
            </p>
          </div>
        </div>

        <h3 className="font-bold text-gray-900 mb-4 uppercase border-b pb-2">
          Định danh các bên tham gia
        </h3>
        <div className="space-y-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gray-50 p-3 rounded-lg border border-gray-100 print:border print:border-gray-300">
            <span className="text-gray-600 font-bold text-sm mb-1 sm:mb-0">
              Bên Giao (Client):
            </span>
            <span className="font-mono text-sm text-gray-800">
              {details.client}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gray-50 p-3 rounded-lg border border-gray-100 print:border print:border-gray-300">
            <span className="text-gray-600 font-bold text-sm mb-1 sm:mb-0">
              Bên Vận Chuyển (Provider):
            </span>
            <span className="font-mono text-sm text-gray-800">
              {details.provider === "0x0000000000000000000000000000000000000000"
                ? "(Chưa có người nhận)"
                : details.provider}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gray-50 p-3 rounded-lg border border-gray-100 print:border print:border-gray-300">
            <span className="text-gray-600 font-bold text-sm mb-1 sm:mb-0">
              Bên Nhận (Receiver):
            </span>
            <span className="font-mono text-sm text-gray-800">
              {details.receiver}
            </span>
          </div>
        </div>

        <div className="mt-12 text-center text-xs text-gray-400 italic">
          <p>
            Tài liệu này được trích xuất tự động từ Hệ thống Quản lý Logistics
            Blockchain.
          </p>
          <p>
            Dữ liệu mang tính chất tham chiếu, được bảo vệ bằng mật mã học và
            không thể giả mạo.
          </p>
        </div>
      </div>

      {/* KHU VỰC NÚT HÀNH ĐỘNG - Thêm print:hidden */}
      <div className="flex flex-wrap justify-end gap-4 mt-6 print:hidden">
        {details.state === 0 &&
          currentWallet !== details.client?.toLowerCase() &&
          currentWallet !== details.receiver?.toLowerCase() && (
            <button
              onClick={handleAccept}
              disabled={actionLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg cursor-pointer"
            >
              {actionLoading ? "Đang xử lý..." : "Nhận đơn hàng này"}
            </button>
          )}
        {details.state === 1 && isProvider && (
          <button
            onClick={() => handleUpdateStatus("InProgress")}
            disabled={actionLoading}
            className="px-6 py-3 bg-yellow-500 text-white rounded-xl font-bold hover:bg-yellow-600 shadow-lg cursor-pointer"
          >
            {actionLoading ? "Đang xử lý..." : "Cập nhật: Bắt đầu giao hàng"}
          </button>
        )}
        {details.state === 2 && isProvider && (
          <button
            onClick={() => handleUpdateStatus("Completed")}
            disabled={actionLoading}
            className="px-6 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 shadow-lg cursor-pointer"
          >
            {actionLoading ? "Đang xử lý..." : "Cập nhật: Đã giao thành công"}
          </button>
        )}
        {details.state === 3 && isReceiver && (
          <div className="flex flex-col items-end gap-2 w-full md:w-auto">
            {isOverdue && (
              <span className="text-red-600 font-bold text-sm bg-red-50 px-3 py-1 rounded-lg border border-red-100">
                ⚠ Đơn hàng đã quá hạn. Hệ thống sẽ tự động trừ phạt.
              </span>
            )}
            <button
              onClick={handleConfirm}
              disabled={actionLoading}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 shadow-lg w-full md:w-auto cursor-pointer"
            >
              {actionLoading
                ? "Đang xử lý..."
                : isOverdue
                  ? `Xác nhận & Phạt (${details.penalty} ETH)`
                  : "Xác nhận hàng & Thanh toán"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractDetailsPage;
