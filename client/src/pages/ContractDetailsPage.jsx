import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import { ethers } from "ethers";
import { toast } from "react-hot-toast";
import axios from "axios";
import Swal from "sweetalert2";
import { agreementABI } from "../constants";
import CheckpointMap from "../components/CheckpointMap";
import { useLanguage } from "../context/LanguageContext";
import {
  Printer,
  MapPin,
  Clock,
  Trash2,
  Navigation,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Search,
  UploadCloud,
  ShieldCheck,
  ExternalLink,
  Coins,
  Building,
  UserCheck,
  Sparkles
} from "lucide-react";

const CHECKPOINT_PRESETS = [
  { name: "Cảng Hải Phòng", lat: 20.8651, lng: 106.6838 },
  { name: "Sân bay Nội Bài, Hà Nội", lat: 21.2187, lng: 105.8042 },
  { name: "Tạm dừng dọc QL1A, Thanh Hóa", lat: 19.8078, lng: 105.7766 },
  { name: "Kho trung chuyển Đà Nẵng", lat: 16.0544, lng: 108.2022 },
  { name: "Trạm thu phí Đèo Cù Mông, Bình Định", lat: 13.6844, lng: 109.1866 },
  { name: "Kho Cát Lái, TP. HCM", lat: 10.7626, lng: 106.6601 },
  { name: "Cảng Cần Thơ", lat: 10.0452, lng: 105.7469 },
];

