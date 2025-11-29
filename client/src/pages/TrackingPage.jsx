import React, { useState, useEffect } from "react";
import { useWeb3 } from "../context/Web3Context";
import { ethers } from "ethers";
import { agreementABI } from "../constants";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // 1. Import axios

const TrackingPage = () => {
  const { provider, connectWallet, walletAddress } = useWeb3();
  const [searchId, setSearchId] = useState("");
  const [contractData, setContractData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // State cho danh sách gợi ý
  const [recentContracts, setRecentContracts] = useState([]);

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

  // 2. Fetch danh sách hợp đồng gần đây của user để gợi ý
  useEffect(() => {
    const fetchRecents = async () => {
      if (walletAddress) {
        try {
          const response = await axios.get(
            `http://localhost:5000/api/contracts?wallet=${walletAddress}`
          );
          // Lấy 3 hợp đồng mới nhất
          setRecentContracts(response.data.slice(0, 3));
        } catch (err) {
          console.error("Lỗi tải gợi ý:", err);
        }
      }
    };
    fetchRecents();
  }, [walletAddress]);

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
        address: searchId,
      });
    } catch (err) {
      console.error(err);
      setError("Không tìm thấy hợp đồng này trên hệ thống.");
    } finally {
      setLoading(false);
    }
  };

  // Hàm chọn nhanh từ danh sách gợi ý
  const selectContract = (id) => {
    setSearchId(id);
    // Tự động trigger tìm kiếm luôn nếu muốn (hoặc để user bấm Tra cứu)
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

        {/* === 3. PHẦN GỢI Ý / DANH SÁCH GẦN ĐÂY === */}
        {!contractData && (
          <div className="mt-12">
            {walletAddress && recentContracts.length > 0 ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
                  Hợp đồng gần đây của bạn
                </h3>
                <div className="grid gap-4">
                  {recentContracts.map((contract) => (
                    <div
                      key={contract._id}
                      onClick={() => selectContract(contract.contractAddress)}
                      className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 cursor-pointer transition-all flex justify-between items-center group"
                    >
                      <div>
                        <p className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                          {contract.terms}
                        </p>
                        <p className="text-xs text-gray-400 font-mono mt-1">
                          {contract.contractAddress}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            stateMap[contract.status]?.color || "bg-gray-100"
                          }`}
                        >
                          {stateMap[contract.status]?.text || "Không rõ"}
                        </span>
                        <i className="uil uil-angle-right text-xl text-gray-400 group-hover:translate-x-1 transition-transform"></i>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Nếu chưa kết nối hoặc chưa có hợp đồng: Hiện hướng dẫn
              <div className="text-center text-gray-400 mt-16">
                <i className="uil uil-box text-6xl mb-4 block opacity-20"></i>
                <p>Kết nối ví để xem danh sách hợp đồng của bạn</p>
                <p className="text-sm mt-2">
                  Hoặc nhập ID bất kỳ để tra cứu công khai
                </p>
              </div>
            )}
          </div>
        )}

        {/* Kết quả Tra cứu (Giữ nguyên) */}
        {contractData && (
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 animation-fade-in mt-8">
            {isParticipant && (
              <div className="bg-indigo-50 px-8 py-4 border-b border-indigo-100 flex justify-between items-center">
                <span className="text-indigo-700 font-medium flex items-center gap-2">
                  <i className="uil uil-user-circle text-xl"></i>
                  Bạn là một bên tham gia
                </span>
                <button
                  onClick={() =>
                    navigate(`/dashboard/contract/${contractData.address}`)
                  }
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
                >
                  Quản lý <i className="uil uil-arrow-right ml-1"></i>
                </button>
              </div>
            )}

            <div className="bg-gray-50 px-8 py-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
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
              <div>
                <h3 className="text-gray-900 font-bold text-lg mb-2">
                  Nội dung Hợp đồng
                </h3>
                <p className="text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100">
                  {contractData.terms}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-xl text-center">
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
                <div className="p-4 border rounded-xl text-center">
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
                <div className="p-4 border rounded-xl text-center">
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
