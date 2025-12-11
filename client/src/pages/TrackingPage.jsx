import React, { useState, useEffect } from "react";
import { useWeb3 } from "../context/Web3Context";
import { ethers } from "ethers";
import { agreementABI } from "../constants";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AddressDisplay from "../components/AddressDisplay";

const TrackingPage = () => {
  const { provider, connectWallet, walletAddress } = useWeb3();

  const [searchId, setSearchId] = useState("");
  const [contractData, setContractData] = useState(null);
  const [recentContracts, setRecentContracts] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Mapping trạng thái hiển thị
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

  // 1. Lấy danh sách hợp đồng gần đây từ Backend
  useEffect(() => {
    const fetchRecents = async () => {
      if (walletAddress) {
        try {
          const response = await axios.get(
            `http://localhost:5000/api/contracts?wallet=${walletAddress}`
          );
          setRecentContracts(response.data.slice(0, 3));
        } catch (err) {
          console.error("Lỗi tải gợi ý:", err);
        }
      }
    };
    fetchRecents();
  }, [walletAddress]);

  // 2. Hàm xử lý tra cứu từ Blockchain
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
      setError("Địa chỉ hợp đồng không hợp lệ (Phải bắt đầu bằng 0x...).");
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
        address: searchId,
      });
    } catch (err) {
      console.error(err);
      setError("Không tìm thấy hợp đồng này trên hệ thống Blockchain.");
    } finally {
      setLoading(false);
    }
  };

  const handleRecentClick = (contractAddress) => {
    navigate(`/dashboard/contract/${contractAddress}`);
  };

  const isParticipant =
    contractData &&
    walletAddress &&
    (walletAddress.toLowerCase() === contractData.client.toLowerCase() ||
      walletAddress.toLowerCase() === contractData.provider.toLowerCase() ||
      walletAddress.toLowerCase() === contractData.receiver.toLowerCase());

  return (
    <div className="min-h-[80vh] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header & Search Bar */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Tra cứu Trạng thái Hợp đồng
          </h1>
          <p className="text-gray-600 mb-8">
            Nhập địa chỉ hợp đồng (ID) để xem chi tiết tiến độ.
          </p>

          <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
            <div className="flex shadow-lg rounded-full overflow-hidden bg-white">
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Dán ID hợp đồng (0x...)"
                className="flex-grow px-6 py-4 outline-none text-gray-700"
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

        {/* === PHẦN DANH SÁCH GỢI Ý === */}
        {!contractData && (
          <div className="mt-12">
            {walletAddress && recentContracts.length > 0 ? (
              <div className="animate-fade-in-up">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
                  Hợp đồng gần đây của bạn
                </h3>
                <div className="grid gap-4">
                  {recentContracts.map((contract) => (
                    <div
                      key={contract._id}
                      onClick={() =>
                        handleRecentClick(contract.contractAddress)
                      }
                      className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 cursor-pointer transition-all flex justify-between items-center group"
                    >
                      <div className="flex-grow overflow-hidden">
                        <p className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                          {contract.terms}
                        </p>

                        {/* 2. ÁP DỤNG AddressDisplay CHO DANH SÁCH GẦN ĐÂY */}
                        <div className="mt-1">
                          <AddressDisplay address={contract.contractAddress} />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                            stateMap[contract.status]?.color || "bg-gray-100"
                          }`}
                        >
                          {stateMap[contract.status]?.text || "Không rõ"}
                        </span>
                        <i className="uil uil-arrow-right text-xl text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform"></i>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 mt-16">
                <i className="uil uil-box text-6xl mb-4 block opacity-20 mx-auto"></i>
                <p>Kết nối ví để xem danh sách hợp đồng của bạn</p>
                <p className="text-sm mt-2">
                  Hoặc nhập ID bất kỳ để tra cứu công khai
                </p>
              </div>
            )}
          </div>
        )}

        {/* === PHẦN KẾT QUẢ TRA CỨU === */}
        {contractData && (
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 animation-fade-in mt-8">
            {/* Banner Điều hướng */}
            {isParticipant && (
              <div className="bg-indigo-50 px-8 py-4 border-b border-indigo-100 flex justify-between items-center flex-wrap gap-2">
                <span className="text-indigo-700 font-medium flex items-center gap-2 text-sm sm:text-base">
                  <i className="uil uil-user-circle text-xl"></i>
                  Bạn là một bên tham gia hợp đồng này
                </span>
                <button
                  onClick={() =>
                    navigate(`/dashboard/contract/${contractData.address}`)
                  }
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center"
                >
                  Đi tới Quản lý <i className="uil uil-arrow-right ml-1"></i>
                </button>
              </div>
            )}

            {/* Header Kết quả */}
            <div className="bg-gray-50 px-8 py-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-center sm:text-left">
                <p className="text-sm text-gray-500 uppercase font-bold tracking-wide">
                  Trạng thái
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
              <div className="text-center sm:text-right">
                <p className="text-sm text-gray-500 uppercase font-bold tracking-wide">
                  Giá trị
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {contractData.amount} ETH
                </p>
              </div>
            </div>

            {/* Nội dung chi tiết */}
            <div className="px-8 py-8 space-y-6">
              <div>
                <h3 className="text-gray-900 font-bold text-lg mb-2">
                  Nội dung Hợp đồng
                </h3>
                <p className="text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100 italic">
                  "{contractData.terms}"
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 3. ÁP DỤNG AddressDisplay CHO CÁC CARD CLIENT/PROVIDER/RECEIVER */}

                {/* Client Card */}
                <div className="p-4 border rounded-xl text-center hover:border-blue-200 transition-colors group">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <i className="uil uil-user"></i>
                  </div>
                  <p className="text-xs text-gray-400 uppercase font-bold mb-2">
                    Người Gửi
                  </p>
                  <div className="flex justify-center">
                    <AddressDisplay address={contractData.client} />
                  </div>
                </div>

                {/* Provider Card */}
                <div className="p-4 border rounded-xl text-center hover:border-green-200 transition-colors group">
                  <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <i className="uil uil-truck"></i>
                  </div>
                  <p className="text-xs text-gray-400 uppercase font-bold mb-2">
                    Nhà Vận Chuyển
                  </p>
                  <div className="flex justify-center">
                    <AddressDisplay address={contractData.provider} />
                  </div>
                </div>

                {/* Receiver Card */}
                <div className="p-4 border rounded-xl text-center hover:border-purple-200 transition-colors group">
                  <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <i className="uil uil-home"></i>
                  </div>
                  <p className="text-xs text-gray-400 uppercase font-bold mb-2">
                    Người Nhận
                  </p>
                  <div className="flex justify-center">
                    <AddressDisplay address={contractData.receiver} />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-center">
                <a
                  href={`https://gateway.pinata.cloud/ipfs/${contractData.termsHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <i className="uil uil-file-alt mr-2"></i>
                  Xem tài liệu gốc trên IPFS
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
