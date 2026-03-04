import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { useWeb3 } from "../context/Web3Context";
import AddressDisplay from "../components/AddressDisplay";

// --- COMPONENT MODAL CHI TIẾT BƯỚC (Giữ nguyên của bạn) ---
const StepDetailModal = ({ step, contractData, onClose }) => {
  if (!step) return null;

  const getStepContent = () => {
    switch (step.id) {
      case 0:
        return {
          title: "Khởi tạo Hợp đồng",
          actor: "Người gửi (Client)",
          address: contractData.client,
          desc: "Hợp đồng được triển khai lên mạng Sepolia. Các điều khoản và tiền ký quỹ đã được khóa.",
          icon: "uil-cube",
        };
      case 1:
        return {
          title: "Đơn vị Vận chuyển xác nhận",
          actor: "Vận chuyển (Provider)",
          address: contractData.provider,
          desc: "Đơn vị vận chuyển đã đồng ý các điều khoản và cam kết thực hiện đơn hàng.",
          icon: "uil-check-circle",
        };
      case 2:
        return {
          title: "Đang trong quá trình vận chuyển",
          actor: "Vận chuyển (Provider)",
          address: contractData.provider,
          desc: "Hàng hóa đang được vận chuyển tới địa chỉ người nhận.",
          icon: "uil-truck",
        };
      case 3:
        return {
          title: "Giao hàng thành công",
          actor: "Vận chuyển (Provider)",
          address: contractData.provider,
          desc: "Đơn vị vận chuyển xác nhận đã giao hàng đến nơi.",
          icon: "uil-package",
        };
      case 4:
        return {
          title: "Xác nhận & Thanh toán",
          actor: "Người nhận (Receiver)",
          address: contractData.receiver,
          desc: `Người nhận đã xác nhận. Smart Contract tự động giải ngân ${contractData.amount} ETH cho đơn vị vận chuyển.`,
          icon: "uil-bill",
        };
      default:
        return {};
    }
  };

  const content = getStepContent();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
        <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2 font-bold text-lg">
            <i className={`uil ${content.icon} text-xl`}></i>
            {content.title}
          </div>
          <button
            onClick={onClose}
            className="hover:bg-blue-700 p-1 rounded-full transition-colors"
          >
            <i className="uil uil-multiply text-xl"></i>
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase">
              Người thực hiện ({content.actor})
            </p>
            <AddressDisplay address={content.address} />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase">
              Mô tả Blockchain
            </p>
            <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
              {content.desc}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-4 pt-4 border-t border-gray-100">
            <i className="uil uil-clock"></i>
            <span>Dữ liệu được xác thực trên Ethereum Sepolia</span>
          </div>
        </div>
        <div className="p-4 bg-gray-50 text-center">
          <a
            href={`https://sepolia.etherscan.io/address/${contractData.contractAddress}`}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 text-sm font-bold hover:underline flex items-center justify-center gap-1"
          >
            Xem trên Etherscan <i className="uil uil-external-link-alt"></i>
          </a>
        </div>
      </div>
    </div>
  );
};

