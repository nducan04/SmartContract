import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import axios from "axios";
import AddressDisplay from "../components/AddressDisplay";

// --- COMPONENT MODAL CHI TIẾT BƯỚC ---
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
            className="hover:bg-blue-700 p-1 rounded-full transition-colors cursor-pointer"
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
  const navigate = useNavigate();
  const [contractData, setContractData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedStep, setSelectedStep] = useState(null);

  const steps = [
    { id: 0, label: "Khởi tạo hợp đồng" },
    { id: 1, label: "Đã chấp nhận" },
    { id: 2, label: "Đang thực hiện" },
    { id: 3, label: "Hoàn thành" },
    { id: 4, label: "Đã thanh toán" },
  ];

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setContractData(null);
      return;
    }

    const fetchContractData = async () => {
      try {
        setLoading(true);
        setError("");

        // 1. Kéo dữ liệu từ Blockchain
        const provider = new ethers.JsonRpcProvider(
          "https://ethereum-sepolia-rpc.publicnode.com",
        );
        const abi = [
          "function getAgreementDetails() view returns (uint8 state, address client, address provider, address receiver, uint256 amount, string terms, string termsHash, uint256 deadline, uint256 penalty, bool isLate)",
        ];

        const contract = new ethers.Contract(id, abi, provider);
        const data = await contract.getAgreementDetails();

        // 2. Kéo dữ liệu Bằng chứng (Proofs) từ Backend MongoDB
        let dbProofs = {};
        try {
          const API_URL =
            import.meta.env.VITE_API_URL || "http://localhost:5000";
          const dbRes = await axios.get(`${API_URL}/api/contracts/track/${id}`);
          if (dbRes.data && dbRes.data.proofs) {
            dbProofs = dbRes.data.proofs;
          }
        } catch (dbErr) {
          console.warn(
            "Không tải được hình ảnh minh chứng từ DB (Có thể hợp đồng chưa được đồng bộ).",
          );
        }

        setContractData({
          contractAddress: id,
          state: Number(data.state),
          client: data.client,
          provider: data.provider,
          receiver: data.receiver,
          amount: ethers.formatEther(data.amount),
          terms: data.terms,
          proofs: dbProofs, // Gắn mảng hình ảnh vào đây
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/tracking/${searchInput.trim()}`);
    }
  };

  // HÀM HIỂN THỊ THẺ MINH CHỨNG Ở CỘT PHẢI
  const renderProofCard = (stepKey, title, desc, stepIndex) => {
    const isCompleted = contractData.state >= stepIndex;
    const currentProof = contractData.proofs && contractData.proofs[stepKey];

    return (
      <div
        key={stepKey}
        className={`p-4 rounded-xl border transition-all ${isCompleted ? "bg-white border-gray-200 shadow-sm" : "bg-gray-50 border-gray-100 opacity-60"}`}
      >
        <h4 className="font-bold text-sm text-gray-800 mb-1">{title}</h4>
        <p className="text-xs text-gray-500 mb-3">{desc}</p>

        {currentProof ? (
          <a
            href={`https://dweb.link/ipfs/${currentProof}`}
            target="_blank"
            rel="noreferrer"
            className="block w-full py-2 bg-blue-50 text-blue-600 font-bold text-xs rounded-lg text-center border border-blue-100 hover:bg-blue-100 hover:shadow-sm transition-all"
          >
            <i className="uil uil-external-link-alt"></i> Xem chứng từ
          </a>
        ) : (
          <div className="w-full py-2 bg-gray-50 text-gray-400 font-bold text-xs rounded-lg text-center border border-gray-200">
            Chưa có chứng từ
          </div>
        )}
      </div>
    );
  };

  // 1. GIAO DIỆN KHI ĐANG LOADING
  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

  // 2. GIAO DIỆN LỖI
  if (error)
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      </div>
    );

  // 3. GIAO DIỆN TÌM KIẾM
  if (!id || !contractData)
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
            Vui lòng nhập mã hợp đồng (ID) để theo dõi tiến trình vận chuyển.
          </p>
          <form onSubmit={handleSearch} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Nhập mã hợp đồng (0x...)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-sm"
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

  // 4. GIAO DIỆN CHI TIẾT (CHIA 2 CỘT)
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header Info */}
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
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

      {/* BỐ CỤC 2 CỘT CHÍNH */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CỘT TRÁI: TIẾN ĐỘ THỰC HIỆN */}
        <div>
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
                    className={`relative flex items-center gap-4 sm:gap-6 group ${isCompleted ? "cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
                  >
                    <div
                      className={`relative z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-lg shadow-sm transition-all duration-300 ${isCompleted ? "bg-blue-600 text-white scale-110 group-hover:ring-4 ring-blue-100" : "bg-white border-2 border-gray-200 text-gray-300"}`}
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

        {/* CỘT PHẢI: HỒ SƠ MINH CHỨNG PHÁP LÝ */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i className="uil uil-file-shield-alt text-blue-600"></i> Hồ sơ &
            Minh chứng Pháp lý
          </h3>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {renderProofCard(
                "step0",
                "1. Khởi tạo hợp đồng",
                "Bản gốc có chữ ký/giáp lai",
                0,
              )}
              {renderProofCard(
                "step1",
                "2. Xác nhận nhận việc",
                "Lệnh điều động xe / xuất kho",
                1,
              )}
              {renderProofCard(
                "step2",
                "3. Đang vận chuyển",
                "Vận đơn / Hình ảnh bốc xếp",
                2,
              )}
              {renderProofCard(
                "step3",
                "4. Bàn giao hoàn thành",
                "Biên bản bàn giao kho đích",
                3,
              )}
              {renderProofCard(
                "step4",
                "5. Thanh toán",
                "Hóa đơn VAT / Ủy nhiệm chi",
                4,
              )}
            </div>
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
