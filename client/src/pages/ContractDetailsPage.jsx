import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import { ethers } from "ethers";

const ContractDetailsPage = () => {
  const { id } = useParams(); // Lấy ID từ URL
  const { walletAddress, getAgreementContract } = useWeb3();

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true); // Mặc định đang tải
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
    "bg-orange-100 text-orange-800",
    "bg-green-100 text-green-800",
    "bg-red-100 text-red-800",
  ];

  // Hàm lấy dữ liệu hợp đồng
  const fetchDetails = async () => {
    // 1. Nếu chưa có hàm lấy hợp đồng (Context chưa load xong), dừng lại
    if (!id || !getAgreementContract) return;

    try {
      setLoading(true);
      const contract = getAgreementContract(id);

      // 2. QUAN TRỌNG: Nếu chưa kết nối ví, contract sẽ là null -> Dừng lại, không báo lỗi
      if (!contract) {
        // console.log("Đang chờ kết nối ví...");
        return;
      }

      // 3. Gọi dữ liệu từ Blockchain
      const data = await contract.getAgreementDetails();

      setDetails({
        state: Number(data[0]),
        client: data[1],
        provider: data[2],
        receiver: data[3],
        amount: ethers.formatEther(data[4]),
        terms: data[5],
        termsHash: data[6],
      });
    } catch (error) {
      console.error("Lỗi tải hợp đồng:", error);
    } finally {
      setLoading(false);
    }
  };

  // Chạy lại khi ID thay đổi HOẶC khi ví thay đổi (kết nối thành công)
  useEffect(() => {
    if (walletAddress) {
      fetchDetails();
    }
  }, [id, walletAddress, getAgreementContract]);

  // === CÁC HÀM TƯƠNG TÁC ===

  const handleAccept = async () => {
    try {
      setActionLoading(true);
      const contract = getAgreementContract(id);
      const tx = await contract.acceptAgreement();
      await tx.wait();
      alert("Đã chấp nhận hợp đồng thành công!");
      fetchDetails();
    } catch (error) {
      console.error(error);
      alert("Lỗi: " + (error.reason || "Giao dịch thất bại"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      setActionLoading(true);
      const contract = getAgreementContract(id);
      let tx;
      if (newStatus === "InProgress")
        tx = await contract.updateStatusInProgress();
      if (newStatus === "Completed")
        tx = await contract.updateStatusCompleted();

      await tx.wait();
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
      alert("Đã xác nhận và thanh toán tiền cho Nhà cung cấp!");
      fetchDetails();
    } catch (error) {
      console.error(error);
      alert("Lỗi: " + error.reason);
    } finally {
      setActionLoading(false);
    }
  };

  // === RENDER GIAO DIỆN ===

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">
        Đang tải thông tin từ Blockchain...
      </div>
    );

  if (!details)
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">
          Không tìm thấy hợp đồng hoặc chưa kết nối ví!
        </p>
        {/* Nút hỗ trợ kết nối lại nếu cần */}
        {!walletAddress && (
          <p className="text-gray-500 text-sm">
            Vui lòng kiểm tra nút Ví ở góc phải.
          </p>
        )}
      </div>
    );

  // Kiểm tra vai trò
  const isProvider =
    walletAddress?.toLowerCase() === details.provider?.toLowerCase() ||
    (details.state === 0 &&
      walletAddress?.toLowerCase() !== details.client?.toLowerCase());

  const isReceiver =
    walletAddress?.toLowerCase() === details.receiver?.toLowerCase();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Chi tiết Hợp đồng
          </h1>
          <p className="text-sm text-gray-500 break-all">ID: {id}</p>
        </div>
        <span
          className={`px-4 py-2 rounded-full font-semibold ${
            stateColors[details.state]
          }`}
        >
          {stateLabels[details.state]}
        </span>
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
          <div className="md:col-span-2">
            <h3 className="text-sm font-medium text-gray-500 uppercase">
              File đính kèm (IPFS)
            </h3>
            <a
              href={`https://gateway.pinata.cloud/ipfs/${details.termsHash}`}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex items-center text-blue-600 hover:underline"
            >
              <i className="uil uil-file-download-alt mr-2"></i>
              Xem tài liệu điều khoản
            </a>
          </div>
        </div>
      </div>

      {/* Các bên tham gia */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="font-bold text-gray-900 mb-4">Các bên tham gia</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Người tạo (Client):</span>
            <span className="font-mono text-sm">{details.client}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Nhà vận chuyển (Provider):</span>
            <span className="font-mono text-sm">
              {details.provider === "0x0000000000000000000000000000000000000000"
                ? "(Chưa có)"
                : details.provider}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Người nhận (Receiver):</span>
            <span className="font-mono text-sm">{details.receiver}</span>
          </div>
        </div>
      </div>

      {/* === KHU VỰC HÀNH ĐỘNG === */}
      <div className="flex justify-end gap-4">
        {/* Nhà cung cấp chấp nhận */}
        {details.state === 0 && walletAddress !== details.client && (
          <button
            onClick={handleAccept}
            disabled={actionLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {actionLoading ? "Đang xử lý..." : "Chấp nhận Hợp đồng này"}
          </button>
        )}

        {/* Cập nhật trạng thái */}
        {details.state === 1 && isProvider && (
          <button
            onClick={() => handleUpdateStatus("InProgress")}
            disabled={actionLoading}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-800 disabled:bg-gray-400 cursor-pointer"
          >
            Cập nhật: Đang thực hiện
          </button>
        )}

        {details.state === 2 && isProvider && (
          <button
            onClick={() => handleUpdateStatus("Completed")}
            disabled={actionLoading}
            className="px-6 py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400 cursor-pointer"
          >
            Cập nhật: Đã hoàn thành
          </button>
        )}

        {/* Người nhận xác nhận */}
        {details.state === 3 && isReceiver && (
          <button
            onClick={handleConfirm}
            disabled={actionLoading}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 disabled:bg-gray-400"
          >
            {actionLoading ? "Đang xử lý..." : "Xác nhận & Thanh toán"}
          </button>
        )}
      </div>
    </div>
  );
};

export default ContractDetailsPage;
