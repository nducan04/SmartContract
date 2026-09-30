import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import axios from "axios";
import AddressDisplay from "../components/AddressDisplay";
import QRModal from "../components/QRModal";
import CheckpointMap from "../components/CheckpointMap";
import {
  Boxes,
  CheckCircle2,
  Truck,
  PackageCheck,
  Receipt,
  X,
  Clock,
  ExternalLink,
  Search,
  Copy,
  MapPin,
  Check,
  ChevronRight,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  FileCheck2,
  ClipboardList,
  Building2,
  UserCheck
} from "lucide-react";

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
          desc: "Hợp đồng được triển khai lên mạng Sepolia. Các điều khoản và tiền ký quỹ đã được khóa an toàn.",
          Icon: Boxes,
          color: "text-blue-500 bg-blue-500/10",
        };
      case 1:
        return {
          title: "Đơn vị vận chuyển xác nhận",
          actor: "Vận chuyển (Provider)",
          address: contractData.provider,
          desc: "Đơn vị vận chuyển đã đồng ý các điều khoản và cam kết thực hiện đơn hàng đúng cam kết.",
          Icon: CheckCircle2,
          color: "text-amber-500 bg-amber-500/10",
        };
      case 2:
        return {
          title: "Đang trong quá trình vận chuyển",
          actor: "Vận chuyển (Provider)",
          address: contractData.provider,
          desc: "Hàng hóa đang được vận chuyển tới địa chỉ người nhận theo lộ trình được định tuyến.",
          Icon: Truck,
          color: "text-indigo-500 bg-indigo-500/10",
        };
      case 3:
        return {
          title: "Giao hàng thành công",
          actor: "Vận chuyển (Provider)",
          address: contractData.provider,
          desc: "Đơn vị vận chuyển xác nhận đã giao hàng đến điểm đích thành công.",
          Icon: PackageCheck,
          color: "text-emerald-500 bg-emerald-500/10",
        };
      case 4:
        return {
          title: "Xác nhận & Thanh toán",
          actor: "Người nhận (Receiver)",
          address: contractData.receiver,
          desc: `Người nhận đã xác nhận hàng hóa. Smart Contract tự động giải ngân ${contractData.amount} ETH cho đơn vị vận chuyển.`,
          Icon: Receipt,
          color: "text-emerald-600 bg-emerald-600/10",
        };
      default:
        return {};
    }
  };

  const content = getStepContent();
  const IconComponent = content.Icon || Boxes;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200/80 dark:border-slate-800 transform transition-all animate-scale-in">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-5 flex justify-between items-center text-white">
          <div className="flex items-center gap-3 font-bold text-base sm:text-lg">
            <div className="p-2 bg-white/15 backdrop-blur-md rounded-xl">
              <IconComponent className="w-5 h-5 text-white" />
            </div>
            <span>{content.title}</span>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {content.actor}
            </p>
            <AddressDisplay address={content.address} />
          </div>
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Mô tả trên Blockchain
            </p>
            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              {content.desc}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span>Dữ liệu được xác thực bất biến trên Ethereum Sepolia</span>
          </div>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 text-center border-t border-slate-100 dark:border-slate-800">
          <a
            href={`https://sepolia.etherscan.io/address/${contractData.contractAddress}`}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 dark:text-blue-400 text-sm font-bold hover:underline inline-flex items-center justify-center gap-1.5"
          >
            <span>Xem trên Etherscan</span>
            <ExternalLink className="w-4 h-4" />
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
      <span className="text-slate-400 dark:text-slate-500 italic text-sm">
        Không có thông tin chi tiết
      </span>
    );

  try {
    const data = JSON.parse(terms);
    if (typeof data !== "object" || data === null)
      throw new Error("Not object");

    const partyA = {
      name: data.partyA_name,
      address: data.partyA_address,
      rep: data.partyA_rep,
    };

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
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 bg-slate-50/70 dark:bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800 max-h-[32rem] overflow-y-auto custom-scrollbar">
        {/* Card Bên A */}
        <div className="bg-white dark:bg-slate-900/90 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-4 h-4 text-blue-500" />
            <p className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              THÔNG TIN BÊN A (Giao)
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Tên đơn vị</p>
            <p className="text-sm text-slate-800 dark:text-slate-100 font-bold">
              {partyA.name || "---"}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Địa chỉ</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">{partyA.address || "---"}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Người đại diện</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">{partyA.rep || "---"}</p>
          </div>
        </div>

        {/* Card Bên B */}
        <div className="bg-white dark:bg-slate-900/90 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-1">
            <UserCheck className="w-4 h-4 text-indigo-500" />
            <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              THÔNG TIN BÊN B (Nhận/Vận chuyển)
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Tên đơn vị</p>
            <p className="text-sm text-slate-800 dark:text-slate-100 font-bold">
              {partyB.name || "---"}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Địa chỉ</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">{partyB.address || "---"}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Người đại diện</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">{partyB.rep || "---"}</p>
          </div>
        </div>

        {/* Các điều khoản quan trọng */}
        {Object.entries(articles).map(([key, item]) => {
          if (!item.value) return null;
          return (
            <div
              key={key}
              className="bg-white dark:bg-slate-900/90 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm md:col-span-2"
            >
              <div className="flex items-center gap-2 mb-2">
                <ClipboardList className="w-4 h-4 text-amber-500" />
                <p className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  {item.label}
                </p>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {item.value}
              </p>
            </div>
          );
        })}
      </div>
    );
  } catch (e) {
    return (
      <div className="text-sm text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 font-medium whitespace-pre-wrap max-h-80 overflow-y-auto custom-scrollbar">
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
  const [copied, setCopied] = useState(false);

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
            `${API_URL}/api/contracts/all?page=1&limit=20`
          );
          if (response.data && response.data.data) {
            setAllContracts(response.data.data);
          } else {
            setAllContracts(response.data || []);
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
          "https://ethereum-sepolia-rpc.publicnode.com"
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
            "Không tải được hình ảnh minh chứng từ DB (Có thể hợp đồng chưa được đồng bộ)."
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
          proofs: dbProofs,
          trackingHistory: dbTracking,
        });
      } catch (err) {
        console.error(err);
        setError(
          "Không thể tải dữ liệu. Mã hợp đồng không tồn tại hoặc lỗi mạng RPC."
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

  const handleCopy = () => {
    if (contractData?.contractAddress) {
      navigator.clipboard.writeText(contractData.contractAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // HÀM HIỂN THỊ THẺ MINH CHỨNG Ở CỘT PHẢI
  const renderProofCard = (stepKey, title, desc, stepIndex) => {
    const isCompleted = contractData.state >= stepIndex;
    const currentProof = contractData.proofs && contractData.proofs[stepKey];

    return (
      <div
        key={stepKey}
        className={`p-4 rounded-2xl border transition-all ${
          isCompleted
            ? "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md"
            : "bg-slate-50/50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/60 opacity-60"
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
            {title}
          </h4>
          {isCompleted && (
            <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Check className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{desc}</p>

        {currentProof ? (
          <a
            href={`https://ipfs.io/ipfs/${currentProof}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1.5 w-full py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs rounded-xl border border-blue-200/60 dark:border-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-500/20 hover:shadow-sm transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Xem chứng từ IPFS</span>
          </a>
        ) : (
          <div className="w-full py-2 bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 font-semibold text-xs rounded-xl text-center border border-slate-200/60 dark:border-slate-700/60">
            Chưa có chứng từ
          </div>
        )}
      </div>
    );
  };

  // 1. GIAO DIỆN KHI ĐANG LOADING
  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 gap-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-4 border-blue-500/20 border-t-blue-600 animate-spin"></div>
          <Boxes className="w-6 h-6 text-blue-600 absolute inset-0 m-auto" />
        </div>
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          Đang truy vấn dữ liệu từ Blockchain...
        </p>
      </div>
    );

  // 2. GIAO DIỆN LỖI
  if (error)
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-rose-200/80 dark:border-rose-900/40 max-w-md w-full text-center animate-fade-in-up">
          <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Tra cứu thất bại
          </h2>
          <p className="text-rose-500 dark:text-rose-400 mb-6 text-sm">{error}</p>
          <button
            onClick={() => navigate("/tracking")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl transition-all shadow-md shadow-blue-500/20 cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      </div>
    );

  // 3. GIAO DIỆN TÌM KIẾM
  if (!id || !contractData)
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center py-14 px-4 md:px-8">
        <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 max-w-xl w-full text-center mb-10 relative overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute top-0 right-1/4 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="w-16 h-16 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4 ring-8 ring-blue-500/5">
            <Search className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-2">
            Tra cứu hợp đồng
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm max-w-sm mx-auto">
            Nhập mã smart contract để kiểm tra tiến trình chuỗi cung ứng minh bạch trên Ethereum.
          </p>
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-2.5"
          >
            <input
              type="text"
              placeholder="Nhập địa chỉ hợp đồng (0x...)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm font-mono text-slate-800 dark:text-slate-100 transition-all min-w-0"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
            >
              <Search className="w-4 h-4" />
              <span>Tra cứu ngay</span>
            </button>
          </form>
        </div>

        {allContracts.length > 0 && (
          <div className="max-w-2xl w-full mx-auto">
            <div className="flex flex-col items-center">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-4 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Chưa có mã? Khám phá hợp đồng thực tế:
              </h3>
              <div className="flex flex-wrap justify-center gap-3">
                {allContracts.slice(0, 3).map((contract, index) => (
                  <button
                    key={contract.contractAddress}
                    onClick={() =>
                      navigate(`/tracking/${contract.contractAddress}`)
                    }
                    className="flex flex-col items-center bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/50 hover:shadow-lg hover:-translate-y-0.5 px-4 py-3 rounded-2xl transition-all duration-200 text-center cursor-pointer group"
                    type="button"
                  >
                    <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 mb-1">
                      Mẫu số #{index + 1}
                    </span>
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-mono group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {contract.contractAddress.substring(0, 8)}...
                      {contract.contractAddress.substring(
                        contract.contractAddress.length - 6
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
          onClose={() => setShowQRModal(false)}
          contractId={selectedContractAddress}
        />
      </div>
    );

  // 4. GIAO DIỆN CHI TIẾT
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 transition-colors">
      {/* Header Info */}
      <div className="max-w-6xl mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-5 sm:p-6 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
              <Boxes className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
                SupplyChain Track
              </h1>
              <p className="opacity-80 text-xs sm:text-sm mt-0.5">
                Xác thực minh bạch bất biến trên Blockchain
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/tracking")}
            className="bg-white/15 hover:bg-white/25 border border-white/20 p-2 sm:px-4 sm:py-2.5 rounded-2xl transition-all cursor-pointer w-full sm:w-auto flex justify-center items-center gap-2 text-sm font-bold backdrop-blur-md"
            title="Tra cứu mã khác"
          >
            <Search className="w-4 h-4" />
            <span>Tra cứu mã khác</span>
          </button>
        </div>

        <div className="p-6">
          {/* Row 1: The 3 Actors */}
          <div className="grid gap-4 md:grid-cols-3 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 hover:border-blue-500/40 transition-colors">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 flex items-center gap-1.5">
                <Boxes className="w-4 h-4 text-blue-500" />
                <span>Người gửi (Client)</span>
              </p>
              <AddressDisplay address={contractData.client} />
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 hover:border-amber-500/40 transition-colors">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-amber-500" />
                <span>Đơn vị Vận chuyển</span>
              </p>
              <AddressDisplay address={contractData.provider} />
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 hover:border-emerald-500/40 transition-colors">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <span>Người nhận (Receiver)</span>
              </p>
              <AddressDisplay address={contractData.receiver} />
            </div>
          </div>

          {/* Row 2: Info & Details */}
          <div className="grid gap-6 md:grid-cols-2 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800 items-center">
            <div className="flex flex-col min-w-0">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">
                Mã hợp đồng (Smart Contract)
              </p>
              <div className="flex items-center gap-2 min-w-0">
                <div className="font-mono text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-3.5 py-2.5 rounded-2xl truncate w-full border border-slate-200/80 dark:border-slate-700">
                  {contractData.contractAddress}
                </div>
                <button
                  onClick={handleCopy}
                  className="bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-500/10 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-700 transition-colors cursor-pointer shrink-0"
                  title="Copy mã hợp đồng"
                >
                  {copied ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col md:items-end mt-2 md:mt-0">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2 w-full md:text-right">
                Phí dịch vụ ký quỹ
              </p>
              <div className="flex items-baseline gap-1.5 bg-blue-50/80 dark:bg-blue-500/10 px-4 py-2 rounded-2xl border border-blue-200/60 dark:border-blue-500/20">
                <span className="text-2xl sm:text-3xl font-black text-blue-700 dark:text-blue-400 tracking-tight leading-none">
                  {contractData.amount}
                </span>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-300">
                  ETH
                </span>
              </div>
            </div>
          </div>

          {/* Row 3: Hàng hoá & Điều khoản */}
          <div className="flex flex-col">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">
              Thông tin hợp đồng & điều khoản
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
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-rose-500" />
              <span>Bản đồ Hành trình (Tracking)</span>
            </h3>
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-2 z-0 relative overflow-hidden">
              <CheckpointMap trackingHistory={contractData.trackingHistory} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Tiến độ thực hiện</span>
              </h3>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-3 py-1 rounded-full border border-blue-200/60 dark:border-blue-500/20">
                Bấm vào bước để xem chi tiết
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 relative">
              <div className="absolute left-10 sm:left-[52px] top-10 bottom-10 w-0.5 bg-slate-100 dark:bg-slate-800"></div>

              <div className="space-y-6 relative">
                {steps.map((step) => {
                  const isCompleted = contractData.state >= step.id;
                  const isCurrent =
                    contractData.state === step.id &&
                    step.id !== steps.length - 1;

                  return (
                    <div
                      key={step.id}
                      onClick={() => (isCompleted ? setSelectedStep(step) : null)}
                      className={`relative flex items-center gap-4 sm:gap-5 group ${
                        isCompleted ? "cursor-pointer" : "opacity-40 cursor-not-allowed"
                      }`}
                    >
                      <div
                        className={`relative z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-bold text-sm shadow-sm transition-all duration-300 ${
                          isCompleted
                            ? "bg-blue-600 text-white scale-105 group-hover:ring-4 ring-blue-500/20"
                            : "bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-400"
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <span>{step.id + 1}</span>
                        )}
                        {isCurrent && (
                          <span className="absolute -inset-1 rounded-2xl bg-blue-500 opacity-25 animate-ping"></span>
                        )}
                      </div>

                      <div className="flex-1 bg-slate-50/70 dark:bg-slate-800/40 p-3 sm:p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 transition-all duration-200 group-hover:border-blue-500/30 group-hover:bg-blue-50/50 dark:group-hover:bg-blue-500/10">
                        <h4
                          className={`font-bold text-sm sm:text-base ${
                            isCompleted
                              ? "text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                              : "text-slate-400 dark:text-slate-500"
                          }`}
                        >
                          {step.label}
                        </h4>
                        {isCurrent && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-0.5 flex items-center gap-1.5">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            Đang xử lý ở bước này
                          </p>
                        )}
                        {isCompleted && !isCurrent && (
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Đã hoàn thành</span>
                          </p>
                        )}
                      </div>

                      {isCompleted && (
                        <div className="text-slate-300 dark:text-slate-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                          <ChevronRight className="w-5 h-5" />
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
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-indigo-500" />
            <span>Hồ sơ & Minh chứng Pháp lý IPFS</span>
          </h3>
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {renderProofCard(
                "step0",
                "1. Khởi tạo hợp đồng",
                "Bản gốc điều khoản có chữ ký",
                0
              )}
              {renderProofCard(
                "step1",
                "2. Xác nhận nhận việc",
                "Lệnh điều động xe / xuất kho",
                1
              )}
              {renderProofCard(
                "step2",
                "3. Đang vận chuyển",
                "Vận đơn / Hình ảnh bốc xếp",
                2
              )}
              {renderProofCard(
                "step3",
                "4. Bàn giao hoàn thành",
                "Biên bản bàn giao kho đích",
                3
              )}
              {renderProofCard("step4", "5. Thanh toán", "Hóa đơn VAT hoàn tất", 4)}
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

      <div className="text-center mt-10 text-xs text-slate-400 dark:text-slate-500 font-bold tracking-wider uppercase">
        <p>XÁC THỰC BỞI ETHEREUM SEPOLIA TESTNET</p>
      </div>
    </div>
  );
};

export default TrackingPage;
