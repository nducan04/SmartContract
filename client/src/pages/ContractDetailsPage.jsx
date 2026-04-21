import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import { ethers } from "ethers";
import { toast } from "react-hot-toast";
import axios from "axios";
import Swal from "sweetalert2";
import { agreementABI } from "../constants";
import CheckpointMap from "../components/CheckpointMap";

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

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // STATE MỚI: Quản lý file minh chứng được chọn ở từng bước
  const [proofFiles, setProofFiles] = useState({});
  const [selectedCheckpoint, setSelectedCheckpoint] = useState("");
  const [trackingNote, setTrackingNote] = useState("");
  const [manualLatLng, setManualLatLng] = useState(null);
  const [customLocationName, setCustomLocationName] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

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
    "bg-green-100 text-green-800",
    "bg-gray-100 text-gray-800",
    "bg-red-100 text-red-800",
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
        // NGƯỜI DÙNG KHÔNG CÓ VÍ -> DÙNG PUBLIC PROVIDER
        const publicProvider = new ethers.JsonRpcProvider(
          "https://ethereum-sepolia-rpc.publicnode.com",
        );
        contractToRead = new ethers.Contract(id, agreementABI, publicProvider);
      }

      const data = await contractToRead.getAgreementDetails();
      const realState = Number(data[0]);

      // --- LOGIC MỚI: Kéo dữ liệu ảnh minh chứng từ MongoDB ---
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      let dbProofs = {};
      let dbTracking = [];
      try {
        // Tìm hợp đồng hiện tại trong DB để lấy object proofs
        const response = await axios.get(
          `${API_URL}/api/contracts/track/${id}`,
        );
        const dbContract = response.data;
        if (dbContract && dbContract.proofs) {
          dbProofs = dbContract.proofs;
        }
        if (dbContract && dbContract.trackingHistory) {
          dbTracking = dbContract.trackingHistory;
        }
      } catch (dbErr) {
        console.warn("Chưa tải được proofs từ DB");
      }

      setDetails({
        state: realState,
        client: data[1],
        provider: data[2],
        receiver: data[3],
        amount: ethers.formatEther(data[4]),
        terms: data[5],
        termsHash: data[6],
        deadline: data[7],
        penalty: ethers.formatEther(data[8]),
        isLate: data[9],
        proofs: dbProofs, // Lưu proofs vào state
        trackingHistory: dbTracking, // Thêm tracking history
      });
      syncToBackend(realState);
    } catch (error) {
      console.error("Lỗi tải hợp đồng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id, walletAddress, getAgreementContract]);

  const handleMapClick = (latlng) => {
    setManualLatLng(latlng);
    setCustomLocationName(`Tọa độ trên bản đồ`);
    setSelectedCheckpoint("");
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Trình duyệt của bạn không hỗ trợ định vị GPS.");
      return;
    }
    toast.info("Đang lấy vị trí...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setManualLatLng({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setCustomLocationName("Vị trí hiện tại (GPS)");
        setSelectedCheckpoint("");
      },
      (error) => {
        toast.error(
          "Không thể lấy vị trí. Vui lòng cho phép quyền truy cập vị trí.",
        );
      },
    );
  };

  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) {
      toast.error("Vui lòng nhập địa danh cần tìm!");
      return;
    }
    setIsSearching(true);
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery,
        )}&limit=1`,
      );
      if (response.data && response.data.length > 0) {
        const place = response.data[0];
        setManualLatLng({
          lat: parseFloat(place.lat),
          lng: parseFloat(place.lon),
        });
        setCustomLocationName(place.display_name);
        setSelectedCheckpoint("");
        toast.success("Đã tìm thấy vị trí trên bản đồ!");
      } else {
        toast.error("Không tìm thấy địa điểm này!");
      }
    } catch (error) {
      toast.error("Lỗi khi tìm kiếm địa điểm.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleDeleteCheckpoint = async (realIndex) => {
    const result = await Swal.fire({
      title: "Xóa điểm hành trình?",
      text: "Bạn có chắc chắn muốn xóa điểm định vị này không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Đồng ý xóa",
      cancelButtonText: "Hủy",
    });

    if (!result.isConfirmed) return;

    setActionLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      await axios.put(`${API_URL}/api/contracts/delete-tracking`, {
        contractAddress: id,
        index: realIndex,
      });
      toast.success("Đã xóa vị trí thành công!");
      fetchDetails();
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi xóa vị trí!");
    } finally {
      setActionLoading(false);
    }
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
      toast.error(
        "Vui lòng chọn trạm điểm từ danh sách hoặc click trên bản đồ!",
      );
      return;
    }

    if (!trackingNote.trim()) {
      toast.error("Vui lòng nhập ghi chú hành trình!");
      return;
    }

    // Nối nội dung cho tương thích nếu DB cũ chưa có trường note
    const payloadInfo = trackingNote
      ? `${finalName} - Ghi chú: ${trackingNote}`
      : finalName;

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

      // Reset form
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

  // --- HÀM MỚI: Xử lý Upload Ảnh Minh Chứng lên IPFS & Lưu vào DB ---
  const handleUploadProof = async (stepKey) => {
    const file = proofFiles[stepKey];
    if (!file) {
      toast.error("Vui lòng chọn file minh chứng!");
      return;
    }
    setActionLoading(true);
    try {
      // 1. Tải lên Pinata (IPFS)
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

      // 2. Lưu Hash vào Backend (MongoDB)
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      await axios.put(`${API_URL}/api/contracts/upload-proof`, {
        contractAddress: id,
        step: stepKey,
        ipfsHash: ipfsHash,
      });

      toast.success("Tải minh chứng thành công!");
      // Xóa file đã chọn trong state và load lại data
      setProofFiles((prev) => ({ ...prev, [stepKey]: null }));
      fetchDetails();
    } catch (err) {
      console.error(err);
      toast.error("Lỗi tải minh chứng lên hệ thống!");
    } finally {
      setActionLoading(false);
    }
  };

  // ... (CÁC HÀM XỬ LÝ GIAO DỊCH BLOCKCHAIN CỦA BẠN GIỮ NGUYÊN BÊN DƯỚI) ...
  const handleAccept = async () => {
    try {
      setActionLoading(true);
      const contract = getAgreementContract(id);

      let gasEstimate;
      try {
        gasEstimate = await contract.acceptAgreement.estimateGas();
      } catch (gasError) {
        console.error("Lỗi estimate gas:", gasError);
        if (
          gasError.message &&
          gasError.message.includes("insufficient funds")
        ) {
          toast.error(
            "Số dư của bạn không đủ để trả phí mạng lưới (Gas fee). Vui lòng nạp thêm Sepolia ETH!",
          );
          throw new Error(
            "Số dư của bạn không đủ để trả phí mạng lưới (Gas fee). Vui lòng nạp thêm Sepolia ETH!",
          );
        }
        toast.error(
          "Không thể dự tính phí màng lưới. Giao dịch có thể sẽ thất bại.",
        );
        throw new Error(
          "Không thể dự tính phí màng lưới. Giao dịch có thể sẽ thất bại.",
        );
      }

      const tx = await contract.acceptAgreement({
        gasLimit: (gasEstimate * 12n) / 10n,
      });
      await tx.wait();

      await syncToBackend(1, walletAddress);
      toast.success("Đã chấp nhận hợp đồng thành công!");
      fetchDetails();
    } catch (error) {
      toast.error(
        "Lỗi: " + (error.reason || error.message || "Giao dịch thất bại"),
      );
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

      let gasEstimate;
      try {
        if (newStatusText === "InProgress") {
          gasEstimate = await contract.updateStatusInProgress.estimateGas();
        } else if (newStatusText === "Completed") {
          gasEstimate = await contract.updateStatusCompleted.estimateGas();
        }
      } catch (gasError) {
        console.error("Lỗi estimate gas:", gasError);
        if (
          gasError.message &&
          gasError.message.includes("insufficient funds")
        ) {
          throw new Error(
            "Số dư của bạn không đủ để trả phí mạng lưới (Gas fee). Vui lòng nạp thêm Sepolia ETH!",
          );
        }
        throw new Error(
          "Không thể dự tính phí màng lưới. Giao dịch có thể sẽ thất bại.",
        );
      }

      const gasLimit = (gasEstimate * 12n) / 10n;

      if (newStatusText === "InProgress") {
        tx = await contract.updateStatusInProgress({ gasLimit });
        statusNumber = 2;
      }
      if (newStatusText === "Completed") {
        tx = await contract.updateStatusCompleted({ gasLimit });
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

      let gasEstimate;
      try {
        gasEstimate = await contract.confirmAndPay.estimateGas();
      } catch (gasError) {
        console.error("Lỗi estimate gas:", gasError);
        if (
          gasError.message &&
          gasError.message.includes("insufficient funds")
        ) {
          throw new Error(
            "Số dư của bạn không đủ để trả phí mạng lưới (Gas fee). Vui lòng nạp thêm Sepolia ETH!",
          );
        }
        throw new Error(
          "Không thể dự tính phí màng lưới. Giao dịch có thể sẽ thất bại.",
        );
      }

      const tx = await contract.confirmAndPay({
        gasLimit: (gasEstimate * 12n) / 10n,
      });
      await tx.wait();
      await syncToBackend(4);
      Swal.fire({
        title: "Hoàn tất thanh toán!",
        text: "Đã xác nhận và thanh toán thành công cho bên vận chuyển.",
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

  const handleCancel = async () => {
    // 1. Xác nhận trước khi hủy
    const result = await Swal.fire({
      title: "Xác nhận hủy hợp đồng",
      text: "Bạn có chắc chắn muốn hủy hợp đồng này? Toàn bộ tiền ký quỹ sẽ được hoàn lại về ví của bạn.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Đồng ý hủy",
      cancelButtonText: "Đóng",
    });

    if (!result.isConfirmed) return;

    try {
      setActionLoading(true);
      const contract = getAgreementContract(id);

      // 2. Estimate Gas để chặn lỗi nếu không đủ điều kiện hủy
      let gasEstimate;
      try {
        gasEstimate = await contract.cancelAgreement.estimateGas();
      } catch (gasError) {
        console.error("Lỗi estimate gas hủy:", gasError);
        throw new Error(
          "Không thể hủy hợp đồng lúc này. Hãy đảm bảo bạn là người tạo và hợp đồng chưa có người nhận việc.",
        );
      }

      // 3. Gọi hàm Hủy trên Blockchain
      const tx = await contract.cancelAgreement({
        gasLimit: (gasEstimate * 12n) / 10n,
      });

      Swal.fire({
        title: "Đang xử lý",
        text: "Đang xử lý hoàn tiền trên Blockchain, vui lòng đợi...",
        icon: "info",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      await tx.wait();

      // 4. Đồng bộ Trạng thái 5 (Đã hủy) về Database
      await syncToBackend(5);

      Swal.fire({
        title: "Đã hủy hợp đồng!",
        text: "Đã hủy hợp đồng thành công và hoàn tiền về ví!",
        icon: "success",
        confirmButtonColor: "#3085d6",
      });

      fetchDetails(); // Tải lại giao diện
    } catch (error) {
      Swal.fire({
        title: "Giao dịch thất bại",
        text:
          "Lỗi: " + (error.reason || error.message || "Giao dịch hủy thất bại"),
        icon: "error",
        confirmButtonColor: "#d33",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  // --- HÀM RENDER KHUNG UPLOAD ---
  const renderProofBox = (stepKey, title, description, authorizedWallet) => {
    const currentProof = details.proofs && details.proofs[stepKey];
    // Chỉ người được cấp quyền (VD: client, provider, receiver) mới hiện form upload
    const canUpload =
      walletAddress?.toLowerCase() === authorizedWallet?.toLowerCase();

    return (
      <div
        key={stepKey}
        className="border border-gray-200 bg-gray-50 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow"
      >
        <div className="mb-3">
          <h4 className="font-bold text-sm text-gray-800">{title}</h4>
          <p className="text-xs text-gray-500">{description}</p>
        </div>

        {currentProof ? (
          <a
            href={`https://ipfs.io/ipfs/${currentProof}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2 bg-green-50 text-green-700 font-bold text-xs rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
          >
            <i className="uil uil-check-circle text-lg"></i> Đã tải lên (Xem
            chứng từ)
          </a>
        ) : canUpload ? (
          <div className="flex flex-col gap-2">
            <input
              type="file"
              onChange={(e) =>
                setProofFiles({ ...proofFiles, [stepKey]: e.target.files[0] })
              }
              className="block w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
            <button
              onClick={() => handleUploadProof(stepKey)}
              disabled={actionLoading || !proofFiles[stepKey]}
              className="w-full bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
            >
              Tải minh chứng lên IPFS
            </button>
          </div>
        ) : (
          <div className="w-full py-2 bg-gray-100 text-gray-400 font-bold text-xs rounded-lg text-center border border-gray-200">
            Chưa có chứng từ
          </div>
        )}
      </div>
    );
  };

  if (loading)
    return <div className="p-8 text-center text-gray-500">Đang tải...</div>;
  if (!details)
    return (
      <div className="p-8 text-center text-red-500">
        Không tìm thấy hợp đồng!
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
    <div className="p-4 md:p-6 max-w-5xl mx-auto relative print:p-0 print:m-0 print:max-w-none">
      {/* HEADER & NÚT IN PDF NẰM NGOÀI BẢN IN */}
      <div className="flex flex-wrap justify-between items-center mb-6 print:hidden gap-4">
        <div className="flex items-center gap-3">
          <span
            className={`px-4 py-2 rounded-full font-bold text-sm ${stateColors[details.state]}`}
          >
            {stateLabels[details.state]}
          </span>
          {details.isLate && (
            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
              ⚠ Trễ hạn
            </span>
          )}
        </div>
        <button
          onClick={handleDownloadPDF}
          className="bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex 
          items-center gap-2 hover:bg-gray-600 transition-all shadow-lg transform active:scale-95 cursor-pointer"
        >
          <i className="uil uil-print text-lg"></i> In Báo Cáo / Lưu PDF
        </button>
      </div>

      {/* VÙNG IN PDF - NỘI DUNG HỢP ĐỒNG */}
      <div
        id="printable-contract"
        className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-200 print:shadow-none print:border-none print:p-0 text-gray-800"
      >
        {/* ... (TOÀN BỘ PHẦN RENDER BẢN IN QUỐC HIỆU VÀ ĐIỀU KHOẢN GIỮ NGUYÊN) ... */}
        <div className="text-center mb-8">
          {parsedTerms ? (
            <>
              <h2 className="text-lg font-bold uppercase">
                Cộng hòa xã hội chủ nghĩa Việt Nam
              </h2>
              <p className="font-bold underline text-md mt-1">
                Độc lập - Tự do - Hạnh phúc
              </p>
              <h1 className="text-2xl md:text-3xl font-bold mt-8 mb-2 uppercase">
                Hợp đồng Giao nhận & Vận chuyển
              </h1>
              <p className="italic text-sm text-gray-500">
                Mã số (Smart Contract ID): {id}
              </p>
            </>
          ) : (
            <div className="border-b-2 border-gray-800 pb-4">
              <h2 className="text-2xl font-bold uppercase tracking-wide">
                Chứng Nhận Hợp Đồng Blockchain
              </h2>
              <p className="text-sm text-gray-500 mt-2">Mã hợp đồng: {id}</p>
            </div>
          )}
        </div>

        {parsedTerms ? (
          <div className="space-y-6 text-sm md:text-base">
            <p className="italic">
              Hôm nay, ngày {formatDate(details.createdAt || Date.now() / 1000)}
              , chúng tôi gồm có:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              <div>
                <h3 className="font-bold text-lg uppercase mb-3 border-b border-gray-300 pb-1 text-blue-800">
                  Bên Giao / Bên Bán (Bên A)
                </h3>
                <ul className="space-y-2">
                  <li>
                    <strong>Tên cá nhân/Tổ chức:</strong>{" "}
                    {parsedTerms.partyA_name ||
                      "..................................................."}
                  </li>
                  <li>
                    <strong>Địa chỉ:</strong>{" "}
                    {parsedTerms.partyA_address ||
                      "..................................................."}
                  </li>
                  <li>
                    <strong>Mã số thuế:</strong>{" "}
                    {parsedTerms.partyA_mst ||
                      "..................................................."}
                  </li>
                  <li>
                    <strong>Người đại diện:</strong>{" "}
                    {parsedTerms.partyA_rep ||
                      "..................................................."}
                  </li>
                  <li className="break-all mt-2 pt-2 border-t border-dashed">
                    <strong>Ví Blockchain xác thực:</strong>
                    <br />
                    <span className="font-mono text-xs text-gray-500">
                      {details.client}
                    </span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-lg uppercase mb-3 border-b border-gray-300 pb-1 text-blue-800">
                  Bên Nhận / Bên Mua (Bên B)
                </h3>
                <ul className="space-y-2">
                  <li>
                    <strong>Tên cá nhân/Tổ chức:</strong>{" "}
                    {parsedTerms.partyB_name ||
                      "..................................................."}
                  </li>
                  <li>
                    <strong>Địa chỉ:</strong>{" "}
                    {parsedTerms.partyB_address ||
                      "..................................................."}
                  </li>
                  <li>
                    <strong>Mã số thuế:</strong>{" "}
                    {parsedTerms.partyB_mst ||
                      "..................................................."}
                  </li>
                  <li>
                    <strong>Người đại diện:</strong>{" "}
                    {parsedTerms.partyB_rep ||
                      "..................................................."}
                  </li>
                  <li className="break-all mt-2 pt-2 border-t border-dashed">
                    <strong>Ví Blockchain xác thực:</strong>
                    <br />
                    <span className="font-mono text-xs text-gray-500">
                      {details.receiver}
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <p className="font-bold mt-6 mb-4">
              Sau khi bàn bạc, hai bên thống nhất ký kết hợp đồng với những điều
              khoản sau:
            </p>
            <div className="space-y-5 text-justify leading-relaxed">
              <div>
                <h4 className="font-bold underline">
                  Điều 1: Tên hàng, số lượng, chất lượng
                </h4>
                <p className="whitespace-pre-wrap mt-1">
                  {parsedTerms.art1_items}
                </p>
              </div>
              <div>
                <h4 className="font-bold underline">
                  Điều 2: Quy cách đóng gói
                </h4>
                <p className="whitespace-pre-wrap mt-1">
                  {parsedTerms.art2_packaging}
                </p>
              </div>
              <div>
                <h4 className="font-bold underline">
                  Điều 3 & Điều 5: Giá cả và Phương thức thanh toán
                </h4>
                <p className="whitespace-pre-wrap mt-1">
                  {parsedTerms.art3_price}
                </p>
                <div className="bg-gray-50 p-4 rounded-lg mt-3 border border-gray-200 print:border-gray-400">
                  <p>
                    🔹{" "}
                    <strong>
                      Giá trị thanh toán tự động qua Smart Contract:
                    </strong>{" "}
                    <span className="text-blue-700 font-bold text-lg">
                      {details.amount} ETH
                    </span>
                  </p>
                  <p>
                    🔹 <strong>Phạt vi phạm (Khấu trừ nếu quá hạn):</strong>{" "}
                    <span className="text-red-600 font-bold">
                      {details.penalty} ETH
                    </span>
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-bold underline">
                  Điều 4: Thời gian và Địa điểm giao hàng
                </h4>
                <p className="whitespace-pre-wrap mt-1">
                  {parsedTerms.art4_delivery}
                </p>
                <p className="mt-2 font-bold text-red-600 bg-red-50 inline-block px-3 py-1 rounded print:border print:border-red-200">
                  » Hạn chót cam kết ghi trên Blockchain:{" "}
                  {formatDate(details.deadline)}
                </p>
              </div>
              <div>
                <h4 className="font-bold underline">
                  Điều 6: Trách nhiệm mỗi bên
                </h4>
                <p className="mt-1 font-semibold">1. Trách nhiệm Bên A:</p>
                <p className="whitespace-pre-wrap mb-2">
                  {parsedTerms.art6_respA}
                </p>
                <p className="font-semibold">2. Trách nhiệm Bên B:</p>
                <p className="whitespace-pre-wrap">{parsedTerms.art6_respB}</p>
              </div>
              <div>
                <h4 className="font-bold underline">
                  Điều 7: Điều khoản chung
                </h4>
                <p className="whitespace-pre-wrap mt-1">
                  {parsedTerms.art7_general}
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-gray-200 print:border-gray-400">
                <h4 className="font-bold mb-1">
                  Hồ sơ gốc đính kèm (Bản scan có chữ ký & dấu đỏ)
                </h4>
                <a
                  href={`https://ipfs.io/ipfs/${details.termsHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-blue-600 hover:underline"
                >
                  https://ipfs.io/ipfs/{details.termsHash}
                </a>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-2 text-center pb-12">
              <div>
                <p className="font-bold uppercase">Đại diện Bên A</p>
                <p className="italic text-xs text-gray-500 mb-8">
                  (Đã xác thực chữ ký điện tử)
                </p>
                <p className="font-mono text-xs font-bold text-blue-800 bg-blue-50 inline-block px-2 py-1 rounded break-all">
                  {details.client}
                </p>
              </div>
              <div>
                <p className="font-bold uppercase">Đại diện Bên B</p>
                <p className="italic text-xs text-gray-500 mb-8">
                  (Đã xác thực chữ ký điện tử)
                </p>
                <p className="font-mono text-xs font-bold text-blue-800 bg-blue-50 inline-block px-2 py-1 rounded break-all">
                  {details.receiver}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="md:col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-200 print:border print:border-gray-300">
              <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">
                Tóm tắt nội dung dịch vụ
              </h3>
              <p className="text-gray-900 font-medium">{details.terms}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 print:border print:border-gray-300">
              <h3 className="text-xs font-bold text-blue-500 uppercase mb-1">
                Giá trị ký quỹ / Thanh toán
              </h3>
              <p className="text-2xl font-bold text-blue-700">
                {details.amount} ETH
              </p>
            </div>
            <div
              className={`${isOverdue ? "bg-red-50 border-red-200" : "bg-orange-50 border-orange-100"} p-4 rounded-xl border print:border print:border-gray-300`}
            >
              <h3
                className={`text-xs font-bold uppercase mb-1 ${isOverdue ? "text-red-500" : "text-orange-600"}`}
              >
                Thời hạn cam kết
              </h3>
              <p
                className={`text-lg font-mono font-bold ${isOverdue ? "text-red-700" : "text-gray-800"}`}
              >
                {formatDate(details.deadline)}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 print:border print:border-gray-300">
              <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">
                Quy định phạt vi phạm
              </h3>
              <p className="text-lg font-mono text-gray-800 font-bold">
                -{details.penalty} ETH
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 print:border print:border-gray-300">
              <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">
                Tài liệu đính kèm (Bản gốc)
              </h3>
              <p className="text-xs text-blue-600 font-mono break-all mt-1">
                https://ipfs.io/ipfs/{details.termsHash}
              </p>
            </div>
            <div className="md:col-span-2 space-y-4 mt-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600 font-bold text-sm">
                  Bên Giao (Client):
                </span>
                <span className="font-mono text-sm text-gray-800">
                  {details.client}
                </span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600 font-bold text-sm">
                  Bên Nhận (Receiver):
                </span>
                <span className="font-mono text-sm text-gray-800">
                  {details.receiver}
                </span>
              </div>
            </div>
          </div>
        )}
        <div className="mt-8 text-center text-xs text-gray-400 italic">
          <p>
            Hợp đồng này được khởi tạo và bảo vệ bằng mật mã học trên
            Blockchain.
          </p>
        </div>
      </div>

      {/* VÙNG THEO DÕI VỊ TRÍ TRÊN BẢN ĐỒ */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mt-6 print:hidden">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4 border-b pb-2">
          <i className="uil uil-map-marker-alt text-blue-500"></i> Lịch trình
          vận chuyển
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* CỘT TRÁI: FORM CẬP NHẬT & TIMELINE (40% - col-span-2) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Form Cập Nhật (chỉ hiện cho vận chuyển khi đang thực hiện) */}
            {details.state === 2 && isProvider && (
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <h4 className="font-bold text-blue-800 mb-3 text-sm flex items-center gap-2">
                  <i className="uil uil-edit"></i> Cập nhật hành trình
                </h4>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      1. Nội dung / Ghi chú{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Đã bốc hàng xong, đang di chuyển..."
                      className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      value={trackingNote}
                      onChange={(e) => setTrackingNote(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      2. Vị trí <span className="text-red-500">*</span>
                    </label>

                    {/* Tùy chọn 1: Chọn từ danh sách */}
                    <select
                      value={selectedCheckpoint}
                      onChange={(e) => {
                        setSelectedCheckpoint(e.target.value);
                        setManualLatLng(null); // Bỏ manual nếu chọn preset
                      }}
                      className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 bg-white mb-6"
                    >
                      <option value="">-- Chọn điểm có sẵn --</option>
                      {CHECKPOINT_PRESETS.map((preset, idx) => (
                        <option key={idx} value={idx}>
                          {preset.name}
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-gray-400 font-medium">
                        HOẶC TÌM KIẾM TỰ DO
                      </span>
                    </div>

                    {/* Tùy chọn 2 & 3: Lấy GPS hoặc Click map */}
                    <div className="flex gap-2">
                      <button
                        onClick={handleGetCurrentLocation}
                        disabled={actionLoading}
                        className="flex-none bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-3 py-2 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Lấy GPS hiện tại"
                      >
                        <i className="uil uil-location-point"></i> GPS
                      </button>
                      <div className="flex-1 flex gap-1">
                        <input
                          type="text"
                          placeholder="VD: Bắc Kinh, TQ..."
                          className="w-full text-xs border border-gray-300 rounded-lg px-2 py-1 outline-none focus:border-blue-500"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleSearchLocation()
                          }
                        />
                        <button
                          onClick={handleSearchLocation}
                          disabled={isSearching}
                          className="bg-gray-100 border border-gray-300 text-gray-700 px-3 py-1 rounded-lg text-xs font-bold hover:bg-gray-200 cursor-pointer"
                        >
                          {isSearching ? "..." : "Tìm"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Hiển thị tọa độ nếu là Manual */}
                  {manualLatLng && (
                    <div className="bg-yellow-50 text-yellow-800 text-xs p-2 rounded border border-yellow-200">
                      <strong>📍 Vị trí chọn:</strong> {customLocationName}
                      <span
                        className="ml-2 text-red-500 cursor-pointer hover:underline"
                        onClick={() => setManualLatLng(null)}
                      >
                        {" "}
                        (Hủy)
                      </span>
                    </div>
                  )}

                  <button
                    onClick={handleAddCheckpoint}
                    disabled={actionLoading}
                    className="w-full bg-blue-600 text-white px-4 py-2 mt-2 rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors flex justify-center items-center gap-2 shadow-sm cursor-pointer"
                  >
                    {actionLoading ? (
                      "Đang xử lý..."
                    ) : (
                      <>
                        <i className="uil uil-navigator"></i> Gửi Cập Nhật Hành
                        Trình
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Trục Thời Gian (Timeline) */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 flex-1">
              <h4 className="font-bold text-gray-800 mb-4 text-sm flex items-center gap-2">
                <i className="uil uil-history"></i> Lịch sử cập nhật
              </h4>

              <div className="space-y-0 pl-2">
                {!details.trackingHistory ||
                details.trackingHistory.length === 0 ? (
                  <p className="text-xs text-gray-500 italic mb-4">
                    Chưa có dữ liệu hành trình.
                  </p>
                ) : (
                  details.trackingHistory
                    .slice()
                    .reverse()
                    .map((point, index) => {
                      const dt = new Date(point.timestamp);
                      const isLatest = index === 0;
                      const realIndex =
                        details.trackingHistory.length - 1 - index;
                      return (
                        <div
                          key={index}
                          className="relative pl-6 border-l-2 border-gray-200 pb-6 last:border-0 last:pb-2"
                        >
                          <div
                            className={`absolute w-3 h-3 rounded-full -left-[7px] top-1 ${isLatest ? "bg-blue-500 border-2 border-blue-200 shadow-[0_0_0_3px_rgba(59,130,246,0.2)]" : "bg-gray-300"}`}
                          ></div>
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-1">
                              <p
                                className={`text-sm font-bold ${isLatest ? "text-gray-900" : "text-gray-700"}`}
                              >
                                {point.locationName.split(" - Ghi chú:")[0]}
                              </p>
                              {point.locationName.includes(" - Ghi chú:") && (
                                <p className="text-sm text-gray-600 italic bg-gray-50 p-2 rounded mt-1 border border-gray-100">
                                  "{point.locationName.split(" - Ghi chú: ")[1]}
                                  "
                                </p>
                              )}
                              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                <i className="uil uil-clock"></i>{" "}
                                {dt.toLocaleTimeString("vi-VN")} -{" "}
                                {dt.toLocaleDateString("vi-VN")}
                              </p>
                            </div>

                            {details.state === 2 && isProvider && (
                              <button
                                onClick={() =>
                                  handleDeleteCheckpoint(realIndex)
                                }
                                disabled={actionLoading}
                                className="text-red-400 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors cursor-pointer"
                                title="Xóa điểm này"
                              >
                                <i className="uil uil-trash-alt text-lg"></i>
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

          {/* CỘT PHẢI: BẢN ĐỒ (60% - col-span-3) */}
          <div className="lg:col-span-3">
            <div className="text-xs text-gray-500 mb-2 italic flex justify-between">
              <span>Trực quan hóa lộ trình trên bản đồ</span>
              {details.state === 2 && isProvider && (
                <span className="text-blue-500 font-medium">
                  <i className="uil uil-mouse-alt"></i> Click vào bản đồ để thả
                  ghim cập nhật
                </span>
              )}
            </div>
            <CheckpointMap
              trackingHistory={details.trackingHistory}
              onMapClick={
                details.state === 2 && isProvider ? handleMapClick : undefined
              }
              manualMarker={manualLatLng}
            />
          </div>
        </div>
      </div>

      {/* --- KHU VỰC UPLOAD MINH CHỨNG PHÁP LÝ CHỈ HIỆN TRÊN MÀN HÌNH WEB --- */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mt-6 print:hidden">
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
          Hồ sơ & Minh chứng pháp lý từng giai đoạn
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {renderProofBox(
            "step0",
            "1. Khởi tạo hợp đồng",
            "Bản gốc có chữ ký 2 bên",
            details.client,
          )}
          {renderProofBox(
            "step1",
            "2. Xác nhận nhận việc",
            "Lệnh điều động xe / Lệnh xuất kho",
            details.provider,
          )}
          {renderProofBox(
            "step2",
            "3. Đang vận chuyển",
            "Vận đơn / Hình ảnh bốc xếp hàng",
            details.provider,
          )}
          {renderProofBox(
            "step3",
            "4. Bàn giao hoàn thành",
            "Biên bản bàn giao tại kho đích",
            details.receiver,
          )}
          {renderProofBox(
            "step4",
            "5. Thanh toán",
            "Hóa đơn VAT / Ủy nhiệm chi NH",
            details.receiver,
          )}
        </div>
      </div>

      {/* KHU VỰC NÚT HÀNH ĐỘNG GIAO DỊCH BLOCKCHAIN */}
      <div className="flex flex-wrap justify-end gap-4 mt-6 print:hidden">
        {!walletAddress ? (
          <div className="w-full mt-2 p-4 bg-yellow-50 text-yellow-700 text-center rounded-xl border border-yellow-200 font-medium">
            <i className="uil uil-wallet text-xl mr-2 align-middle"></i>
            Bạn đang ở chế độ Khách (Chỉ xem). Vui lòng kết nối ví Web3 để tương
            tác.
          </div>
        ) : (
          <>
            {details.state === 0 &&
              currentWallet !== details.client?.toLowerCase() &&
              currentWallet !== details.receiver?.toLowerCase() && (
                <button
                  onClick={handleAccept}
                  disabled={actionLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg cursor-pointer"
                >
                  {actionLoading
                    ? "Đang xử lý..."
                    : "Nhận vận chuyển đơn hàng này"}
                </button>
              )}
            {details.state === 1 && isProvider && (
              <button
                onClick={() => handleUpdateStatus("InProgress")}
                disabled={actionLoading}
                className="px-6 py-3 bg-yellow-500 text-white rounded-xl font-bold hover:bg-yellow-600 shadow-lg cursor-pointer"
              >
                {actionLoading
                  ? "Đang xử lý..."
                  : "Cập nhật: Bắt đầu giao hàng"}
              </button>
            )}
            {details.state === 2 && isProvider && (
              <button
                onClick={() => handleUpdateStatus("Completed")}
                disabled={actionLoading}
                className="px-6 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 shadow-lg cursor-pointer"
              >
                {actionLoading
                  ? "Đang xử lý..."
                  : "Cập nhật: Đã giao thành công"}
              </button>
            )}
            {details.state === 3 && isReceiver && (
              <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                {isOverdue && (
                  <span className="text-red-600 font-bold text-sm bg-red-50 px-3 py-1 rounded-lg border border-red-100">
                    ⚠ Đơn hàng quá hạn. Hệ thống sẽ tự động trừ tiền phạt.
                  </span>
                )}
                <button
                  onClick={handleConfirm}
                  disabled={actionLoading}
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 shadow-lg w-full md:w-auto cursor-pointer"
                >
                  {actionLoading
                    ? "Đang xử lý..."
                    : isOverdue
                      ? `Xác nhận & Phạt (${details.penalty} ETH)`
                      : "Xác nhận & Thanh toán cho Vận chuyển"}
                </button>
              </div>
            )}

            {/* NÚT HỦY HỢP ĐỒNG */}
            {details.state === 0 &&
              currentWallet === details.client?.toLowerCase() && (
                <button
                  onClick={handleCancel}
                  disabled={actionLoading}
                  className="px-6 py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold hover:bg-red-100 transition-colors cursor-pointer"
                >
                  {actionLoading ? "Đang xử lý..." : "Hủy hợp đồng"}
                </button>
              )}
          </>
        )}
      </div>
    </div>
  );
};

export default ContractDetailsPage;
