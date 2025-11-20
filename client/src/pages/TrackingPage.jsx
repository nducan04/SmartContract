import React, { useState } from "react";
import { useWeb3 } from "../context/Web3Context";
import { ethers } from "ethers";
import { agreementABI } from "../constants";
import { useNavigate } from "react-router-dom";

const TrackingPage = () => {
  const { provider, connectWallet, walletAddress } = useWeb3();
  const [searchId, setSearchId] = useState("");
  const [contractData, setContractData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const stateMap = [
    {
      text: "Mới tạo",
      color: "bg-blue-100 text-blue-800",
      icon: "uil-plus-circle",
    },
    {
      text: "Đã chấp nhận",
      color: "bg-purple-100 text-purple-800",
      icon: "uil-user-check",
    },
    {
      text: "Đang thực hiện",
      color: "bg-yellow-100 text-yellow-800",
      icon: "uil-truck",
    },
    {
      text: "Đã hoàn thành",
      color: "bg-green-100 text-green-800",
      icon: "uil-check-circle",
    },
    {
      text: "Đã thanh toán",
      color: "bg-gray-100 text-gray-800",
      icon: "uil-bill",
    },
    {
      text: "Đã hủy",
      color: "bg-red-100 text-red-800",
      icon: "uil-times-circle",
    },
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setContractData(null);

    if (!provider) {
      alert("Vui lòng kết nối ví để tra cứu!");
      connectWallet();
      return;
    }

    if (!ethers.isAddress(searchId)) {
      setError("Địa chỉ hợp đồng không hợp lệ.");
      return;
    }

    setLoading(true);

    try {
      const contract = new ethers.Contract(searchId, agreementABI, provider);
      const data = await contract.getAgreementDetails();

      setContractData({
        state: Number(data[0]),
        client: data[1],
        provider: data[2],
        receiver: data[3],
        amount: ethers.formatEther(data[4]),
        terms: data[5],
        termsHash: data[6],
        address: searchId, // Lưu lại địa chỉ để dùng
      });
    } catch (err) {
      console.error(err);
      setError("Không tìm thấy hợp đồng này trên hệ thống.");
    } finally {
      setLoading(false);
    }
  };

  // 4. Kiểm tra xem người xem có phải là người trong cuộc không
  const isParticipant =
    contractData &&
    walletAddress &&
    (walletAddress.toLowerCase() === contractData.client.toLowerCase() ||
      walletAddress.toLowerCase() === contractData.provider.toLowerCase() ||
      walletAddress.toLowerCase() === contractData.receiver.toLowerCase());

  return (
    <div className="min-h-[80vh] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header & Search Bar (Giữ nguyên) */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Tra cứu Trạng thái Hợp đồng
          </h1>
          <p className="text-gray-600 mb-8">
            Nhập địa chỉ hợp đồng (ID) để xem chi tiết.
          </p>

          <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
            <div className="flex shadow-lg rounded-full overflow-hidden">
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Ví dụ: 0x51da..."
                className="grow px-6 py-4 outline-none text-gray-700"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 font-bold transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <span>Đang tìm...</span>
                ) : (
                  <>
                    <i className="uil uil-search"></i> Tra cứu
                  </>
                )}
              </button>
            </div>
            {error && (
              <p className="mt-4 text-red-500 font-medium animate-pulse">
                {error}
              </p>
            )}
          </form>
        </div>

        {/* Kết quả Tra cứu */}
        {contractData && (
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 animation-fade-in">
            {/* 5. PHẦN MỚI: NÚT ĐI TỚI TRANG QUẢN LÝ */}
            {isParticipant && (
              <div className="bg-indigo-50 px-8 py-4 border-b border-indigo-100 flex justify-between items-center">
                <span className="text-indigo-700 font-medium flex items-center gap-2">
                  <i className="uil uil-user-circle text-xl"></i>
                  Bạn Là Một Bên Tham Gia Hợp Đồng Này
                </span>
                <button
                  onClick={() =>
                    navigate(`/dashboard/contract/${contractData.address}`)
                  }
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
                >
                  Quản lý & Thao tác{" "}
                  <i className="uil uil-arrow-right ml-1"></i>
                </button>
              </div>
            )}
            {/* --------------------------------------- */}

            <div className="bg-gray-50 px-8 py-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* ... (Giữ nguyên phần hiển thị trạng thái và giá trị) ... */}
              <div>
                <p className="text-sm text-gray-500 uppercase font-bold tracking-wide">
                  Trạng thái hiện tại
                </p>
                <div
                  className={`mt-2 inline-flex items-center px-4 py-2 rounded-full font-bold text-sm ${
                    stateMap[contractData.state].color
                  }`}
                >
                  <i
                    className={`uil ${
                      stateMap[contractData.state].icon
                    } mr-2 text-lg`}
                  ></i>
                  {stateMap[contractData.state].text}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 uppercase font-bold tracking-wide">
                  Giá trị Hợp đồng
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {contractData.amount} ETH
                </p>
              </div>
            </div>

            <div className="px-8 py-8 space-y-6">
              {/* ... (Giữ nguyên phần Nội dung hợp đồng) ... */}
              <div>
                <h3 className="text-gray-900 font-bold text-lg mb-2">
                  Nội dung Hợp đồng
                </h3>
                <p className="text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100">
                  {contractData.terms}
                </p>
              </div>

              {/* ... (Giữ nguyên phần Grid User) ... */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-xl text-center hover:border-blue-200 transition-colors">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="uil uil-user"></i>
                  </div>
                  <p className="text-xs text-gray-400 uppercase font-bold">
                    Người Gửi
                  </p>
                  <p className="text-xs text-gray-800 font-mono mt-1 break-all">
                    {contractData.client}
                  </p>
                </div>
                <div className="p-4 border rounded-xl text-center hover:border-green-200 transition-colors">
                  <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="uil uil-truck"></i>
                  </div>
                  <p className="text-xs text-gray-400 uppercase font-bold">
                    Nhà Vận Chuyển
                  </p>
                  <p className="text-xs text-gray-800 font-mono mt-1 break-all">
                    {contractData.provider ===
                    "0x0000000000000000000000000000000000000000"
                      ? "Chưa có"
                      : contractData.provider}
                  </p>
                </div>
                <div className="p-4 border rounded-xl text-center hover:border-purple-200 transition-colors">
                  <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="uil uil-home"></i>
                  </div>
                  <p className="text-xs text-gray-400 uppercase font-bold">
                    Người Nhận
                  </p>
                  <p className="text-xs text-gray-800 font-mono mt-1 break-all">
                    {contractData.receiver}
                  </p>
                </div>
              </div>

              {/* ... (Giữ nguyên Link IPFS) ... */}
              <div className="pt-4 border-t border-gray-100 flex justify-center">
                <a
                  href={`https://gateway.pinata.cloud/ipfs/${contractData.termsHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <i className="uil uil-file-alt mr-2"></i> Xem tài liệu gốc
                  trên IPFS
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackingPage;
