import React, { useState } from "react";
import { useWeb3 } from "../context/Web3Context";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import axios from "axios";

const CreateContractPage = () => {
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [penalty, setPenalty] = useState("");
  const [file, setFile] = useState(null);

  // --- STATE MỚI: CHỨA ĐẦY ĐỦ THÔNG TIN NHƯ ẢNH hopdong.jpg ---
  const [contractDetails, setContractDetails] = useState({
    partyA_name: "",
    partyA_address: "",
    partyA_mst: "",
    partyA_rep: "",
    partyB_name: "",
    partyB_address: "",
    partyB_mst: "",
    partyB_rep: "",
    art1_items: "", // Tên hàng, số lượng, chất lượng
    art2_packaging: "", // Quy cách đóng gói
    art3_price: "", // Giá cả hàng hóa
    art4_delivery: "", // Thời gian & địa điểm giao hàng
    art5_payment: "", // Phương thức thanh toán
    art6_respA: "", // Trách nhiệm bên A
    art6_respB: "", // Trách nhiệm bên B
    art7_general:
      "Hai bên cam kết thực hiện nghiêm túc các điều khoản ghi trong hợp đồng này. Đối với những nội dung không quy định trong hợp đồng sẽ được thực hiện theo quy định hiện hành của pháp luật. Trong quá trình thực hiện hợp đồng nếu có phát sinh thì hai bên phải chủ động thông báo cho nhau bằng văn bản để bàn bạc giải quyết, trường hợp nếu không giải quyết được thì một trong hai bên có quyền đưa vụ việc ra toà án có thẩm quyền để giải quyết. Quyết định của toà buộc hai bên phải thực hiện mọi chi phí do bên có lỗi chịu",
  });

  // Hàm xử lý khi nhập liệu vào các ô mới
  const handleDetailChange = (e) => {
    setContractDetails({ ...contractDetails, [e.target.name]: e.target.value });
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const { factoryContract, signer, walletAddress, walletBalance } = useWeb3();
  const navigate = useNavigate();

  const uploadToIPFS = async () => {
    if (!file) {
      setError("Vui lòng chọn file hợp đồng gốc (PDF/Word).");
      return null;
    }
    setStatus("⏳ Đang tải file lên IPFS (Pinata)...");
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
        `Tài khoản không đủ! Bạn có ${currentBalance} ETH nhưng cần ít nhất ${requiredAmount.toFixed(4)} ETH (đã gồm phí Gas).`,
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
      setStatus("✍ Đang tính toán phí Gas...");
      const amountInWei = ethers.parseEther(amount);
      const penaltyInWei = ethers.parseEther(penalty || "0");
      const deadlineTimestamp = Math.floor(new Date(deadline).getTime() / 1000);

      // GOM TOÀN BỘ THÔNG TIN THÀNH 1 CHUỖI JSON ĐỂ LƯU VÀO BIẾN TERMS
      const packedTerms = JSON.stringify(contractDetails);

      // 1. ESTIMATE GAS TRƯỚC: Nếu không đủ tiền gas, nó sẽ văng lỗi ở đây chứ không mở MetaMask
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
        // Bắt lỗi Insufficient funds thường gặp
        if (gasError.message && gasError.message.includes("insufficient funds")) {
          throw new Error("Số dư của bạn không đủ để trả phí mạng lưới (Gas fee). Vui lòng nạp thêm Sepolia ETH!");
        }
        throw new Error("Không thể dự tính phí màng lưới. Giao dịch có thể sẽ thất bại.");
      }

      // 2. KHI GAS OK, YÊU CẦU METAMASK KÝ
      setStatus("✍ Đang chờ MetaMask xác nhận...");
      const tx = await factoryContract.createAgreement(
        receiver,
        packedTerms,
        termsHash,
        deadlineTimestamp,
        penaltyInWei,
        {
          value: amountInWei,
          gasLimit: (gasEstimate * 12n) / 10n // Cộng thêm 20% gas limit margin cho an toàn
        },
      );

      setStatus("🚀 Đang chờ Blockchain xác nhận...");
      await tx.wait();

      setStatus("✅ Thành công! Đang chuyển hướng...");
      setTimeout(() => navigate("/dashboard/contracts"), 2000);
    } catch (err) {
      console.error(err);
      setError("❌ Giao dịch thất bại: " + (err.reason || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        Khởi tạo hợp đồng kỹ thuật số
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* THÔNG TIN BLOCKCHAIN (Người nhận, Tiền, Hạn chót) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100">
          <h2 className="text-lg font-bold text-black-800 mb-4 border-b border-blue-50 pb-2">
            1. Thông số Smart Contract
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Ví Người nhận (Bên B)
              </label>
              <input
                type="text"
                required
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Ký quỹ (ETH)
              </label>
              <input
                type="number"
                step="0.0001"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 font-bold text-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Phạt trễ (ETH)
              </label>
              <input
                type="number"
                step="0.0001"
                required
                value={penalty}
                onChange={(e) => setPenalty(e.target.value)}
                placeholder="0.0"
                className="w-full px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl outline-none focus:border-red-500 text-red-600"
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Hạn chót cam kết
              </label>
              <input
                type="datetime-local"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500"
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                File Hợp đồng gốc (PDF có dấu)
              </label>
              <input
                type="file"
                required
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm 
                file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* THÔNG TIN CHI TIẾT HỢP ĐỒNG (Bên A, Bên B) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* BÊN A */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
              2. Thông tin Bên Bán / Bên Gửi (Bên A)
            </h2>
            <div className="space-y-3">
              <input
                type="text"
                name="partyA_name"
                value={contractDetails.partyA_name}
                onChange={handleDetailChange}
                placeholder="Tên Công ty / Cá nhân"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
              />
              <input
                type="text"
                name="partyA_address"
                value={contractDetails.partyA_address}
                onChange={handleDetailChange}
                placeholder="Địa chỉ trụ sở"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  name="partyA_mst"
                  value={contractDetails.partyA_mst}
                  onChange={handleDetailChange}
                  placeholder="Mã số thuế"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  name="partyA_rep"
                  value={contractDetails.partyA_rep}
                  onChange={handleDetailChange}
                  placeholder="Người đại diện"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* BÊN B */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
              3. Thông tin Bên Mua / Bên Nhận (Bên B)
            </h2>
            <div className="space-y-3">
              <input
                type="text"
                name="partyB_name"
                value={contractDetails.partyB_name}
                onChange={handleDetailChange}
                placeholder="Tên Công ty / Cá nhân"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
              />
              <input
                type="text"
                name="partyB_address"
                value={contractDetails.partyB_address}
                onChange={handleDetailChange}
                placeholder="Địa chỉ trụ sở"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  name="partyB_mst"
                  value={contractDetails.partyB_mst}
                  onChange={handleDetailChange}
                  placeholder="Mã số thuế"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  name="partyB_rep"
                  value={contractDetails.partyB_rep}
                  onChange={handleDetailChange}
                  placeholder="Người đại diện"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* CÁC ĐIỀU KHOẢN */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
            4. Các điều khoản thỏa thuận
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">
                Điều 1: Tên hàng, số lượng, chất lượng
              </label>
              <textarea
                name="art1_items"
                rows="2"
                value={contractDetails.art1_items}
                onChange={handleDetailChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                placeholder="VD: 100 tấn thép cuộn..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">
                Điều 2: Quy cách đóng gói
              </label>
              <textarea
                name="art2_packaging"
                rows="2"
                value={contractDetails.art2_packaging}
                onChange={handleDetailChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                placeholder="VD: Đóng container 20 feet..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">
                Điều 3: Giá cả hàng hóa
              </label>
              <textarea
                name="art3_price"
                rows="2"
                value={contractDetails.art3_price}
                onChange={handleDetailChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                placeholder="VD: 50.000.000 VND / tấn..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">
                Điều 4: Thời gian & Địa điểm giao hàng
              </label>
              <textarea
                name="art4_delivery"
                rows="2"
                value={contractDetails.art4_delivery}
                onChange={handleDetailChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                placeholder="Giao tại kho B, thời gian hoàn thành..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">
                Điều 5: Phương thức thanh toán
              </label>
              <textarea
                name="art5_payment"
                rows="2"
                value={contractDetails.art5_payment}
                onChange={handleDetailChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                placeholder="VD: Chuyển khoản, thanh toán thành 2 đợt..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">
                Điều 6.1: Trách nhiệm Bên A
              </label>
              <textarea
                name="art6_respA"
                rows="2"
                value={contractDetails.art6_respA}
                onChange={handleDetailChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                placeholder="Giao hàng đúng hạn..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">
                Điều 6.2: Trách nhiệm Bên B
              </label>
              <textarea
                name="art6_respB"
                rows="2"
                value={contractDetails.art6_respB}
                onChange={handleDetailChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                placeholder="Thanh toán đúng cam kết..."
              />
            </div>
            <div className="md:col-span-2 bg-blue-50/30 p-4 rounded-xl border border-blue-100">
              <label className="block text-xs font-bold text-blue-700 uppercase mb-2 flex items-center gap-1">
                Điều 7: Điều khoản chung
              </label>
              <textarea
                name="art7_general"
                rows="6"
                value={contractDetails.art7_general}
                onChange={handleDetailChange}
                className="w-full px-4 py-3 bg-white border border-blue-100 rounded-xl outline-none focus:border-blue-500 shadow-sm text-gray-700 leading-relaxed"
                placeholder="Các cam kết chung giữa hai bên..."
              />
            </div>
          </div>
        </div>

        {/* NÚT SUBMIT CHUẨN */}
        <div className="pt-2">
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl text-sm font-bold border border-red-200 flex items-center gap-2">
              <i className="uil uil-exclamation-octagon text-xl"></i> {error}
            </div>
          )}
          {status && (
            <div className="mb-4 p-4 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold border border-blue-200 flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>{" "}
              {status}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200"}`}
          >
            {loading ? "Đang xử lý giao dịch..." : "Ký & Khởi tạo hợp đồng"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateContractPage;
