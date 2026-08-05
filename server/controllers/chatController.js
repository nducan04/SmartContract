import { GoogleGenAI } from "@google/genai";
import Contract from "../models/Contract.js";

const SYSTEM_PROMPT = `Bạn là trợ lý AI thông minh của hệ thống "Logistics Smart Contract DApp" - một nền tảng quản lý hợp đồng vận chuyển & giao nhận hàng hóa trên Blockchain Ethereum (mạng Sepolia Testnet).

THÔNG TIN HỆ THỐNG:
- Hệ thống sử dụng Smart Contract (Solidity) để ký kết, theo dõi và thanh toán tự động các hợp đồng vận chuyển.
- Có 3 vai trò: Bên A (Client/Người tạo), Bên vận chuyển (Provider) và Bên B (Receiver/Người nhận).
- Luồng hợp đồng: Tạo mới (0) → Chấp nhận (1) → Đang thực hiện (2) → Hoàn thành (3) → Đã thanh toán (4). Ngoài ra có trạng thái Đã hủy (5).
- Người dùng kết nối ví Metamask để tương tác với Blockchain.
- Hệ thống hỗ trợ: Ký quỹ (deposit), Phạt trễ hạn (penalty), Upload minh chứng lên IPFS, Theo dõi hành trình GPS, Xuất báo cáo PDF/Excel.
- Trang "Sàn giao dịch" (Marketplace) cho phép bên vận chuyển nhận việc từ các hợp đồng đang chờ.

HƯỚNG DẪN SỬ DỤNG CƠ BẢN:
1. Kết nối ví Metamask (mạng Sepolia Testnet) bằng nút "Kết nối ví" trên Navbar.
2. Vào Dashboard → Danh sách hợp đồng → Tạo mới để khởi tạo hợp đồng.
3. Điền thông tin bên A, bên B, các điều khoản, ký quỹ ETH và ký bằng Metamask.
4. Bên vận chuyển có thể nhận việc từ Sàn giao dịch.
5. Theo dõi tiến độ qua thanh trạng thái (Stepper) và bản đồ GPS.
6. Khi hoàn thành, Bên A xác nhận thanh toán để giải phóng tiền ký quỹ.

XỬ LÝ LỖI THƯỜNG GẶP:
- "Không kết nối được ví": Cài đặt Metamask extension, chuyển sang mạng Sepolia Testnet, refresh trang.
- "Insufficient funds": Nạp thêm Sepolia ETH từ faucet (Google: "Sepolia faucet").
- "Transaction failed": Kiểm tra gas fee đủ không, hoặc quyền thao tác (chỉ người tạo mới có quyền hủy, v.v.).

QUY TẮC TRẢ LỜI:
- Trả lời ngắn gọn, chính xác, thân thiện.
- Nếu người dùng hỏi bằng tiếng Anh, trả lời bằng tiếng Anh. Nếu hỏi bằng tiếng Việt, trả lời bằng tiếng Việt.
- Khi được hỏi về hợp đồng cá nhân, sử dụng dữ liệu CONTRACT_DATA được cung cấp bên dưới (nếu có).
- Không bịa đặt thông tin. Nếu không biết, hãy nói rõ.
- Sử dụng emoji phù hợp để tăng tính thân thiện.`;

export const chatWithAI = async (req, res) => {
  try {
    const { message, walletAddress, history } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      return res.status(500).json({ error: "Chưa cấu hình GEMINI_API_KEY trong .env server." });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Build context with user's contract data if wallet is connected
    let contractContext = "";
    if (walletAddress) {
      const wallet = walletAddress.toLowerCase();
      const contracts = await Contract.find({
        $or: [
          { client: wallet },
          { provider: wallet },
          { receiver: wallet },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      if (contracts.length > 0) {
        const statusMap = [
          "Mới tạo",
          "Đã chấp nhận",
          "Đang thực hiện",
          "Đã hoàn thành",
          "Đã thanh toán",
          "Đã hủy",
        ];

        const summary = contracts.map((c, i) => {
          let role = "Khác";
          if (c.client === wallet) role = "Bên A (Người tạo)";
          else if (c.provider === wallet) role = "Bên vận chuyển";
          else if (c.receiver === wallet) role = "Bên B (Người nhận)";

          let termsInfo = "";
          try {
            const parsed = JSON.parse(c.terms);
            if (parsed && parsed.art1_items) {
              termsInfo = ` | Nội dung: ${parsed.art1_items.substring(0, 80)}`;
            }
          } catch (e) {}

          return `  ${i + 1}. Mã: ${c.contractAddress.substring(0, 10)}... | Vai trò: ${role} | Giá trị: ${c.amount} ETH | Trạng thái: ${statusMap[c.status] || "N/A"}${termsInfo}`;
        });

        contractContext = `\n\nCONTRACT_DATA (Dữ liệu hợp đồng của người dùng ví ${walletAddress}):\n- Tổng số hợp đồng: ${contracts.length}\n${summary.join("\n")}`;
      } else {
        contractContext = `\n\nCONTRACT_DATA: Người dùng (ví ${walletAddress}) chưa có hợp đồng nào trong hệ thống.`;
      }
    }

    // Build conversation history for Gemini
    const contents = [];

    // Add previous conversation history (max 10 messages)
    if (history && Array.isArray(history)) {
      const recentHistory = history.slice(-10);
      for (const msg of recentHistory) {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        });
      }
    }

    // Add the current user message
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents,
        config: {
          systemInstruction: SYSTEM_PROMPT + contractContext,
          maxOutputTokens: 1024,
          temperature: 0.7,
        },
      });
    } catch (modelErr) {
      console.warn("⚠️ Model gemini-flash-latest error, falling back to gemini-flash-lite-latest:", modelErr.message);
      response = await ai.models.generateContent({
        model: "gemini-flash-lite-latest",
        contents,
        config: {
          systemInstruction: SYSTEM_PROMPT + contractContext,
          maxOutputTokens: 1024,
          temperature: 0.7,
        },
      });
    }

    const aiReply = response.text || "Xin lỗi, tôi không thể trả lời lúc này.";

    res.json({ reply: aiReply });
  } catch (error) {
    console.error("❌ Chat AI Error:", error.message || error);
    res.status(500).json({
      error: "Đã xảy ra lỗi khi gọi AI: " + (error.message || "Vui lòng thử lại sau."),
    });
  }
};