const ContractDetailsPage = () => {
  const { id } = useParams();
  const { walletAddress, getAgreementContract } = useWeb3();
  const { t } = useLanguage();

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [proofFiles, setProofFiles] = useState({});
  const [selectedCheckpoint, setSelectedCheckpoint] = useState("");
  const [trackingNote, setTrackingNote] = useState("");
  const [manualLatLng, setManualLatLng] = useState(null);
  const [customLocationName, setCustomLocationName] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const stateLabels = [
    t("listFilterStatus0"),
    t("listFilterStatus1"),
    t("listFilterStatus2"),
    t("listFilterStatus3"),
    t("listFilterStatus4"),
    t("listFilterStatus5"),
  ];

  const stateColors = [
    "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700",
    "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60",
    "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60",
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60",
    "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60",
    "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60",
  ];

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(Number(timestamp) * 1000).toLocaleString("vi-VN");
  };

  const parseTerms = (termsString) => {
    try {
      const parsed = JSON.parse(termsString);
      if (parsed && typeof parsed === "object" && "partyA_name" in parsed) {
        return parsed;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const syncToBackend = async (newStatus, providerAddr = null) => {
    try {
      const payload = { contractAddress: id, status: newStatus };
      if (providerAddr) payload.provider = providerAddr;
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      await axios.put(`${API_URL}/api/contracts/update-status`, payload);
    } catch (error) {
      console.error("❌ Lỗi đồng bộ:", error);
    }
  };

  const fetchDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);

      let contractToRead = getAgreementContract
        ? getAgreementContract(id)
        : null;
      if (!contractToRead) {
        const publicProvider = new ethers.JsonRpcProvider(
          "https://ethereum-sepolia-rpc.publicnode.com",
        );
        contractToRead = new ethers.Contract(id, agreementABI, publicProvider);
      }

      const data = await contractToRead.getAgreementDetails();
      const currentBlock = await contractToRead.runner.provider.getBlock(
        "latest",
      );
      const currentTime = currentBlock.timestamp;
      const isLate =
        Number(data[0]) === 3 && currentTime > Number(data[4]);

      const contractInfo = {
        state: Number(data[0]),
        client: data[1],
        provider: data[2],
        receiver: data[3],
        amount: ethers.formatEther(data[4]),
        penalty: ethers.formatEther(data[5]),
        deadline: data[6],
        termsHash: data[7],
        terms: data[8],
        isLate,
      };

      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      try {
        const backendRes = await axios.get(`${API_URL}/api/contracts/${id}`);
        if (backendRes.data) {
          contractInfo.trackingHistory = backendRes.data.trackingHistory || [];
          contractInfo.proofs = backendRes.data.proofs || {};
          contractInfo.createdAt = backendRes.data.createdAt;
        }
      } catch (err) {
        console.warn("Chưa lấy được tracking DB:", err);
      }

      setDetails(contractInfo);
    } catch (error) {
      console.error("Lỗi tải chi tiết:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id, walletAddress]);

  const handleDownloadPDF = () => {
    const element = document.getElementById("printable-contract");
    if (!element) return;
    const opt = {
      margin: 10,
      filename: `HopDong_${id.slice(-6)}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };
    if (window.html2pdf) {
      window.html2pdf().set(opt).from(element).save();
    } else {
      window.print();
    }
  };

  const handleMapClick = (latlng) => {
    setManualLatLng(latlng);
    setSelectedCheckpoint("");
    setCustomLocationName(
      `Điểm ghim [${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}]`,
    );
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Trình duyệt không hỗ trợ định vị GPS!");
      return;
    }
    setActionLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setManualLatLng({ lat, lng });
        setSelectedCheckpoint("");
        setCustomLocationName(`Vị trí GPS [${lat.toFixed(4)}, ${lng.toFixed(4)}]`);
        setActionLoading(false);
        toast.success("Đã lấy vị trí GPS thành công!");
      },
      (err) => {
        console.error(err);
        toast.error("Không thể lấy vị trí: " + err.message);
        setActionLoading(false);
      },
    );
  };

  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      // Ưu tiên Photon API (nhanh, hỗ trợ tiếng Việt, không bị chặn bởi ISP)
      let found = false;
      try {
        const photonRes = await axios.get(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&limit=1`,
        );
        if (photonRes.data?.features?.length > 0) {
          const first = photonRes.data.features[0];
          const [lng, lat] = first.geometry.coordinates;
          const name = first.properties.name || first.properties.city || searchQuery;
          setManualLatLng({ lat, lng });
          setSelectedCheckpoint("");
          setCustomLocationName(name);
          toast.success(`Tìm thấy: ${name}`);
          found = true;
          return;
        }
      } catch (err) {
        console.warn("Photon search fallback:", err);
      }

      // Fallback Nominatim
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`,
      );
      if (res.data && res.data.length > 0) {
        const first = res.data[0];
        const lat = parseFloat(first.lat);
        const lng = parseFloat(first.lon);
        setManualLatLng({ lat, lng });
        setSelectedCheckpoint("");
        setCustomLocationName(first.display_name.split(",")[0]);
        toast.success(`Tìm thấy: ${first.display_name.split(",")[0]}`);
      } else if (!found) {
        toast.error("Không tìm thấy địa điểm này!");
      }
    } catch (e) {
      toast.error("Lỗi khi tìm kiếm địa chỉ!");
    } finally {
      setIsSearching(false);
    }
  };

  const handleDeleteCheckpoint = async (index) => {
    Swal.fire({
      title: "Xác nhận xóa?",
      text: "Bạn có chắc chắn muốn xóa điểm dừng này khỏi lịch trình?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
          await axios.delete(`${API_URL}/api/contracts/${id}/checkpoint/${index}`);
          toast.success("Đã xóa trạm dừng!");
          fetchDetails();
        } catch (e) {
          toast.error("Lỗi khi xóa!");
        }
      }
    });
  };

  const handleAddCheckpoint = async () => {
    let finalLat, finalLng, finalName;
    if (manualLatLng) {
      finalLat = manualLatLng.lat;
      finalLng = manualLatLng.lng;
      finalName = customLocationName;
    } else if (selectedCheckpoint !== "") {
      const preset = CHECKPOINT_PRESETS[selectedCheckpoint];
      finalLat = preset.lat;
      finalLng = preset.lng;
      finalName = preset.name;
    } else {
      toast.error("Vui lòng chọn trạm điểm từ danh sách hoặc click trên bản đồ!");
      return;
    }

    if (!trackingNote.trim()) {
      toast.error("Vui lòng nhập ghi chú hành trình!");
      return;
    }

    const payloadInfo = `${finalName} - Ghi chú: ${trackingNote}`;

    setActionLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      await axios.put(`${API_URL}/api/contracts/update-tracking`, {
        contractAddress: id,
        lat: finalLat,
        lng: finalLng,
        locationName: payloadInfo,
        note: trackingNote,
      });
      toast.success("Cập nhật vị trí thành công!");

      setSelectedCheckpoint("");
      setTrackingNote("");
      setManualLatLng(null);
      setCustomLocationName("");
      fetchDetails();
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi cập nhật vị trí!");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUploadProof = async (stepKey) => {
    const file = proofFiles[stepKey];
    if (!file) {
      toast.error("Vui lòng chọn file minh chứng!");
      return;
    }
    setActionLoading(true);
    try {
      const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post(url, formData, {
        maxBodyLength: "Infinity",
        headers: {
          "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
          Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
        },
      });
      const ipfsHash = res.data.IpfsHash;

      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      await axios.put(`${API_URL}/api/contracts/upload-proof`, {
        contractAddress: id,
        step: stepKey,
        ipfsHash: ipfsHash,
      });

      toast.success("Tải minh chứng lên IPFS thành công!");
      setProofFiles((prev) => ({ ...prev, [stepKey]: null }));
      fetchDetails();
    } catch (err) {
      console.error(err);
      toast.error("Lỗi tải minh chứng lên hệ thống!");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAccept = async () => {
    try {
      setActionLoading(true);
      const contract = getAgreementContract(id);
      const gasEstimate = await contract.acceptAgreement.estimateGas();
      const tx = await contract.acceptAgreement({
        gasLimit: (gasEstimate * 12n) / 10n,
      });
      await tx.wait();
      await syncToBackend(1, walletAddress);
      toast.success("Đã chấp nhận hợp đồng thành công!");
      fetchDetails();
    } catch (error) {
      toast.error("Lỗi: " + (error.reason || error.message || "Giao dịch thất bại"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatusText) => {
    try {
      setActionLoading(true);
      const contract = getAgreementContract(id);
      let tx;
      let statusNumber;

      if (newStatusText === "InProgress") {
        const gasEstimate = await contract.updateStatusInProgress.estimateGas();
        tx = await contract.updateStatusInProgress({
          gasLimit: (gasEstimate * 12n) / 10n,
        });
        statusNumber = 2;
      }
      if (newStatusText === "Completed") {
        const gasEstimate = await contract.updateStatusCompleted.estimateGas();
        tx = await contract.updateStatusCompleted({
          gasLimit: (gasEstimate * 12n) / 10n,
        });
        statusNumber = 3;
      }
      await tx.wait();
      await syncToBackend(statusNumber);
      Swal.fire({
        title: "Thành công!",
        text: "Đã cập nhật trạng thái hợp đồng thành công.",
        icon: "success",
        confirmButtonColor: "#3085d6",
      });
      fetchDetails();
    } catch (error) {
      Swal.fire({
        title: "Giao dịch thất bại",
        text: "Lỗi: " + (error.reason || error.message || "Không xác định"),
        icon: "error",
        confirmButtonColor: "#d33",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirm = async () => {
    try {
      setActionLoading(true);
      const contract = getAgreementContract(id);
      const gasEstimate = await contract.confirmAgreement.estimateGas();
      const tx = await contract.confirmAgreement({
        gasLimit: (gasEstimate * 12n) / 10n,
      });
      await tx.wait();
      await syncToBackend(4);
      Swal.fire({
        title: "Hoàn tất hợp đồng!",
        text: "Hệ thống đã tự động giải ngân cho người vận chuyển.",
        icon: "success",
        confirmButtonColor: "#3085d6",
      });
      fetchDetails();
    } catch (error) {
      toast.error("Lỗi: " + (error.reason || error.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    Swal.fire({
      title: "Hủy hợp đồng?",
      text: "Bạn có chắc chắn muốn hủy hợp đồng và rút lại số tiền ký quỹ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Đồng ý hủy",
      cancelButtonText: "Quay lại",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setActionLoading(true);
          const contract = getAgreementContract(id);
          const gasEstimate = await contract.cancelAgreement.estimateGas();
          const tx = await contract.cancelAgreement({
            gasLimit: (gasEstimate * 12n) / 10n,
          });
          await tx.wait();
          await syncToBackend(5);
          Swal.fire("Đã hủy!", "Hợp đồng đã được hủy thành công.", "success");
          fetchDetails();
        } catch (error) {
          toast.error("Lỗi: " + (error.reason || error.message));
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  const renderProofBox = (stepKey, stepTitle, documentName, allowedAddress) => {
    const isOwnerOfStep =
      walletAddress &&
      allowedAddress &&
      walletAddress.toLowerCase() === allowedAddress.toLowerCase();
    const existingProof = details?.proofs?.[stepKey];

    return (
      <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between">
        <div>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block uppercase mb-1">
            {stepTitle}
          </span>
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {documentName}
          </p>
        </div>

        <div className="mt-3">
          {existingProof ? (
            <a
              href={`https://ipfs.io/ipfs/${existingProof}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60 hover:underline"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Xem minh chứng IPFS</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>
          ) : isOwnerOfStep ? (
            <div className="space-y-2 mt-2">
              <input
                type="file"
                onChange={(e) =>
                  setProofFiles({ ...proofFiles, [stepKey]: e.target.files[0] })
                }
                className="block w-full text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-blue-50 dark:file:bg-blue-950/50 file:text-blue-600 dark:file:text-blue-400 hover:file:bg-blue-100 cursor-pointer"
              />
              <button
                onClick={() => handleUploadProof(stepKey)}
                disabled={actionLoading || !proofFiles[stepKey]}
                className="w-full inline-flex items-center justify-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer shadow-xs active:scale-95"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Tải minh chứng lên IPFS</span>
              </button>
            </div>
          ) : (
            <div className="py-2 px-3 bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-medium rounded-xl text-center">
              Chưa có chứng từ
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent"></div>
        <p className="text-xs font-semibold text-slate-400">Đang đọc trạng thái từ Blockchain...</p>
      </div>
    );

  if (!details)
    return (
      <div className="py-20 text-center text-rose-500 font-bold bg-white dark:bg-slate-900 rounded-3xl border border-rose-200">
        Không tìm thấy hợp đồng trên mạng lưới!
      </div>
    );

  const currentWallet = walletAddress?.toLowerCase();
  const isProvider =
    currentWallet === details.provider?.toLowerCase() ||
    (details.state === 0 && currentWallet !== details.client?.toLowerCase());
  const isReceiver = currentWallet === details.receiver?.toLowerCase();
  const isOverdue =
    Date.now() / 1000 > Number(details.deadline) && details.state < 4;

  const parsedTerms = parseTerms(details.terms);

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in pb-16 print:p-0 print:m-0 print:max-w-none">
      {/* Top Header Bar */}
      <div className="flex flex-wrap justify-between items-center print:hidden gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <span
            className={`px-3.5 py-1.5 rounded-full font-bold text-xs ${stateColors[details.state]}`}
          >
            {stateLabels[details.state]}
          </span>
          {details.isLate && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-900/40">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Trễ hạn cam kết</span>
            </span>
          )}
        </div>

        <button
          onClick={handleDownloadPDF}
          className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-xs cursor-pointer active:scale-95"
        >
          <Printer className="w-4 h-4 text-blue-500" />
          <span>{t("detailPrint")}</span>
        </button>
      </div>

      {/* VÙNG IN PDF - NỘI DUNG HỢP ĐỒNG */}
      <div
        id="printable-contract"
        className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800 print:shadow-none print:border-none print:p-0 text-slate-800 dark:text-slate-200"
      >
        <div className="text-center mb-8">
          {parsedTerms ? (
            <>
              <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                {t("detailRepublic")}
              </h2>
              <p className="font-bold underline text-sm mt-1 text-slate-600 dark:text-slate-400">
                {t("detailMotto")}
              </p>
              <h1 className="text-2xl sm:text-3xl font-black mt-8 mb-2 uppercase gradient-text">
                {t("detailContractTitle")}
              </h1>
              <p className="font-mono text-xs text-slate-400 break-all">
                {t("detailId")} {id}
              </p>
            </>
          ) : (
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-slate-900 dark:text-white">
                Chứng Nhận Hợp Đồng Blockchain
              </h2>
              <p className="font-mono text-xs text-slate-400 mt-2">{t("detailId")} {id}</p>
            </div>
          )}
        </div>

        {parsedTerms ? (
          <div className="space-y-6 text-sm">
            <p className="italic text-slate-600 dark:text-slate-400">
              {t("detailToday")} {formatDate(details.createdAt || Date.now() / 1000)}
              {t("detailWeInclude")}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              <div>
                <h3 className="font-bold text-sm uppercase mb-3 text-blue-600 dark:text-blue-400 border-b border-slate-200 dark:border-slate-700 pb-1.5 flex items-center gap-1.5">
                  <Building className="w-4 h-4" />
                  <span>{t("detailPartyA")}</span>
                </h3>
                <ul className="space-y-1.5 text-xs">
                  <li><strong>{t("detailName")}:</strong> {parsedTerms.partyA_name || "---"}</li>
                  <li><strong>{t("detailAddress")}:</strong> {parsedTerms.partyA_address || "---"}</li>
                  <li><strong>{t("detailTax")}:</strong> {parsedTerms.partyA_mst || "---"}</li>
                  <li><strong>{t("detailRep")}:</strong> {parsedTerms.partyA_rep || "---"}</li>
                  <li className="break-all pt-2 border-t border-dashed border-slate-200 dark:border-slate-700">
                    <strong>{t("detailWallet")}:</strong>
                    <br />
                    <span className="font-mono text-[11px] text-slate-500">{details.client}</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-sm uppercase mb-3 text-purple-600 dark:text-purple-400 border-b border-slate-200 dark:border-slate-700 pb-1.5 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" />
                  <span>{t("detailPartyB")}</span>
                </h3>
                <ul className="space-y-1.5 text-xs">
                  <li><strong>{t("detailName")}:</strong> {parsedTerms.partyB_name || "---"}</li>
                  <li><strong>{t("detailAddress")}:</strong> {parsedTerms.partyB_address || "---"}</li>
                  <li><strong>{t("detailTax")}:</strong> {parsedTerms.partyB_mst || "---"}</li>
                  <li><strong>{t("detailRep")}:</strong> {parsedTerms.partyB_rep || "---"}</li>
                  <li className="break-all pt-2 border-t border-dashed border-slate-200 dark:border-slate-700">
                    <strong>{t("detailWallet")}:</strong>
                    <br />
                    <span className="font-mono text-[11px] text-slate-500">{details.receiver}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-4 leading-relaxed text-xs sm:text-sm">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                <h4 className="font-bold text-slate-900 dark:text-white">Điều 1: Tên hàng, số lượng, chất lượng</h4>
                <p className="mt-1 whitespace-pre-wrap text-slate-700 dark:text-slate-300">{parsedTerms.art1_items}</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                <h4 className="font-bold text-slate-900 dark:text-white">Điều 2: Quy cách đóng gói</h4>
                <p className="mt-1 whitespace-pre-wrap text-slate-700 dark:text-slate-300">{parsedTerms.art2_packaging}</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                <h4 className="font-bold text-slate-900 dark:text-white">Điều 3: Giá cả hàng hóa</h4>
                <p className="mt-1 whitespace-pre-wrap text-slate-700 dark:text-slate-300">{parsedTerms.art3_price}</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                <h4 className="font-bold text-slate-900 dark:text-white">Điều 4: Thời gian và Địa điểm giao hàng</h4>
                <p className="mt-1 whitespace-pre-wrap text-slate-700 dark:text-slate-300">{parsedTerms.art4_delivery}</p>
                <div className="mt-2 text-rose-600 dark:text-rose-400 font-semibold text-xs bg-rose-50 dark:bg-rose-950/30 px-3 py-1.5 rounded-lg inline-block border border-rose-200 dark:border-rose-900/40">
                  Hạn chót cam kết trên Blockchain: {formatDate(details.deadline)}
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                <h4 className="font-bold text-slate-900 dark:text-white">Điều 5: Phương thức thanh toán & Escrow</h4>
                <p className="mt-1 whitespace-pre-wrap text-slate-700 dark:text-slate-300">{parsedTerms.art5_payment}</p>
                <div className="mt-3 flex flex-wrap gap-4 text-xs font-bold">
                  <span className="text-blue-600 dark:text-blue-400">
                    Ký quỹ Escrow: {details.amount} ETH
                  </span>
                  <span className="text-rose-600 dark:text-rose-400">
                    Phạt trễ hạn: {details.penalty} ETH
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                <h4 className="font-bold text-slate-900 dark:text-white">Điều 6: Trách nhiệm mỗi bên</h4>
                <p className="mt-1 font-semibold">1. Trách nhiệm Bên A:</p>
                <p className="whitespace-pre-wrap mb-2 text-slate-700 dark:text-slate-300">{parsedTerms.art6_respA}</p>
                <p className="font-semibold">2. Trách nhiệm Bên B:</p>
                <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">{parsedTerms.art6_respB}</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                <h4 className="font-bold text-slate-900 dark:text-white">Điều 7: Điều khoản chung</h4>
                <p className="whitespace-pre-wrap mt-1 text-slate-700 dark:text-slate-300">{parsedTerms.art7_general}</p>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                <p className="font-bold text-xs mb-1">Hồ sơ gốc đính kèm trên IPFS:</p>
                <a
                  href={`https://ipfs.io/ipfs/${details.termsHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs text-blue-600 dark:text-blue-400 hover:underline break-all inline-flex items-center gap-1"
                >
                  <span>https://ipfs.io/ipfs/{details.termsHash}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm font-semibold">{details.terms}</p>
          </div>
        )}
      </div>

      {/* VÙNG THEO DÕI VỊ TRÍ TRÊN BẢN ĐỒ */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800 print:hidden">
        <div className="flex items-center gap-2 mb-6 pb-3 border-b border-slate-100 dark:border-slate-800">
          <MapPin className="w-5 h-5 text-blue-500" />
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Lịch trình vận chuyển & Checkpoint Map
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* CỘT TRÁI: FORM CẬP NHẬT & TIMELINE */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {details.state === 2 && isProvider && (
              <div className="bg-blue-50/50 dark:bg-blue-950/30 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/50 space-y-4">
                <h4 className="font-bold text-blue-700 dark:text-blue-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Cập nhật hành trình</span>
                </h4>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                    Ghi chú hành trình <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Đã bốc hàng, xe đang rời cảng..."
                    className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-blue-500 bg-white dark:bg-slate-900"
                    value={trackingNote}
                    onChange={(e) => setTrackingNote(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                    Chọn trạm có sẵn
                  </label>
                  <select
                    value={selectedCheckpoint}
                    onChange={(e) => {
                      setSelectedCheckpoint(e.target.value);
                      setManualLatLng(null);
                    }}
                    className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-blue-500 bg-white dark:bg-slate-900 mb-2 cursor-pointer"
                  >
                    <option value="">-- Chọn trạm mẫu --</option>
                    {CHECKPOINT_PRESETS.map((preset, idx) => (
                      <option key={idx} value={idx}>
                        {preset.name}
                      </option>
                    ))}
                  </select>

                  <div className="flex gap-2">
                    <button
                      onClick={handleGetCurrentLocation}
                      disabled={actionLoading}
                      className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors"
                    >
                      GPS
                    </button>
                    <div className="flex-1 flex gap-1">
                      <input
                        type="text"
                        placeholder="Tìm địa điểm..."
                        className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 outline-none focus:border-blue-500 bg-white dark:bg-slate-900"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearchLocation()}
                      />
                      <button
                        onClick={handleSearchLocation}
                        disabled={isSearching}
                        className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors"
                      >
                        {isSearching ? "..." : "Tìm"}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleAddCheckpoint}
                  disabled={actionLoading}
                  className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs active:scale-95 cursor-pointer"
                >
                  {actionLoading ? "Đang xử lý..." : "Gửi cập nhật hành trình"}
                </button>
              </div>
            )}

            {/* Timeline */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 flex-1">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Lịch sử di chuyển</span>
              </h4>

              <div className="space-y-3">
                {!details.trackingHistory || details.trackingHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Chưa có dữ liệu hành trình.</p>
                ) : (
                  details.trackingHistory.slice().reverse().map((point, index) => {
                    const dt = new Date(point.timestamp);
                    const isLatest = index === 0;
                    const realIndex = details.trackingHistory.length - 1 - index;
                    return (
                      <div key={index} className="relative pl-5 border-l-2 border-slate-200 dark:border-slate-700 pb-3 last:border-0 last:pb-0">
                        <div
                          className={`absolute w-2.5 h-2.5 rounded-full -left-[6px] top-1 ${
                            isLatest ? "bg-blue-500 ring-4 ring-blue-500/20" : "bg-slate-300 dark:bg-slate-600"
                          }`}
                        ></div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {point.locationName.split(" - Ghi chú:")[0]}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {dt.toLocaleTimeString("vi-VN")} - {dt.toLocaleDateString("vi-VN")}
                            </p>
                          </div>

                          {details.state === 2 && isProvider && (
                            <button
                              onClick={() => handleDeleteCheckpoint(realIndex)}
                              className="text-slate-400 hover:text-rose-500 p-1"
                              title="Xóa điểm này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: BẢN ĐỒ */}
          <div className="lg:col-span-3">
            <CheckpointMap
              trackingHistory={details.trackingHistory}
              onMapClick={details.state === 2 && isProvider ? handleMapClick : undefined}
              manualMarker={manualLatLng}
            />
          </div>
        </div>
      </div>

      {/* KHU VỰC MINH CHỨNG PHÁP LÝ */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800 print:hidden">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-5 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          <span>Hồ sơ & Minh chứng pháp lý từng giai đoạn</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {renderProofBox("step0", "1. Khởi tạo hợp đồng", "Bản gốc có chữ ký 2 bên", details.client)}
          {renderProofBox("step1", "2. Xác nhận nhận việc", "Lệnh điều động xe / Lệnh xuất kho", details.provider)}
          {renderProofBox("step2", "3. Đang vận chuyển", "Vận đơn / Hình ảnh bốc xếp hàng", details.provider)}
          {renderProofBox("step3", "4. Bàn giao hoàn thành", "Biên bản bàn giao tại kho đích", details.receiver)}
          {renderProofBox("step4", "5. Thanh toán", "Hóa đơn VAT / Ủy nhiệm chi NH", details.receiver)}
        </div>
      </div>

      {/* NÚT HÀNH ĐỘNG GIAO DỊCH BLOCKCHAIN */}
      <div className="flex flex-wrap justify-end gap-3 print:hidden pt-2">
        {!walletAddress ? (
          <div className="w-full p-4 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 text-center rounded-2xl border border-amber-200 dark:border-amber-900/50 text-xs sm:text-sm font-semibold">
            Bạn đang ở chế độ xem khách. Vui lòng kết nối ví Web3 để ký duyệt hoặc xác nhận thanh toán.
          </div>
        ) : (
          <>
            {details.state === 0 &&
              currentWallet !== details.client?.toLowerCase() &&
              currentWallet !== details.receiver?.toLowerCase() && (
                <button
                  onClick={handleAccept}
                  disabled={actionLoading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer text-sm"
                >
                  {actionLoading ? "Đang xử lý..." : "Nhận vận chuyển đơn hàng này"}
                </button>
              )}

            {details.state === 1 && isProvider && (
              <button
                onClick={() => handleUpdateStatus("InProgress")}
                disabled={actionLoading}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer text-sm"
              >
                {actionLoading ? "Đang xử lý..." : "Cập nhật: Bắt đầu giao hàng"}
              </button>
            )}

            {details.state === 2 && isProvider && (
              <button
                onClick={() => handleUpdateStatus("Completed")}
                disabled={actionLoading}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer text-sm"
              >
                {actionLoading ? "Đang xử lý..." : "Cập nhật: Đã giao thành công"}
              </button>
            )}

            {details.state === 3 && isReceiver && (
              <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                {isOverdue && (
                  <span className="text-rose-600 font-bold text-xs bg-rose-50 dark:bg-rose-950/40 px-3 py-1 rounded-lg border border-rose-200 dark:border-rose-900/40">
                    ⚠ Đơn hàng quá hạn. Hệ thống sẽ tự động trừ tiền phạt {details.penalty} ETH.
                  </span>
                )}
                <button
                  onClick={handleConfirm}
                  disabled={actionLoading}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer text-sm w-full sm:w-auto"
                >
                  {actionLoading
                    ? "Đang xử lý..."
                    : isOverdue
                      ? `Xác nhận & Phạt (${details.penalty} ETH)`
                      : "Xác nhận & Thanh toán tự động"}
                </button>
              </div>
            )}

            {details.state === 0 && currentWallet === details.client?.toLowerCase() && (
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="px-6 py-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 rounded-xl font-bold hover:bg-rose-100 transition-colors cursor-pointer text-sm"
              >
                {actionLoading ? "Đang xử lý..." : "Hủy hợp đồng & Hoàn tiền"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ContractDetailsPage;
