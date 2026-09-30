import React, { useState } from "react";
import { useWeb3 } from "../context/Web3Context";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import axios from "axios";
import { useLanguage } from "../context/LanguageContext";
import {
  FileText,
  Coins,
  Calendar,
  Building,
  Users,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Eye,
  Info
} from "lucide-react";

const CreateContractPage = () => {
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [penalty, setPenalty] = useState("");
  const [file, setFile] = useState(null);

  const [contractDetails, setContractDetails] = useState({
    partyA_name: "",
    partyA_address: "",
    partyA_mst: "",
    partyA_rep: "",
    partyB_name: "",
    partyB_address: "",
    partyB_mst: "",
    partyB_rep: "",
    art1_items: "",
    art2_packaging: "",
    art3_price: "",
    art4_delivery: "",
    art5_payment: "",
    art6_respA: "",
    art6_respB: "",
    art7_general:
      "Hai bên cam kết thực hiện nghiêm túc các điều khoản ghi trong hợp đồng này. Đối với những nội dung không quy định trong hợp đồng sẽ được thực hiện theo quy định hiện hành của pháp luật. Trong quá trình thực hiện hợp đồng nếu có phát sinh thì hai bên phải chủ động thông báo cho nhau bằng văn bản để bàn bạc giải quyết, trường hợp nếu không giải quyết được thì một trong hai bên có quyền đưa vụ việc ra toà án có thẩm quyền để giải quyết. Quyết định của toà buộc hai bên phải thực hiện mọi chi phí do bên có lỗi chịu",
  });

  const [activeTab, setActiveTab] = useState("form"); // 'form' | 'preview'
  const handleDetailChange = (e) => {
    setContractDetails({ ...contractDetails, [e.target.name]: e.target.value });
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const { factoryContract, signer, walletAddress, walletBalance } = useWeb3();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const uploadToIPFS = async () => {
    if (!file) {
      setError("Vui lòng chọn file hợp đồng gốc (PDF/Word).");
      return null;
    }
    setStatus("⏳ Đang tải file lên mạng phi tập trung IPFS (Pinata)...");
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(url, formData, {
        maxBodyLength: "Infinity",
        headers: {
          "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
          Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
        },
      });
      return response.data.IpfsHash;
    } catch (err) {
      console.error(err);
      setError("❌ Lỗi tải file lên IPFS.");
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("");

    if (!factoryContract || !signer) {
      setError("Vui lòng kết nối ví MetaMask.");
      return;
    }
    if (!ethers.isAddress(receiver)) {
      setError("Địa chỉ ví người nhận không hợp lệ.");
      return;
    }
    if (!amount || isNaN(amount)) {
      setError("Vui lòng nhập số tiền ký quỹ hợp lệ!");
      return;
    }

    const requiredAmount = parseFloat(amount) + 0.002;
    const currentBalance = parseFloat(walletBalance);

    if (currentBalance < requiredAmount) {
      setError(
        `Tài khoản không đủ! Bạn có ${currentBalance} ETH nhưng cần ít nhất ${requiredAmount.toFixed(4)} ETH (đã gồm phí Gas ước lượng).`,
      );
      return;
    }

    const amountNum = parseFloat(amount);
    const penaltyNum = parseFloat(penalty);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Số tiền ký quỹ phải lớn hơn 0.");
      return;
    }
    if (penaltyNum > amountNum) {
      setError("Tiền phạt không được lớn hơn ký quỹ.");
      return;
    }

    setLoading(true);

    const termsHash = await uploadToIPFS();
    if (!termsHash) {
      setLoading(false);
      return;
    }

    try {
      setStatus("✍ Đang tính toán phí Gas trên mạng Sepolia...");
      const amountInWei = ethers.parseEther(amount);
      const penaltyInWei = ethers.parseEther(penalty || "0");
      const deadlineTimestamp = Math.floor(new Date(deadline).getTime() / 1000);

      const packedTerms = JSON.stringify(contractDetails);

      let gasEstimate;
      try {
        gasEstimate = await factoryContract.createAgreement.estimateGas(
          receiver,
          packedTerms,
          termsHash,
          deadlineTimestamp,
          penaltyInWei,
          { value: amountInWei }
        );
      } catch (gasError) {
        console.error("Lỗi estimate gas:", gasError);
        if (gasError.message && gasError.message.includes("insufficient funds")) {
          throw new Error("Số dư của bạn không đủ để trả phí mạng lưới (Gas fee). Vui lòng nạp thêm Sepolia ETH!");
        }
        throw new Error("Không thể dự tính phí mạng lưới. Giao dịch có thể sẽ thất bại.");
      }

      setStatus("✍ Đang chờ MetaMask xác nhận ký quỹ...");
      const tx = await factoryContract.createAgreement(
        receiver,
        packedTerms,
        termsHash,
        deadlineTimestamp,
        penaltyInWei,
        {
          value: amountInWei,
          gasLimit: (gasEstimate * 12n) / 10n
        },
      );

      setStatus("🚀 Đang phát sóng lên Blockchain, vui lòng chờ...");
      await tx.wait();

      setStatus("✅ Tạo hợp đồng thành công! Đang chuyển hướng...");
      setTimeout(() => navigate("/dashboard/contracts"), 2000);
    } catch (err) {
      console.error(err);
      setError("❌ Giao dịch thất bại: " + (err.reason || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Khởi tạo Smart Contract
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t("createTitle")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Soạn thảo điều khoản & Ký quỹ an toàn với Smart Contract Escrow
          </p>
        </div>

        {/* View Toggle (Form / Preview) */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
          <button
            type="button"
            onClick={() => setActiveTab("form")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "form"
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            Soạn thảo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "preview"
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Xem trước</span>
          </button>
        </div>
      </div>

      {activeTab === "preview" ? (
        /* LIVE CONTRACT PREVIEW */
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl max-w-4xl mx-auto space-y-6">
          <div className="text-center pb-6 border-b border-slate-200/80 dark:border-slate-800">
            <h2 className="text-xl font-black uppercase text-slate-900 dark:text-white tracking-wider">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </h2>
            <p className="text-xs font-semibold text-slate-500 mt-1">Độc lập - Tự do - Hạnh phúc</p>
            <h3 className="text-lg font-extrabold text-blue-600 dark:text-blue-400 mt-4 uppercase">
              HỢP ĐỒNG MUA BÁN & VẬN CHUYỂN HÀNG HÓA
            </h3>
            <p className="text-xs text-slate-400 mt-1">(Bảo chứng qua Ethereum Smart Contract)</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700 dark:text-slate-300">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
              <span className="font-bold text-blue-600 block uppercase">Bên A (Bên bán / Ký quỹ)</span>
              <p><span className="font-semibold">Đơn vị:</span> {contractDetails.partyA_name || "---"}</p>
              <p><span className="font-semibold">Địa chỉ:</span> {contractDetails.partyA_address || "---"}</p>
              <p><span className="font-semibold">MST:</span> {contractDetails.partyA_mst || "---"}</p>
              <p><span className="font-semibold">Đại diện:</span> {contractDetails.partyA_rep || "---"}</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
              <span className="font-bold text-purple-600 block uppercase">Bên B (Bên mua / Nhận hàng)</span>
              <p><span className="font-semibold">Đơn vị:</span> {contractDetails.partyB_name || "---"}</p>
              <p><span className="font-semibold">Địa chỉ ví:</span> {receiver || "---"}</p>
              <p><span className="font-semibold">MST:</span> {contractDetails.partyB_mst || "---"}</p>
              <p><span className="font-semibold">Đại diện:</span> {contractDetails.partyB_rep || "---"}</p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
              <span className="font-bold text-slate-900 dark:text-white">Điều 1 (Hàng hóa):</span> {contractDetails.art1_items || "Chưa nhập"}
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
              <span className="font-bold text-slate-900 dark:text-white">Điều 2 (Đóng gói):</span> {contractDetails.art2_packaging || "Chưa nhập"}
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
              <span className="font-bold text-slate-900 dark:text-white">Điều 3 (Giá trị & Ký quỹ):</span> {amount ? `${amount} ETH` : "---"} (Phạt vi phạm: {penalty ? `${penalty} ETH` : "0 ETH"})
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
              <span className="font-bold text-slate-900 dark:text-white">Điều 4 (Giao nhận & Hạn chót):</span> {contractDetails.art4_delivery || "Chưa nhập"} - Hạn: {deadline || "---"}
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
              <span className="font-bold text-slate-900 dark:text-white">Điều 5 (Cam kết chung):</span> {contractDetails.art7_general}
            </div>
          </div>

          <div className="text-center pt-4">
            <button
              onClick={() => setActiveTab("form")}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-colors"
            >
              Quay lại chỉnh sửa biểu mẫu
            </button>
          </div>
        </div>
      ) : (
        /* MAIN FORM */
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION 1: BLOCKCHAIN & ESCROW */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Coins className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {t("createSec1")}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              <div className="lg:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                  {t("createReceiver")} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={receiver}
                  onChange={(e) => setReceiver(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                  {t("createDeposit")} (ETH) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 font-extrabold text-blue-600 dark:text-blue-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                  {t("createPenalty")} (ETH) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={penalty}
                  onChange={(e) => setPenalty(e.target.value)}
                  placeholder="0.0"
                  className="w-full px-4 py-2.5 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl outline-none focus:border-rose-500 text-rose-600 dark:text-rose-400 font-bold text-sm"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                  {t("createDeadline")} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200 text-sm"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                  {t("createOriginalFile")} (PDF/DOCX) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="file"
                  required
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs 
                  file:font-bold file:bg-blue-50 dark:file:bg-blue-950/50 file:text-blue-600 dark:file:text-blue-400 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: LEGAL PARTIES (BÊN A & BÊN B) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* BÊN A */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                <Building className="w-4 h-4 text-blue-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {t("createSec2")}
                </h2>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  name="partyA_name"
                  value={contractDetails.partyA_name}
                  onChange={handleDetailChange}
                  placeholder={t("createNamePlaceholder")}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200 text-sm"
                />
                <input
                  type="text"
                  name="partyA_address"
                  value={contractDetails.partyA_address}
                  onChange={handleDetailChange}
                  placeholder={t("createAddressPlaceholder")}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200 text-sm"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    name="partyA_mst"
                    value={contractDetails.partyA_mst}
                    onChange={handleDetailChange}
                    placeholder={t("createMstPlaceholder")}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200 text-sm"
                  />
                  <input
                    type="text"
                    name="partyA_rep"
                    value={contractDetails.partyA_rep}
                    onChange={handleDetailChange}
                    placeholder={t("createRepPlaceholder")}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* BÊN B */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                <Users className="w-4 h-4 text-purple-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {t("createSec3")}
                </h2>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  name="partyB_name"
                  value={contractDetails.partyB_name}
                  onChange={handleDetailChange}
                  placeholder={t("createNamePlaceholder")}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200 text-sm"
                />
                <input
                  type="text"
                  name="partyB_address"
                  value={contractDetails.partyB_address}
                  onChange={handleDetailChange}
                  placeholder={t("createAddressPlaceholder")}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200 text-sm"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    name="partyB_mst"
                    value={contractDetails.partyB_mst}
                    onChange={handleDetailChange}
                    placeholder={t("createMstPlaceholder")}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200 text-sm"
                  />
                  <input
                    type="text"
                    name="partyB_rep"
                    value={contractDetails.partyB_rep}
                    onChange={handleDetailChange}
                    placeholder={t("createRepPlaceholder")}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: ĐIỀU KHOẢN HỢP ĐỒNG */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <FileText className="w-4 h-4 text-emerald-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {t("createSec4")}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {t("createArt1")}
                </label>
                <textarea
                  name="art1_items"
                  rows="2"
                  value={contractDetails.art1_items}
                  onChange={handleDetailChange}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {t("createArt2")}
                </label>
                <textarea
                  name="art2_packaging"
                  rows="2"
                  value={contractDetails.art2_packaging}
                  onChange={handleDetailChange}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {t("createArt3")}
                </label>
                <textarea
                  name="art3_price"
                  rows="2"
                  value={contractDetails.art3_price}
                  onChange={handleDetailChange}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {t("createArt4")}
                </label>
                <textarea
                  name="art4_delivery"
                  rows="2"
                  value={contractDetails.art4_delivery}
                  onChange={handleDetailChange}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {t("createArt5")}
                </label>
                <textarea
                  name="art5_payment"
                  rows="2"
                  value={contractDetails.art5_payment}
                  onChange={handleDetailChange}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Trách nhiệm các bên
                </label>
                <textarea
                  name="art6_respA"
                  rows="2"
                  value={contractDetails.art6_respA}
                  onChange={handleDetailChange}
                  placeholder="Trách nhiệm bên A & Bên B..."
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200 text-sm"
                />
              </div>

              <div className="md:col-span-2 bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/40">
                <label className="block text-xs font-bold text-blue-700 dark:text-blue-400 uppercase mb-2">
                  {t("createArt7")}
                </label>
                <textarea
                  name="art7_general"
                  rows="4"
                  value={contractDetails.art7_general}
                  onChange={handleDetailChange}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-blue-200/60 dark:border-blue-800/60 rounded-xl outline-none focus:border-blue-500 text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* STATUS & ERRORS */}
          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-2xl text-xs sm:text-sm font-semibold border border-rose-200 dark:border-rose-900/50 flex items-center gap-2.5 animate-shake">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {status && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-2xl text-xs sm:text-sm font-semibold border border-blue-200 dark:border-blue-900/50 flex items-center gap-2.5">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
              <span>{status}</span>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-2xl text-white font-extrabold text-base shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] ${
                loading
                  ? "bg-slate-400 dark:bg-slate-700 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-blue-500/25 hover:shadow-blue-500/35"
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>{t("createProcessing")}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>{t("createSubmitBtn")}</span>
                  <ArrowRight className="w-4 h-4 ml-1 opacity-80" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreateContractPage;
