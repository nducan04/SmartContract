import * as XLSX from "xlsx-js-style";
import { ethers } from "ethers";

const formatDate = (timestamp) => {
  if (!timestamp) return "";
  if (timestamp.toString().length === 10) {
    return new Date(Number(timestamp) * 1000).toLocaleDateString("vi-VN");
  }
  return new Date(timestamp).toLocaleDateString("vi-VN");
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

const parseTerms = (termsString) => {
  try {
    const parsed = JSON.parse(termsString);
    if (parsed && typeof parsed === "object" && "partyA_name" in parsed)
      return parsed;
    return null;
  } catch (error) {
    return null;
  }
};

export const exportContractToExcel = async (
  contracts,
  filters,
  fileName = "BaoCao_HopDong",
) => {
  alert(
    "Hệ thống đang trích xuất dữ liệu chi tiết từ Blockchain. Vui lòng đợi trong giây lát...",
  );

  // 1. KÉO DỮ LIỆU TỪ BLOCKCHAIN CHO CÁC HỢP ĐỒNG BỊ THIẾU JSON
  const rpcProvider = new ethers.JsonRpcProvider(
    "https://ethereum-sepolia-rpc.publicnode.com",
  );
  const abi = [
    "function getAgreementDetails() view returns (uint8, address, address, address, uint256, string terms)",
  ];

  const hydratedContracts = await Promise.all(
    contracts.map(async (c) => {
      if (!c.terms || !c.terms.includes("partyA_name")) {
        try {
          const sc = new ethers.Contract(c.contractAddress, abi, rpcProvider);
          const data = await sc.getAgreementDetails();
          return { ...c, terms: data[5] };
        } catch (e) {
          return c;
        }
      }
      return c;
    }),
  );

  // 2. CHUẨN HÓA VĂN BẢN CHO TIÊU CHÍ LỌC (Fix lỗi lủng củng)
  const roleMap = {
    client: "Người giao (Bên A)",
    provider: "Đơn vị vận chuyển",
    receiver: "Người nhận (Bên B)",
    all: "Tất cả các vai trò",
  };
  const roleText = roleMap[filters.role] || "Tất cả";

  const statusText =
    filters.status !== "all"
      ? getStatusText(Number(filters.status))
      : "Tất cả trạng thái";

  // Xử lý logic câu chữ thời gian cho mượt mà
  let timeText = "Toàn bộ thời gian";
  if (filters.startDate || filters.endDate) {
    const s = filters.startDate
      ? new Date(filters.startDate).toLocaleDateString("vi-VN")
      : "Bắt đầu";
    const e = filters.endDate
      ? new Date(filters.endDate).toLocaleDateString("vi-VN")
      : "Hiện tại";
    timeText = `Từ ngày ${s} đến ${e}`;
  }

  // 3. TẠO HEADER BÁO CÁO
  const criteriaRows = [
    ["BÁO CÁO TỔNG HỢP GIAO DỊCH LOGISTICS BLOCKCHAIN"],
    [],
    ["--- THÔNG TIN CHI TIẾT ---"],
    ["Người xuất:", "Hệ thống VTSC"],
    ["Ngày xuất:", new Date().toLocaleString("vi-VN")],
    ["Tổng số lượng HĐ:", hydratedContracts.length],
    [],
    ["--- TIÊU CHÍ LỌC DỮ LIỆU ---"],
    ["Vai trò tham gia:", roleText],
    ["Trạng thái hợp đồng:", statusText],
    ["Khoảng thời gian:", timeText],
    [],
  ];

  // 4. ĐỔ DỮ LIỆU VÀO CÁC CỘT
  const dataToExport = hydratedContracts.map((c, index) => {
    let isLateText = "Đúng hạn";
    if (c.deadline && c.status < 4 && Date.now() / 1000 > c.deadline) {
      isLateText = "⚠ ĐÃ TRỄ HẠN";
    } else if (c.status >= 4 && c.isLate) {
      isLateText = "Đã bị phạt trễ";
    }

    const parsedTerms = parseTerms(c.terms);
    const clientDisplay = parsedTerms
      ? `${parsedTerms.partyA_name}\n(Ví: ${c.client})`
      : c.client;
    const receiverDisplay = parsedTerms
      ? `${parsedTerms.partyB_name}\n(Ví: ${c.receiver})`
      : c.receiver;
    const itemsDisplay = parsedTerms
      ? parsedTerms.art1_items
      : c.terms || "Không có nội dung";
    const packagingDisplay = parsedTerms
      ? parsedTerms.art2_packaging
      : "Không có dữ liệu";

    return {
      STT: index + 1,
      "Mã Hợp Đồng (ID)": c.contractAddress,
      "Tên Hàng Hóa / Dịch vụ": itemsDisplay,
      "Quy cách đóng gói": packagingDisplay,
      "Bên Giao (Bên A)": clientDisplay,
      "Bên Vận Chuyển":
        c.provider &&
          c.provider !== "0x0000000000000000000000000000000000000000"
          ? c.provider
          : "Chưa nhận việc",
      "Bên Nhận (Bên B)": receiverDisplay,
      "Giá trị (ETH)": c.amount,
      "Phạt vi phạm (ETH)": c.penalty || 0,
      "Trạng thái": getStatusText(c.status),
      "Tiến độ": isLateText,
      "Ngày khởi tạo": formatDate(c.createdAt),
      "Hạn chót cam kết": formatDate(c.deadline) || "Chưa đồng bộ",
    };
  });

  const worksheet = XLSX.utils.aoa_to_sheet(criteriaRows);
  XLSX.utils.sheet_add_json(worksheet, dataToExport, { origin: "A10" });

  // 5. CHỈNH ĐỘ RỘNG CỘT (Cho nội dung hiển thị thoải mái)
  const wscols = [
    { wch: 5 }, // STT
    { wch: 45 }, // ID
    { wch: 40 }, // Hàng hóa
    { wch: 30 }, // Đóng gói
    { wch: 45 }, // Bên A
    { wch: 45 }, // Vận chuyển
    { wch: 45 }, // Bên B
    { wch: 15 }, // Giá trị
    { wch: 18 }, // Phạt
    { wch: 20 }, // Trạng thái
    { wch: 18 }, // Tiến độ
    { wch: 15 }, // Ngày tạo
    { wch: 18 }, // Hạn chót
  ];
  worksheet["!cols"] = wscols;

  for (const cellAddress in worksheet) {
    if (cellAddress[0] === "!") continue; // Bỏ qua các config nội bộ của thư viện

    // Nếu ô đó chưa có thuộc tính style (s), tạo mới
    if (!worksheet[cellAddress].s) worksheet[cellAddress].s = {};

    // Bật Wrap Text (xuống dòng) và Vertical Top (Căn sát mép trên)
    worksheet[cellAddress].s = {
      alignment: {
        wrapText: true,
        vertical: "top"
      },
      font: { name: "Arial", sz: 11 }
    };
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "DS Hop Dong");
  XLSX.writeFile(workbook, `${fileName}_${Date.now()}.xlsx`);
};
