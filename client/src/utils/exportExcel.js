import * as XLSX from "xlsx-js-style";

const getStatusText = (status) => {
  const map = [
    "Mới tạo (Chờ nhận)",
    "Đã chấp nhận",
    "Đang thực hiện",
    "Đã hoàn thành (Chờ TT)",
    "Đã thanh toán (Xong)",
    "Đã hủy",
  ];
  return map[status] || "Không xác định";
};

const formatDate = (date) => {
  if (!date || date === 0) return "Chưa xác định";
  const d = new Date(
    typeof date === "number" && date < 10000000000 ? date * 1000 : date,
  );
  return d.toLocaleString("vi-VN");
};

// 1. SỬA LẠI HÀM NÀY: BẮT LỖI OBJECT ĐỂ KHÔNG BỊ [object Object]
const parseTerms = (terms) => {
  if (!terms) return null;
  // Nếu dữ liệu từ DB đã là Object rồi thì trả về luôn
  if (typeof terms === "object") return terms;
  try {
    return JSON.parse(terms);
  } catch (error) {
    return null;
  }
};

export const exportContractToExcel = (hydratedContracts, filters, fileName) => {
  const { role, status } = filters;
  const roleText =
    role === "all"
      ? "Tất cả"
      : role === "client"
        ? "Bên Giao"
        : role === "provider"
          ? "Bên Vận Chuyển"
          : role === "receiver"
            ? "Bên Nhận"
            : role;

  const statusText =
    status === "all" ? "Tất cả" : getStatusText(Number(status));

  const exportDate = new Date().toLocaleString("vi-VN");
  const criteriaRows = [
    ["HỆ THỐNG QUẢN LÝ LOGISTICS BLOCKCHAIN"],
    ["BÁO CÁO TỔNG HỢP GIAO DỊCH"],
    [],
    [],
    ["", "", "", "", "", "", "", "", `Ngày xuất: ${exportDate}`],
    ["", "", "", "", "", "", "", "", `Bộ lọc: ${roleText} | ${statusText}`],
    [],
  ];

  // 2. LOGIC LẤY DỮ LIỆU AN TOÀN TUYỆT ĐỐI
  const dataToExport = hydratedContracts.map((c, index) => {
    let isLateText = "Đúng hạn";
    if (c.deadline && c.status < 4 && Date.now() / 1000 > c.deadline) {
      isLateText = "⚠ ĐÃ TRỄ HẠN";
    } else if (c.status >= 4 && c.isLate) {
      isLateText = "Đã bị phạt trễ";
    }

    const parsedTerms = parseTerms(c.terms);

    // Trích xuất Tên Hàng Hóa an toàn
    let itemsDisplay = "Không có nội dung";
    if (parsedTerms) {
      if (parsedTerms.art1_items !== undefined) {
        itemsDisplay =
          typeof parsedTerms.art1_items === "object"
            ? JSON.stringify(parsedTerms.art1_items)
            : parsedTerms.art1_items || "Không có nội dung";
      } else if (parsedTerms.goods) {
        itemsDisplay = parsedTerms.goods;
      } else if (parsedTerms.title) {
        itemsDisplay = parsedTerms.title;
      }
    } else if (typeof c.terms === "string") {
      try {
        JSON.parse(c.terms);
        itemsDisplay = "Không có nội dung";
      } catch (e) {
        itemsDisplay = c.terms || "Không có nội dung";
      }
    }

    // Trích xuất Bên Giao an toàn (Khắc phục lỗi undefined)
    let clientWallet = c.client || "";
    let clientDisplay = clientWallet
      ? `(Ví: ${clientWallet})`
      : "Không xác định";
    if (parsedTerms && parsedTerms.partyA_name) {
      clientDisplay = `${parsedTerms.partyA_name}\n${clientDisplay}`;
    }

    // Trích xuất Bên Nhận an toàn
    let receiverWallet = c.receiver || "";
    let receiverDisplay = receiverWallet
      ? `(Ví: ${receiverWallet})`
      : "Không xác định";
    if (parsedTerms && parsedTerms.partyB_name) {
      receiverDisplay = `${parsedTerms.partyB_name}\n${receiverDisplay}`;
    }

    return {
      STT: index + 1,
      "Mã Hợp Đồng (ID)": c.contractAddress || "N/A",
      "Tên hàng": itemsDisplay,
      "Bên Giao (Bên A)": clientDisplay,
      "Bên Vận Chuyển":
        c.provider &&
        c.provider !== "0x0000000000000000000000000000000000000000"
          ? c.provider
          : "Chưa nhận việc",
      "Bên Nhận (Bên B)": receiverDisplay,
      "Giá trị (ETH)": c.amount || 0,
      "Phạt (ETH)": c.penalty || 0,
      "Trạng thái": getStatusText(c.status),
      "Tiến độ": isLateText,
      "Ngày khởi tạo": formatDate(c.createdAt),
      "Hạn chót": formatDate(c.deadline) || "Chưa đồng bộ",
    };
  });

  const worksheet = XLSX.utils.aoa_to_sheet(criteriaRows);
  XLSX.utils.sheet_add_json(worksheet, dataToExport, { origin: "A9" });

  worksheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 11 } },
    { s: { r: 4, c: 8 }, e: { r: 4, c: 11 } },
    { s: { r: 5, c: 8 }, e: { r: 5, c: 11 } },
  ];

  const wscols = [
    { wch: 8 }, // STT
    { wch: 55 }, // Mã hợp đồng
    { wch: 65 }, // Tên hàng
    { wch: 60 }, // Bên Giao
    { wch: 60 }, // Bên Vận Chuyển
    { wch: 60 }, // Bên Nhận
    { wch: 15 }, // Giá trị (ETH)
    { wch: 15 }, // Phạt (ETH)
    { wch: 22 }, // Trạng thái
    { wch: 18 }, // Tiến độ
    { wch: 20 }, // Ngày khởi tạo
    { wch: 20 }, // Hạn chót
  ];
  worksheet["!cols"] = wscols;

  worksheet["!rows"] = [
    { hpt: 40 }, // Chiều cao hàng 1 (index 0)
    { hpt: 50 }, // Chiều cao hàng 2 (index 1)
  ];

  const range = XLSX.utils.decode_range(worksheet["!ref"]);

  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = { c: C, r: R };
      const cellRef = XLSX.utils.encode_cell(cellAddress);

      if (!worksheet[cellRef]) continue;

      worksheet[cellRef].s = {
        font: { name: "Arial", sz: 11 },
        alignment: { wrapText: true, vertical: "center", horizontal: "center" },
      };

      if (R === 0 && C === 0) {
        worksheet[cellRef].s.font = {
          name: "Arial",
          sz: 14,
          bold: true,
          color: { rgb: "003366" },
        };
        worksheet[cellRef].s.alignment = {
          horizontal: "left",
          vertical: "center",
        };
      }

      if (R === 1 && C === 0) {
        worksheet[cellRef].s.font = {
          name: "Arial",
          sz: 18,
          bold: true,
          color: { rgb: "FF0000" },
        };
        worksheet[cellRef].s.alignment = {
          horizontal: "center",
          vertical: "center",
        };
      }

      if ((R === 4 || R === 5) && C === 8) {
        worksheet[cellRef].s.font = {
          name: "Arial",
          sz: 11,
          italic: true,
          color: { rgb: "555555" },
        };
        worksheet[cellRef].s.alignment = {
          horizontal: "right",
          vertical: "center",
        };
      }

      if (R === 8) {
        worksheet[cellRef].s.font = {
          name: "Arial",
          sz: 11,
          bold: true,
          color: { rgb: "FFFFFF" },
        };
        worksheet[cellRef].s.fill = { fgColor: { rgb: "4F81BD" } };
        worksheet[cellRef].s.alignment = {
          horizontal: "center",
          vertical: "center",
          wrapText: true,
        };
        worksheet[cellRef].s.border = {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        };
      }

      if (R > 8) {
        worksheet[cellRef].s.border = {
          top: { style: "thin", color: { rgb: "BFBFBF" } },
          bottom: { style: "thin", color: { rgb: "BFBFBF" } },
          left: { style: "thin", color: { rgb: "BFBFBF" } },
          right: { style: "thin", color: { rgb: "BFBFBF" } },
        };
        // Ngoại lệ: Cột Tên Hàng hóa để căn trái cho dễ nhìn vì nội dung dài
        if (C === 2) {
          worksheet[cellRef].s.alignment = {
            horizontal: "left",
            vertical: "center",
            wrapText: true,
          };
        }
      }
    }
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "DS Hop Dong");
  XLSX.writeFile(workbook, `${fileName}_${Date.now()}.xlsx`);
};