// --- TRANG CHÍNH ---
const TrackingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // Thêm hook điều hướng
  const [contractData, setContractData] = useState(null);
  const [loading, setLoading] = useState(false); // SỬA: Mặc định là false
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState(""); // State cho ô tìm kiếm
  const [selectedStep, setSelectedStep] = useState(null);

  const steps = [
    { id: 0, label: "Khởi tạo hợp đồng" },
    { id: 1, label: "Đã chấp nhận" },
    { id: 2, label: "Đang thực hiện" },
    { id: 3, label: "Hoàn thành" },
    { id: 4, label: "Đã thanh toán" },
  ];

  useEffect(() => {
    // SỬA LỖI: Nếu không có ID thì không làm gì cả, cũng không bật loading
    if (!id) {
      setLoading(false);
      setContractData(null);
      return;
    }

    const fetchContractData = async () => {
      try {
        setLoading(true);
        setError("");

        const provider = new ethers.JsonRpcProvider(
          "https://ethereum-sepolia-rpc.publicnode.com",
        );
        const abi = [
          "function getAgreementDetails() view returns (uint8 state, address client, address provider, address receiver, uint256 amount, string terms, string termsHash, uint256 deadline, uint256 penalty, bool isLate)",
        ];

        const contract = new ethers.Contract(id, abi, provider);
        const data = await contract.getAgreementDetails();

        setContractData({
          contractAddress: id,
          state: Number(data.state),
          client: data.client,
          provider: data.provider,
          receiver: data.receiver,
          amount: ethers.formatEther(data.amount),
          terms: data.terms,
        });
      } catch (err) {
        console.error(err);
        setError(
          "Không thể tải dữ liệu. Mã hợp đồng không tồn tại hoặc lỗi mạng.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchContractData();
  }, [id]);

  // Xử lý khi người dùng nhập ID và bấm nút Tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/tracking/${searchInput.trim()}`);
    }
  };

  // 1. NẾU ĐANG TẢI DỮ LIỆU
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 2. NẾU CÓ LỖI (Nhập sai ID)
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-red-100 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
            <i className="uil uil-times-circle"></i>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Tra cứu thất bại
          </h2>
          <p className="text-red-500 mb-6 text-sm">{error}</p>
          <button
            onClick={() => navigate("/tracking")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // 3. NẾU CHƯA CÓ ID HOẶC CHƯA CÓ DỮ LIỆU -> HIỆN Ô TÌM KIẾM
  if (!id || !contractData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
            <i className="uil uil-search-alt"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Tra cứu Hợp đồng
          </h2>
          <p className="text-gray-500 mb-6 text-sm">
            Vui lòng nhập mã hợp đồng (ID) để theo dõi tiến trình vận chuyển
            theo thời gian thực.
          </p>
          <form onSubmit={handleSearch} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Nhập mã hợp đồng (0x...)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <i className="uil uil-search"></i> Tra cứu ngay
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 4. NẾU CÓ DỮ LIỆU -> HIỆN TIMELINE
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <i className="uil uil-cube"></i> SupplyChain Track
            </h1>
            <p className="opacity-80 text-sm mt-1">
              Theo dõi minh bạch trên Blockchain
            </p>
          </div>
          <button
            onClick={() => navigate("/tracking")}
            className="bg-blue-700 hover:bg-blue-800 p-2 rounded-lg transition-colors cursor-pointer"
            title="Tra cứu mã khác"
          >
            <i className="uil uil-search text-xl"></i>
          </button>
        </div>

        <div className="p-6 grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">
              Người gửi
            </p>
            <AddressDisplay address={contractData.client} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">
              Người nhận
            </p>
            <AddressDisplay address={contractData.receiver} />
          </div>
        </div>
      </div>

      {/* TIẾN ĐỘ THỰC HIỆN */}
      <div className="max-w-3xl mx-auto">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <i className="uil uil-history"></i> Tiến độ thực hiện
          <span className="text-xs font-normal text-blue-500 bg-blue-50 px-2 py-1 rounded-full">
            (Bấm vào từng bước để xem chi tiết)
          </span>
        </h3>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-10 relative">
          <div className="absolute left-8 sm:left-12 top-10 bottom-10 w-0.5 bg-gray-100"></div>

          <div className="space-y-8 relative">
            {steps.map((step) => {
              const isCompleted = contractData.state >= step.id;
              const isCurrent = contractData.state === step.id;

              return (
                <div
                  key={step.id}
                  onClick={() => (isCompleted ? setSelectedStep(step) : null)}
                  className={`relative flex items-center gap-4 sm:gap-6 group 
                    ${isCompleted ? "cursor-pointer" : "opacity-50 cursor-not-allowed"}
                  `}
                >
                  <div
                    className={`relative z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-lg shadow-sm transition-all duration-300
                    ${isCompleted ? "bg-blue-600 text-white scale-110 group-hover:ring-4 ring-blue-100" : "bg-white border-2 border-gray-200 text-gray-300"}
                  `}
                  >
                    {isCompleted ? (
                      <i className="uil uil-check"></i>
                    ) : (
                      <span className="text-xs">{step.id + 1}</span>
                    )}
                    {isCurrent && (
                      <span className="absolute -inset-1 rounded-full bg-blue-500 opacity-20 animate-ping"></span>
                    )}
                  </div>

                  <div className="flex-1 bg-white p-3 sm:p-4 rounded-xl border border-transparent transition-all duration-200 group-hover:border-blue-100 group-hover:bg-blue-50/30">
                    <h4
                      className={`font-bold text-sm sm:text-base ${isCompleted ? "text-gray-800 group-hover:text-blue-700" : "text-gray-400"}`}
                    >
                      {step.label}
                    </h4>
                    {isCurrent && (
                      <p className="text-xs text-blue-600 font-medium mt-1">
                        • Đang xử lý ở bước này
                      </p>
                    )}
                    {isCompleted && !isCurrent && (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <i className="uil uil-check-circle"></i> Đã hoàn thành
                      </p>
                    )}
                  </div>

                  {isCompleted && (
                    <div className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      <i className="uil uil-angle-right text-2xl"></i>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedStep && (
        <StepDetailModal
          step={selectedStep}
          contractData={contractData}
          onClose={() => setSelectedStep(null)}
        />
      )}

      <div className="text-center mt-8 text-xs text-gray-400">
        <p>🔒 Xác thực bởi Ethereum Sepolia Testnet</p>
      </div>
    </div>
  );
};

export default TrackingPage;
