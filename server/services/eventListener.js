import { ethers } from "ethers";
import Contract from "../models/Contract.js";

const factoryAddress = "0x1e68d9AE7Aa89a581C971471741Baa976195A312";

const factoryABI = [
  "event NewAgreementCreated(address indexed contractAddress, address indexed client, address indexed receiver, uint256 paymentAmount, string termsHash_IPFS, uint256 deliveryDeadline, uint256 penaltyAmount)",
];

const startListener = async () => {
  try {
    const rpcUrl =
      process.env.SEPOLIA_RPC_URL ||
      "https://ethereum-sepolia-rpc.publicnode.com";

    // Cấu hình Provider
    const provider = new ethers.JsonRpcProvider(rpcUrl, undefined, {
      staticNetwork: true,
    });

    // Tạo đối tượng hợp đồng để nghe
    const factoryContract = new ethers.Contract(
      factoryAddress,
      factoryABI,
      provider
    );

    console.log(
      "🎧 Server đang lắng nghe sự kiện (V2) trên Blockchain Sepolia..."
    );

    // 3. CẬP NHẬT HÀM CALLBACK (Nhận đủ 7 tham số + event)
    factoryContract.on(
      "NewAgreementCreated",
      async (
        contractAddress,
        client,
        receiver,
        paymentAmount,
        termsHash_IPFS,
        deliveryDeadline, // Mới
        penaltyAmount, // Mới
        event
      ) => {
        console.log(`🔔 PHÁT HIỆN HỢP ĐỒNG MỚI (V2)!`);
        console.log(`   - ID: ${contractAddress}`);

        try {
          // Chuyển đổi số tiền từ Wei sang ETH
          const amountInEth = ethers.formatEther(paymentAmount);

          // 4. LƯU VÀO MONGODB
          // (Hiện tại chúng ta lưu các trường cơ bản, nếu Model chưa update deadline/penalty thì nó sẽ tự bỏ qua 2 trường mới, không sao cả)
          const newContract = new Contract({
            contractAddress: contractAddress,
            client: client.toLowerCase(), // Quan trọng: lowercase
            receiver: receiver.toLowerCase(), // Quan trọng: lowercase
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
  }
};

export default startListener;
