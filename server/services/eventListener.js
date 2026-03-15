import { ethers } from "ethers";
import Contract from "../models/Contract.js";

const factoryAddress = "0x1e68d9AE7Aa89a581C971471741Baa976195A312";

const factoryABI = [
  "event NewAgreementCreated(address indexed contractAddress, address indexed client, address indexed receiver, uint256 paymentAmount, string termsHash_IPFS, uint256 deliveryDeadline, uint256 penaltyAmount)",
];

let provider = null;
let factoryContract = null;
let keepAliveInterval = null;

const startListener = async () => {
  try {
    const rpcUrl =
      process.env.SEPOLIA_RPC_URL ||
      "https://ethereum-sepolia-rpc.publicnode.com";

    // Khởi tạo RPC Provider mới
    provider = new ethers.JsonRpcProvider(rpcUrl, undefined, {
      staticNetwork: true,
    });

    factoryContract = new ethers.Contract(
      factoryAddress,
      factoryABI,
      provider
    );

    console.log("🎧 Server đang lắng nghe sự kiện (V2) trên Blockchain Sepolia...");

    // CƠ CHẾ AUTO-RECONNECT VÀ GIỮ KẾT NỐI
    if (keepAliveInterval) clearInterval(keepAliveInterval);
    
    // Ping mỗi 30s để giữ kết nối RPC không bị ngủ (timeout)
    keepAliveInterval = setInterval(async () => {
      try {
        await provider.getBlockNumber();
      } catch (error) {
        console.warn("⚠️ RPC Provider mất kết nối. Đang thử kết nối lại...");
        clearInterval(keepAliveInterval);
        if (factoryContract) {
          factoryContract.removeAllListeners();
        }
        // Gọi lại hàm để tạo kết nối mới
        setTimeout(startListener, 5000);
      }
    }, 30000);

    // LẮNG NGHE SỰ KIỆN TỪ BLOCKCHAIN
    factoryContract.on(
      "NewAgreementCreated",
      async (
        contractAddress,
        client,
        receiver,
        paymentAmount,
        termsHash_IPFS,
        deliveryDeadline,
        penaltyAmount,
        event
      ) => {
        console.log(`🔔 PHÁT HIỆN HỢP ĐỒNG MỚI (V2)!`);
        console.log(`   - ID: ${contractAddress}`);

        try {
          // Chuyển đổi số tiền từ Wei sang ETH
          const amountInEth = ethers.formatEther(paymentAmount);

          // LƯU VÀO MONGODB
          const newContract = new Contract({
            contractAddress: contractAddress,
            client: client.toLowerCase(),
            receiver: receiver.toLowerCase(),
            amount: amountInEth,
            termsHash: termsHash_IPFS,
            status: 0, // 0 = Created
          });

          await newContract.save();
          console.log("✅ Đã lưu hợp đồng vào Database thành công!");
        } catch (err) {
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
    console.log("🔄 Thử khởi động lại Listener sau 5 giây...");
    setTimeout(startListener, 5000);
  }
};

export default startListener;
