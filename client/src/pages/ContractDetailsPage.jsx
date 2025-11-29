import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import { ethers } from "ethers";
import axios from "axios";

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
    "bg-orange-100 text-orange-800",
    "bg-green-100 text-green-800",
    "bg-red-100 text-red-800",
  ];

  // LẤY DỮ LIỆU TỪ BLOCKCHAIN
  const fetchDetails = async () => {
    if (!id || !getAgreementContract) return;

    try {
      setLoading(true);
      const contract = getAgreementContract(id);

      if (!contract) return;

      const data = await contract.getAgreementDetails();

      // Lấy trạng thái thực tế từ Blockchain
      const realState = Number(data[0]);

      setDetails({
        state: realState, // Dùng trạng thái thực
        client: data[1],
        provider: data[2],
        receiver: data[3],
        amount: ethers.formatEther(data[4]),
        terms: data[5],
        termsHash: data[6],
      });

      // 🔥 TÍNH NĂNG MỚI: TỰ ĐỘNG ĐỒNG BỘ 🔥
      // Mỗi khi load trang, tự động báo cho Backend biết trạng thái mới nhất
      syncToBackend(realState);
    } catch (error) {
      console.error("Lỗi tải hợp đồng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      fetchDetails();
    }
  }, [id, walletAddress, getAgreementContract]);

  // ĐỒNG BỘ VỀ SERVER
  const syncToBackend = async (newStatus) => {
    try {
      // Chuẩn bị dữ liệu gửi đi
      const payload = {
        contractAddress: id,
        status: newStatus,
      };

      // Nếu trạng thái là 1 (Accepted), gửi kèm địa chỉ Provider (chính là ví hiện tại)
      if (newStatus === 1) {
        payload.provider = walletAddress;
      }

      await axios.put(
        "http://localhost:5000/api/contracts/update-status",
        payload
      );
      console.log("✅ Đồng bộ thành công!");
    } catch (error) {
      console.error("❌ Lỗi đồng bộ:", error);
    }
  };

  // 1. Nhà cung cấp CHẤP NHẬN
  const handleAccept = async () => {
    try {
      setActionLoading(true);
      const contract = getAgreementContract(id);
      const tx = await contract.acceptAgreement();
      await tx.wait();

      await syncToBackend(1);

      alert("Đã chấp nhận hợp đồng thành công!");
      fetchDetails();
    } catch (error) {
      console.error(error);
      alert("Lỗi: " + (error.reason || "Giao dịch thất bại"));
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Nhà cung cấp CẬP NHẬT TRẠNG THÁI
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

      await tx.wait(); // Chờ Blockchain xác nhận

      await syncToBackend(statusNumber); // Đồng bộ DB

      alert("Đã cập nhật trạng thái!");
      fetchDetails();
    } catch (error) {
      console.error(error);
      alert("Lỗi: " + error.reason);
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Người nhận XÁC NHẬN & THANH TOÁN
  const handleConfirm = async () => {
    try {
      setActionLoading(true);
      const contract = getAgreementContract(id);
      const tx = await contract.confirmAndPay();
      await tx.wait();

      await syncToBackend(4);

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
        {!walletAddress && (
          <p className="text-gray-500 text-sm">
            Vui lòng kiểm tra nút Ví ở góc phải.
          </p>
        )}
      </div>
    );

  // Kiểm tra vai trò (Dùng .toLowerCase() để so sánh chính xác)
  const currentWallet = walletAddress ? walletAddress.toLowerCase() : "";
  const providerAddr = details.provider ? details.provider.toLowerCase() : "";
  const clientAddr = details.client ? details.client.toLowerCase() : "";
  const receiverAddr = details.receiver ? details.receiver.toLowerCase() : "";

  const isProvider =
    currentWallet === providerAddr ||
    (details.state === 0 && currentWallet !== clientAddr);

  const isReceiver = currentWallet === receiverAddr;

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

      {/* === KHU VỰC HÀNH ĐỘNG (Nút bấm) === */}
      <div className="flex justify-end gap-4">
        {/* 1. Nút cho Provider CHẤP NHẬN */}
        {details.state === 0 &&
          currentWallet !== details.client?.toLowerCase() && (
            <button
              onClick={handleAccept}
              disabled={actionLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400"
            >
              {actionLoading ? "Đang xử lý..." : "Chấp nhận Hợp đồng này"}
            </button>
          )}

        {/* 2. Nút cho Provider CẬP NHẬT TIẾN ĐỘ */}
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

        {/* 3. Nút cho Receiver XÁC NHẬN & THANH TOÁN */}
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
