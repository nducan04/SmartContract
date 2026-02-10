import * as XLSX from "xlsx";

// Hàm định dạng ngày tháng
const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("vi-VN");
};

// Hàm chuyển đổi trạng thái số sang chữ
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
  fileName = "DanhSachHopDong",
) => {
  // 1. Chuẩn bị dữ liệu (Mapping)
  // Chuyển đổi dữ liệu thô thành dữ liệu hiển thị trên Excel
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

  // 2. Tạo Sheet từ dữ liệu JSON
  const worksheet = XLSX.utils.json_to_sheet(dataToExport);

  // 3. Tùy chỉnh độ rộng cột (Optional - cho đẹp)
  const wscols = [
    { wch: 5 }, // STT
    { wch: 45 }, // Mã HĐ
    { wch: 30 }, // Nội dung
    { wch: 15 }, // Ngày tạo
    { wch: 45 }, // Client
    { wch: 45 }, // Provider
    { wch: 45 }, // Receiver
    { wch: 15 }, // Giá trị
    { wch: 20 }, // Trạng thái
    { wch: 50 }, // Link
  ];
  worksheet["!cols"] = wscols;

  // 4. Tạo Workbook và thêm Sheet vào
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Danh sách Hợp đồng");

  // 5. Xuất file
  XLSX.writeFile(workbook, `${fileName}_${new Date().getTime()}.xlsx`);
};
