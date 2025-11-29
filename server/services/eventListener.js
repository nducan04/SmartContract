import { ethers } from "ethers";
import Contract from "../models/Contract.js"; // Import Model MongoDB

const factoryAddress = "0x2eF031b983e977F0FD0De43660e4dD46e51D437F";

const factoryABI = [
  "event NewAgreementCreated(address indexed contractAddress, address indexed client, address indexed receiver, uint256 paymentAmount, string termsHash_IPFS)",
];

const startListener = async () => {
  try {
    const rpcUrl =
      process.env.SEPOLIA_RPC_URL ||
      "https://ethereum-sepolia-rpc.publicnode.com";

    // Cấu hình Provider với polling interval (để tránh hỏi quá dồn dập)
    const provider = new ethers.JsonRpcProvider(rpcUrl, undefined, {
      staticNetwork: true,
    });

    // Tạo đối tượng hợp đồng để nghe
    const factoryContract = new ethers.Contract(
      factoryAddress,
      factoryABI,
      provider
    );

    console.log("🎧 Server đang lắng nghe sự kiện trên Blockchain Sepolia...");

    // 4. LẮNG NGHE SỰ KIỆN
    factoryContract.on(
      "NewAgreementCreated",
      async (
        contractAddress,
        client,
        receiver,
        paymentAmount,
        termsHash_IPFS,
        event
      ) => {
        console.log(`🔔 PHÁT HIỆN HỢP ĐỒNG MỚI!`);
        console.log(`   - ID: ${contractAddress}`);
        console.log(`   - Client: ${client}`);

        try {
          // Chuyển đổi số tiền từ Wei (số lớn) sang ETH (số thực)
          const amountInEth = ethers.formatEther(paymentAmount);

          // 5. LƯU VÀO MONGODB
          const newContract = new Contract({
            contractAddress: contractAddress,
            client: client,
            receiver: receiver,
            amount: amountInEth,
            termsHash: termsHash_IPFS,
            status: 0, // 0 tương ứng với trạng thái 'Created' (Mới tạo)
            // provider: null (Mặc định chưa có ai nhận)
          });

          await newContract.save();
          console.log("✅ Đã lưu hợp đồng vào Database thành công!");
        } catch (err) {
          // Lỗi 11000 là lỗi trùng lặp (Duplicate Key) - nghĩa là đã lưu rồi
          if (err.code === 11000) {
            console.log("⚠️ Hợp đồng này đã tồn tại trong DB, bỏ qua.");
          } else {
            console.error("❌ Lỗi khi lưu vào DB:", err.message);
          }
        }
      }
    );
  } catch (error) {
    console.error("❌ Lỗi khởi động Listener:", error.message);
  }
};

export default startListener;
