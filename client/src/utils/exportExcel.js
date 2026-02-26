import * as XLSX from "xlsx";

const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("vi-VN");
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

// 1. THÊM THAM SỐ filters VÀO HÀM
export const exportContractToExcel = (
  contracts,
  filters,
  fileName = "DanhSachHopDong",
) => {
  // 2. CHUẨN BỊ THÔNG TIN "TIÊU CHÍ CHỌN" ĐỂ IN LÊN ĐẦU FILE
  const roleText =
    filters.role === "client"
      ? "Người gửi (Client)"
      : filters.role === "provider"
        ? "Vận chuyển (Provider)"
        : filters.role === "receiver"
          ? "Người nhận (Receiver)"
          : "Tất cả";

  const startText = filters.startDate
    ? formatDate(filters.startDate)
    : "Từ lúc bắt đầu";
  const endText = filters.endDate
    ? formatDate(filters.endDate)
    : "Đến hiện tại";

  // Tạo mảng các dòng (Rows) chứa tiêu chí báo cáo
  const criteriaRows = [
    ["BÁO CÁO DANH SÁCH HỢP ĐỒNG LOGISTICS BLOCKCHAIN"],
    [], // Dòng trống cho thoáng
    ["--- BÁO CÁO TIÊU CHÍ CHỌN ---"],
    ["Vai trò lọc:", roleText],
    ["Khoảng thời gian:", `${startText}  đến  ${endText}`],
    ["Tổng số hợp đồng:", `${contracts.length}`],
    ["Ngày xuất báo cáo:", new Date().toLocaleString("vi-VN")],
    [], // Dòng trống
  ];

  // 3. Chuẩn bị dữ liệu bảng như cũ
  const dataToExport = contracts.map((c, index) => ({
    STT: index + 1,
    "Mã Hợp Đồng": c.contractAddress,
    "Nội dung": c.terms,
    "Ngày tạo": formatDate(c.createdAt),
    "Người Gửi (Client)": c.client,
    "Vận Chuyển (Provider)": c.provider,
    "Người Nhận (Receiver)": c.receiver,
    "Giá trị (ETH)": c.amount,
    "Trạng thái": getStatusText(c.status),
    "Link Tài liệu (IPFS)": `https://gateway.pinata.cloud/ipfs/${c.termsHash}`,
  }));

  // 4. GHI DỮ LIỆU VÀO SHEET
  // 4.1. Ghi phần tiêu chí lên trước
  const worksheet = XLSX.utils.aoa_to_sheet(criteriaRows);

  // 4.2. Nối cái bảng dữ liệu vào phía dưới tiêu chí (bắt đầu từ dòng số 9 - ô A9)
  XLSX.utils.sheet_add_json(worksheet, dataToExport, { origin: "A9" });

  // 5. Chỉnh độ rộng cột cho đẹp
  const wscols = [
    { wch: 20 }, // Cột A (Chứa tiêu đề tiêu chí)
    { wch: 45 }, // ID
    { wch: 30 }, // Nội dung
    { wch: 15 }, // Ngày
    { wch: 45 }, // Client
    { wch: 45 }, // Provider
    { wch: 45 }, // Receiver
    { wch: 10 }, // Giá trị
    { wch: 20 }, // Trạng thái
    { wch: 50 }, // Link
  ];
  worksheet["!cols"] = wscols;

  // 6. Xuất file
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "DS Hợp Đồng");
  XLSX.writeFile(workbook, `${fileName}_${Date.now()}.xlsx`);
};
