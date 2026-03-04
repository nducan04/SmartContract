import * as XLSX from "xlsx";

const formatDate = (timestamp) => {
  if (!timestamp) return "";
  // Kiểm tra nếu là dạng timestamp giây (từ blockchain) hay dạng Date string (từ DB)
  if (timestamp.toString().length === 10) {
    return new Date(Number(timestamp) * 1000).toLocaleString("vi-VN");
  }
  return new Date(timestamp).toLocaleString("vi-VN");
};

const getStatusText = (status) => {
  const statusMap = [
    "Mới tạo",
    "Đã chấp nhận",
    "Đang thực hiện",
    "Đã hoàn thành",
    "Đã thanh toán",
    "Đã hủy",
  ];
  return statusMap[status] || "Không rõ";
};

export const exportContractToExcel = (
  contracts,
  filters,
  fileName = "DanhSachHopDong",
) => {
  const roleText =
    filters.role === "client"
      ? "Người gửi"
      : filters.role === "provider"
        ? "Vận chuyển"
        : filters.role === "receiver"
          ? "Người nhận"
          : "Tất cả";
  const startText = filters.startDate ? filters.startDate : "Từ lúc bắt đầu";
  const endText = filters.endDate ? filters.endDate : "Đến hiện tại";
  const statusText =
    filters.status !== "all"
      ? getStatusText(Number(filters.status))
      : "Tất cả trạng thái";

  const criteriaRows = [
    ["BÁO CÁO DANH SÁCH HỢP ĐỒNG LOGISTICS BLOCKCHAIN"],
    [],
    ["--- TIÊU CHÍ TRÍCH XUẤT ---"],
    ["Vai trò tham gia:", roleText],
    ["Trạng thái hợp đồng:", statusText], // Thêm dòng trạng thái
    ["Khoảng thời gian tạo:", `${startText}  đến  ${endText}`],
    ["Tổng số lượng HĐ:", `${contracts.length}`],
    ["Ngày xuất dữ liệu:", new Date().toLocaleString("vi-VN")],
    [],
  ];

  // THÊM NHIỀU CỘT DỮ LIỆU HƠN VÀO ĐÂY
  const dataToExport = contracts.map((c, index) => {
    // Tính toán trễ hạn: Nếu trạng thái chưa thanh toán (< 4) và hiện tại lớn hơn hạn chót
    // Lưu ý: c.deadline lưu trong DB có thể không đồng bộ, nhưng nếu có ta sẽ tính
    let isLateText = "Đúng hạn";
    if (c.deadline && c.status < 4 && Date.now() / 1000 > c.deadline) {
      isLateText = "⚠ ĐÃ TRỄ HẠN";
    } else if (c.status >= 4 && c.isLate) {
      isLateText = "Đã phạt trễ";
    }

    return {
      STT: index + 1,
      "Mã Hợp Đồng Blockchain": c.contractAddress,
      "Tóm tắt Nội dung": c.terms,
      "Ngày khởi tạo": formatDate(c.createdAt),
      "Hạn chót cam kết (Deadline)": formatDate(c.deadline) || "Chưa đồng bộ", // Cột mới
      "Bên Giao (Client)": c.client,
      "Bên Vận Chuyển (Provider)": c.provider || "Chưa có",
      "Bên Nhận (Receiver)": c.receiver,
      "Giá trị (ETH)": c.amount,
      "Phạt vi phạm (ETH)": c.penalty || 0, // Cột mới
      "Trạng thái HĐ": getStatusText(c.status),
      "Đánh giá tiến độ": isLateText, // Cột mới thể hiện có trễ hạn hay không
      "Link File Gốc (IPFS)": `https://gateway.pinata.cloud/ipfs/${c.termsHash}`,
    };
  });

  const worksheet = XLSX.utils.aoa_to_sheet(criteriaRows);
  XLSX.utils.sheet_add_json(worksheet, dataToExport, { origin: "A10" });

  // Mở rộng độ rộng các cột cho phù hợp
  const wscols = [
    { wch: 6 }, // STT
    { wch: 45 }, // ID
    { wch: 35 }, // Nội dung
    { wch: 20 }, // Ngày tạo
    { wch: 20 }, // Hạn chót
    { wch: 45 }, // Client
    { wch: 45 }, // Provider
    { wch: 45 }, // Receiver
    { wch: 15 }, // Giá trị
    { wch: 15 }, // Phạt
    { wch: 20 }, // Trạng thái
    { wch: 20 }, // Đánh giá tiến độ
    { wch: 55 }, // Link
  ];
  worksheet["!cols"] = wscols;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "DS Hợp Đồng Chi Tiết");
  XLSX.writeFile(workbook, `${fileName}_${Date.now()}.xlsx`);
};
