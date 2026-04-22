import cron from "node-cron";
import Contract from "../models/Contract.js";
import User from "../models/User.js";
import { sendDeadlineReminderEmail } from "./emailService.js";

export const startCronJobs = () => {
  // Chạy mỗi ngày vào lúc 8:00 sáng: "0 8 * * *"
  cron.schedule("0 8 * * *", async () => {
    console.log("[Cron] Bắt đầu quét các hợp đồng sắp đến hạn...");
    try {
      const now = Math.floor(Date.now() / 1000);
      const fortyEightHoursFromNow = now + 48 * 60 * 60;

      // Tìm các hợp đồng đang giao (status: 2) và hạn chót <= 48h tới
      const expiringContracts = await Contract.find({
        status: 2,
        deliveryDeadline: { $gt: now, $lte: fortyEightHoursFromNow }
      });

      console.log(`[Cron] Tìm thấy ${expiringContracts.length} hợp đồng sắp đến hạn trong vòng 48h tới.`);

      for (const contract of expiringContracts) {
        if (!contract.provider) continue;

        // Tìm email của provider
        const user = await User.findOne({ walletAddress: contract.provider.toLowerCase() });
        if (user && user.email) {
          await sendDeadlineReminderEmail(user.email, contract);
        }
      }
    } catch (error) {
      console.error("[Cron] Lỗi khi quét hợp đồng:", error);
    }
  });
  console.log("Cron jobs đã được khởi động.");
};

// Hàm dùng để test lập tức gọi từ nơi khác (nếu cần)
export const testCronJobNow = async () => {
    console.log("[Test] Quét ngay lập tức...");
    try {
      const now = Math.floor(Date.now() / 1000);
      const fortyEightHoursFromNow = now + 48 * 60 * 60;
      
      const expiringContracts = await Contract.find({
        status: 2,
        deliveryDeadline: { $gt: now, $lte: fortyEightHoursFromNow }
      });
      console.log(`[Test] Tìm thấy ${expiringContracts.length} hợp đồng...`);
      for (const contract of expiringContracts) {
        if (!contract.provider) continue;
        const user = await User.findOne({ walletAddress: contract.provider.toLowerCase() });
        if (user && user.email) {
          await sendDeadlineReminderEmail(user.email, contract);
        }
      }
    } catch (error) {
      console.error(error);
    }
}
