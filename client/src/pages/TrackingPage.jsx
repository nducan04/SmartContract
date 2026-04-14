import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import axios from "axios";
import AddressDisplay from "../components/AddressDisplay";
import ContractTable from "../components/contractList/ContractTable";
import QRModal from "../components/QRModal";
import CheckpointMap from "../components/CheckpointMap";

// --- COMPONENT MODAL CHI TIẾT BƯỚC ---
const StepDetailModal = ({ step, contractData, onClose }) => {
  if (!step) return null;

  const getStepContent = () => {
    switch (step.id) {
      case 0:
        return {
          title: "Khởi tạo hợp đồng",
          actor: "Người gửi (Client)",
          address: contractData.client,
          desc: "Hợp đồng được triển khai lên mạng Sepolia. Các điều khoản và tiền ký quỹ đã được khóa.",
          icon: "uil-cube",
        };
      case 1:
        return {
          title: "Đơn vị vận chuyển xác nhận",
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
              {content.actor}
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

// --- COMPONENT HIỂN THỊ CHI TIẾT HỢP ĐỒNG ---
const TermsDisplay = ({ terms }) => {
  if (!terms)
    return (
      <span className="text-gray-500 italic">Không có thông tin chi tiết</span>
    );

  try {
    const data = JSON.parse(terms);
    if (typeof data !== "object" || data === null)
      throw new Error("Not object");

    // Nhóm thông tin Bên A
    const partyA = {
      name: data.partyA_name,
      address: data.partyA_address,
      rep: data.partyA_rep,
    };

    // Nhóm thông tin Bên B
    const partyB = {
      name: data.partyB_name,
      address: data.partyB_address,
      rep: data.partyB_rep,
    };

    const articles = {
      art1_items: {
        label: "Chi tiết Hàng hóa / Dịch vụ",
        value: data.art1_items,
      },
      art3_price: {
        label: "Giá trị hợp đồng & Thanh toán",
        value: data.art3_price,
      },
      art4_delivery: {
        label: "Thời gian & Địa điểm giao nhận",
        value: data.art4_delivery,
      },
      art5_payment: {
        label: "Phương thức thanh toán",
        value: data.art5_payment,
      },
    };

    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 bg-orange-50/30 p-4 rounded-xl border border-orange-100 max-h-[32rem] overflow-y-auto custom-scrollbar">
        {/* Card Bên A */}
        <div className="bg-white p-4 rounded-xl border border-orange-100 shadow-sm flex flex-col gap-2">
          <p className="text-xs font-black text-orange-600 uppercase tracking-wider mb-1">
            THÔNG TIN BÊN A
          </p>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">
              Tên đơn vị
            </p>
            <p className="text-sm text-gray-800 font-bold">
              {partyA.name || "---"}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">
              Địa chỉ
            </p>
            <p className="text-sm text-gray-700">{partyA.address || "---"}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">
              Người đại diện
            </p>
            <p className="text-sm text-gray-700">{partyA.rep || "---"}</p>
          </div>
        </div>

        {/* Card Bên B */}
        <div className="bg-white p-4 rounded-xl border border-orange-100 shadow-sm flex flex-col gap-2">
          <p className="text-xs font-black text-orange-600 uppercase tracking-wider mb-1">
            THÔNG TIN BÊN B
          </p>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">
              Tên đơn vị
            </p>
            <p className="text-sm text-gray-800 font-bold">
              {partyB.name || "---"}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">
              Địa chỉ
            </p>
            <p className="text-sm text-gray-700">{partyB.address || "---"}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">
              Người đại diện
            </p>
            <p className="text-sm text-gray-700">{partyB.rep || "---"}</p>
          </div>
        </div>

        {/* Các điều khoản quan trọng */}
        {Object.entries(articles).map(([key, item]) => {
          if (!item.value) return null;
          return (
            <div
              key={key}
              className="bg-white p-4 rounded-xl border border-orange-100 shadow-sm md:col-span-2"
            >
              <p className="text-xs font-black text-orange-600 uppercase tracking-wider mb-2">
                {item.label}
              </p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {item.value}
              </p>
            </div>
          );
        })}
      </div>
    );
  } catch (e) {
    return (
      <div className="text-sm text-gray-800 bg-orange-50 p-4 rounded-xl border border-orange-100 font-medium whitespace-pre-wrap max-h-80 overflow-y-auto custom-scrollbar">
        {terms}
      </div>
    );
  }
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

  // Mới: State hiển thị danh sách khi chưa nhập mã
  const [allContracts, setAllContracts] = useState([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedContractAddress, setSelectedContractAddress] = useState(null);

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

      const fetchAll = async () => {
        setLoadingAll(true);
        try {
          const API_URL =
            import.meta.env.VITE_API_URL || "http://localhost:5000";
          const response = await axios.get(
            `${API_URL}/api/contracts/all?page=1&limit=20`,
          );
          if (response.data && response.data.data) {
            setAllContracts(response.data.data);
          } else {
            setAllContracts(response.data);
          }
        } catch (error) {
          console.error("Lỗi lấy danh sách:", error);
        } finally {
          setLoadingAll(false);
        }
      };
      fetchAll();

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
        let dbTracking = [];
        try {
          const API_URL =
            import.meta.env.VITE_API_URL || "http://localhost:5000";
          const dbRes = await axios.get(`${API_URL}/api/contracts/track/${id}`);
          if (dbRes.data && dbRes.data.proofs) {
            dbProofs = dbRes.data.proofs;
          }
          if (dbRes.data && dbRes.data.trackingHistory) {
            dbTracking = dbRes.data.trackingHistory;
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
          trackingHistory: dbTracking,
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

  const handleShowQR = (address) => {
    setSelectedContractAddress(address);
    setShowQRModal(true);
  };

  const handleCloseQR = () => {
    setShowQRModal(false);
    setSelectedContractAddress(null);
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
            href={`https://ipfs.io/ipfs/${currentProof}`}
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
      <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4 md:px-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-xl w-full text-center mb-10">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
            <i className="uil uil-search-alt"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Tra cứu hợp đồng
          </h2>
          <p className="text-gray-500 mb-6 text-sm">
            Nhập mã hợp đồng để theo dõi tiến trình vận chuyển.
          </p>
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              type="text"
              placeholder="Nhập mã hợp đồng (0x...)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-sm min-w-0"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
            >
              <i className="uil uil-search"></i> Tra cứu ngay
            </button>
          </form>
        </div>

        {allContracts.length > 0 && (
          <div className="max-w-2xl w-full mx-auto mt-4">
            <div className="flex flex-col items-center">
              <h3 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">
                Chưa có mã? Thử trải nghiệm các dữ liệu mẫu sau:
              </h3>
              <div className="flex flex-wrap justify-center gap-3">
                {allContracts.slice(0, 3).map((contract, index) => (
                  <button
                    key={contract.contractAddress}
                    onClick={() =>
                      navigate(`/tracking/${contract.contractAddress}`)
                    }
                    className="flex flex-col items-center bg-white border border-gray-200 hover:border-blue-400 hover:shadow-md hover:-translate-y-1 px-4 py-3 rounded-xl transition-all duration-200 text-center cursor-pointer group"
                    type="button"
                  >
                    <span className="text-xs font-bold text-blue-600 mb-1">
                      Mẫu số {index + 1}
                    </span>
                    <span className="text-sm text-gray-700 font-mono group-hover:text-blue-700">
                      {contract.contractAddress.substring(0, 6)}...
                      {contract.contractAddress.substring(
                        contract.contractAddress.length - 4,
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <QRModal
          show={showQRModal}
          onClose={handleCloseQR}
          contractId={selectedContractAddress}
        />
      </div>
    );

  // 4. GIAO DIỆN CHI TIẾT (CHIA 2 CỘT)
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header Info */}
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="bg-blue-600 p-4 sm:p-6 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <i className="uil uil-cube"></i> SupplyChain Track
            </h1>
            <p className="opacity-80 text-xs sm:text-sm mt-1">
              Theo dõi minh bạch trên Blockchain
            </p>
          </div>
          <button
            onClick={() => navigate("/tracking")}
            className="bg-blue-700 hover:bg-blue-800 p-2 sm:px-4 sm:py-2 rounded-lg transition-colors cursor-pointer w-full sm:w-auto flex justify-center items-center gap-2 text-sm font-bold"
            title="Tra cứu mã khác"
          >
            <i className="uil uil-search text-xl sm:text-lg"></i>
            <span className="sm:hidden">Tra cứu mã khác</span>
          </button>
        </div>
        <div className="p-6">
          {/* Row 1: The 3 Actors */}
          <div className="grid gap-4 md:grid-cols-3 mb-6 pb-6 border-b border-gray-100">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors">
              <p className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1">
                <i className="uil uil-box text-blue-500 text-lg"></i> Người gửi
              </p>
              <AddressDisplay address={contractData.client} />
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 hover:border-orange-200 transition-colors">
              <p className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1">
                <i className="uil uil-truck border-orange-500 text-orange-500 text-lg"></i>{" "}
                Đơn vị Vận chuyển
              </p>
              <AddressDisplay address={contractData.provider} />
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 hover:border-green-200 transition-colors">
              <p className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1">
                <i className="uil uil-map-marker text-green-500 text-lg"></i>{" "}
                Người nhận
              </p>
              <AddressDisplay address={contractData.receiver} />
            </div>
          </div>

          {/* Row 2: Info & Details */}
          <div className="grid gap-6 md:grid-cols-2 mb-6 pb-6 border-b border-gray-100">
            <div className="flex flex-col min-w-0">
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">
                Mã hợp đồng (Smart Contract)
              </p>
              <div className="flex items-center gap-2 min-w-0">
                <div className="font-mono text-sm font-bold text-gray-700 bg-gray-100 px-3 py-2 rounded-xl truncate w-full border border-gray-200">
                  {contractData.contractAddress}
                </div>
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(contractData.contractAddress)
                  }
                  className="bg-gray-100 hover:bg-blue-100 text-gray-500 hover:text-blue-600 p-2 rounded-xl border border-gray-200 transition-colors cursor-pointer shrink-0"
                  title="Copy mã hợp đồng"
                >
                  <i className="uil uil-copy text-lg"></i>
                </button>
              </div>
            </div>

            <div className="flex flex-col md:items-end mt-4 md:mt-0">
              <p className="text-xs font-bold text-gray-400 uppercase mb-2 w-full md:text-right">
                Phí dịch vụ
              </p>
              <div className="flex items-end gap-1.5 bg-blue-50/50 w-fit px-4 py-1.5 rounded-xl border border-blue-100">
                <span className="text-2xl font-black text-blue-800 leading-none">
                  {contractData.amount}
                </span>
                <span className="text-sm font-bold text-blue-600 mb-0.5">
                  ETH
                </span>
              </div>
            </div>
          </div>

          {/* Row 3: Hàng hoá & Điều khoản */}
          <div className="flex flex-col">
            <p className="text-xs font-bold text-gray-400 uppercase mb-2">
              Thông tin hợp đồng & hàng hóa
            </p>
            <TermsDisplay terms={contractData.terms} />
          </div>
        </div>
      </div>

      {/* BỐ CỤC 2 CỘT CHÍNH */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CỘT TRÁI: TIẾN ĐỘ THỰC HIỆN VÀ BẢN ĐỒ */}
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <i className="uil uil-map-marker-alt text-red-500"></i> Bản đồ Hành trình (Tracking)
            </h3>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-2 z-0 relative">
              <CheckpointMap trackingHistory={contractData.trackingHistory} />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              Tiến độ thực hiện
              <span className="text-xs font-normal text-blue-500 bg-blue-50 px-2 py-1 rounded-full">
                (Bấm vào từng bước để xem chi tiết)
              </span>
            </h3>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-10 relative">
            <div className="absolute left-10 sm:left-[60px] top-10 bottom-10 w-0.5 bg-gray-100"></div>

            <div className="space-y-8 relative">
              {steps.map((step) => {
                const isCompleted = contractData.state >= step.id;
                const isCurrent =
                  contractData.state === step.id &&
                  step.id !== steps.length - 1;

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
        </div>

        {/* CỘT PHẢI: HỒ SƠ MINH CHỨNG PHÁP LÝ */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            Hồ sơ & Minh chứng Pháp lý
          </h3>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {renderProofCard(
                "step0",
                "1. Khởi tạo hợp đồng",
                "Bản gốc có chữ ký",
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
              {renderProofCard("step4", "5. Thanh toán", "Hóa đơn VAT", 4)}
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

      <div className="text-center mt-8 text-xs text-gray-800 font-bold">
        <p>XÁC THỰC BỞI ETHEREUM SEPOLIA TESTNET</p>
      </div>
    </div>
  );
};

export default TrackingPage;
