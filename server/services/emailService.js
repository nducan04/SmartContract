import nodemailer from "nodemailer";
import "dotenv/config";

// Cấu hình transporter (có thể dùng biến môi trường để an toàn)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL, // email của bạn
    pass: process.env.SMTP_PASSWORD, // App Password
  },
});

export const sendDeadlineReminderEmail = async (email, contract) => {
  const isSmtpConfigured = process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD;

  const mailOptions = {
    from: `"Smart Contract Logistics" <${process.env.SMTP_EMAIL || "no-reply@logistics.dapp"}>`,
    to: email,
    subject: `[Nhắc nhở] Hợp đồng ${contract.contractAddress} sắp đến hạn!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #d97706; text-align: center;">⏰ Nhắc Nhở Hạn Chót Vận Chuyển</h2>
        <p>Chào bạn,</p>
        <p>Hệ thống nhận thấy bạn có một hợp đồng vận chuyển sắp đến hạn chót. Vui lòng kiểm tra và hoàn thành việc giao hàng để tránh bị phạt tiền ký quỹ.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; width: 40%;">Mã hợp đồng:</td>
            <td style="padding: 10px; border: 1px solid #ddd; word-break: break-all;">${contract.contractAddress}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Hạn chót:</td>
            <td style="padding: 10px; border: 1px solid #ddd; color: red;">${new Date(contract.deliveryDeadline * 1000).toLocaleString("vi-VN")}</td>
          </tr>
        </table>
        
        <p style="margin-top: 20px;">Vui lòng truy cập DApp và cập nhật trạng thái hợp đồng.</p>
        <p>Trân trọng,<br/>Đội ngũ Smart Contract Logistics</p>
      </div>
    `,
  };

  if (isSmtpConfigured) {
    try {
      await transporter.sendMail(mailOptions);
      console.log(`Đã gửi email nhắc nhở đến: ${email}`);
    } catch (error) {
      console.error("Lỗi khi gửi email:", error);
    }
  } else {
    // Fallback in ra console nếu chưa cấu hình SMTP
    console.log("\n---------------------------------------------------");
    console.log("[TESTING MODE] Đã giả lập gửi Email thay vì gửi thật do chưa cấu hình SMTP_EMAIL");
    console.log(`TO: ${email}`);
    console.log(`SUBJECT: ${mailOptions.subject}`);
    console.log("---------------------------------------------------\n");
  }
};
