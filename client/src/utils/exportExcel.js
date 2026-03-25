import * as XLSX from "xlsx-js-style";
import { ethers } from "ethers";
import { toast } from "react-hot-toast";

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
  toast.loading(
    "Hệ thống đang trích xuất dữ liệu chi tiết từ Blockchain. Vui lòng đợi trong giây lát...",
    { duration: 4000 }
  );

  // 1. KÉO DỮ LIỆU TỪ BLOCKCHAIN CHO CÁC HỢP ĐỒNG BỊ THIẾU JSON
  const rpcProvider = new ethers.JsonRpcProvider(
    "https://ethereum-sepolia-rpc.publicnode.com",
  );
  const abi = [
    "function getAgreementDetails() view returns (uint8, address, address, address, uint256, string, string, uint256, uint256, bool)",
  ];

  const hydratedContracts = await Promise.all(
    contracts.map(async (c) => {
      // Nếu thiếu terms hoặc deadline thì kéo lại từ Blockchain cho chắc chắn
      if (!c.terms || !c.deadline) {
        try {
          const sc = new ethers.Contract(c.contractAddress, abi, rpcProvider);
          const data = await sc.getAgreementDetails();
          // Map đúng index từ Smart Contract: 5 là terms, 7 là deadline, 8 là penalty, 9 là isLate
          return {
            ...c,
            terms: data[5],
            deadline: Number(data[7]),
            penalty: ethers.formatEther(data[8]),
            isLate: data[9],
            amount: ethers.formatEther(data[4])
          };
        } catch (e) {
          console.error("Lỗi đồng bộ HĐ:", c.contractAddress, e);
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
      "Phạt vi phạm (ETH)": c.penalty || 0,
      "Trạng thái": getStatusText(c.status),
      "Tiến độ": isLateText,
      "Ngày khởi tạo": formatDate(c.createdAt),
      "Hạn chót cam kết": formatDate(c.deadline) || "Chưa đồng bộ",
    };
  });

  const worksheet = XLSX.utils.aoa_to_sheet(criteriaRows);
  XLSX.utils.sheet_add_json(worksheet, dataToExport, { origin: "A14" });

  // 5. CHỈNH ĐỘ RỘNG CỘT (Cho nội dung hiển thị thoải mái)
  const wscols = [
    { wch: 8 },  // STT
    { wch: 45 }, // ID
    { wch: 40 }, // Hàng hóa
    { wch: 30 }, // Quy cách
    { wch: 50 }, // Bên A
    { wch: 45 }, // Vận chuyển
    { wch: 50 }, // Bên B
    { wch: 18 }, // Phạt
    { wch: 20 }, // Trạng thái
    { wch: 18 }, // Tiến độ
    { wch: 15 }, // Ngày tạo
    { wch: 20 }, // Hạn chót
  ];
  worksheet["!cols"] = wscols;

  // 6. GỘP Ô TIÊU ĐỀ
  worksheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 11 } }, // Tiêu đề chính (A1:L1) updated to 12 columns
    { s: { r: 2, c: 0 }, e: { r: 2, c: 1 } },  // Thông tin chi tiết (A3:B3)
    { s: { r: 7, c: 0 }, e: { r: 7, c: 1 } },  // Tiêu chí lọc (A8:B8)
  ];

  // 7. THIẾT LẬP STYLE CHI TIẾT
  const range = XLSX.utils.decode_range(worksheet["!ref"]);

  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!worksheet[cellAddress]) continue;

      // Default style
      worksheet[cellAddress].s = {
        font: { name: "Arial", sz: 11 },
        alignment: { vertical: "top", wrapText: true },
      };

      // Header Table (Row 14 - index 13)
      if (R === 13) {
        worksheet[cellAddress].s = {
          fill: { fgColor: { rgb: "1F4E78" } }, // Dark Blue
          font: { color: { rgb: "FFFFFF" }, bold: true, name: "Arial", sz: 12 },
          alignment: { horizontal: "center", vertical: "center", wrapText: true },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } },
          },
        };
      }
      // Main Title (Row 1 - index 0)
      else if (R === 0) {
        worksheet[cellAddress].s = {
          font: { bold: true, sz: 16, color: { rgb: "1F4E78" }, name: "Arial" },
          alignment: { horizontal: "center", vertical: "center" },
        };
      }
      // Sub Headers (Rows 3, 8 - index 2, 7)
      else if (R === 2 || R === 7) {
        worksheet[cellAddress].s = {
          font: { bold: true, italic: true, sz: 12, color: { rgb: "2E75B6" }, name: "Arial" },
        };
      }
      // Data area (From Row 15 onwards)
      else if (R > 13) {
        const cell = worksheet[cellAddress];
        const isLate = cell.v === "⚠ ĐÃ TRỄ HẠN";

        worksheet[cellAddress].s = {
          ...worksheet[cellAddress].s,
          border: {
            top: { style: "thin", color: { rgb: "E1E1E1" } },
            bottom: { style: "thin", color: { rgb: "E1E1E1" } },
            left: { style: "thin", color: { rgb: "E1E1E1" } },
            right: { style: "thin", color: { rgb: "E1E1E1" } },
          },
          font: {
            ...worksheet[cellAddress].s.font,
            color: isLate ? { rgb: "FF0000" } : { rgb: "333333" },
            bold: isLate
          }
        };

        // Align specific columns
        if (C === 0 || C >= 8) { // STT, Status, Progress, Dates (Adjusted for removed ETH column)
          worksheet[cellAddress].s.alignment.horizontal = "center";
        }
      }
    }
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "DS Hop Dong");
  XLSX.writeFile(workbook, `${fileName}_${Date.now()}.xlsx`);
};
