import React from "react";

const ContractListHeader = ({ onCreate }) => {
  return (
    // Thay đổi: thêm flex-col (cột dọc ở mobile) và sm:flex-row (hàng ngang ở máy tính)
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <i className="uil uil-list-ul text-blue-600"></i>
        <span>Quản lý Hợp đồng</span>
      </h1>

      {/* Nút full chiều rộng ở mobile cho dễ bấm */}
      <button
        onClick={onCreate}
        className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer flex justify-center items-center gap-2"
      >
        <i className="uil uil-plus-circle text-lg"></i> Tạo mới
      </button>
    </div>
  );
};
export default ContractListHeader;
