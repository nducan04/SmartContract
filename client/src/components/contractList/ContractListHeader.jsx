import React from "react";

// Thêm prop onExport
const ContractListHeader = ({ onCreate, onExport }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <i className="uil uil-list-ul text-blue-600"></i>
        <span>Quản lý hợp đồng</span>
      </h1>

      <div className="flex gap-3 w-full sm:w-auto">
        {/* Nút Xuất Excel */}
        <button
          onClick={onExport}
          className="flex-1 sm:flex-none bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition-colors shadow-sm cursor-pointer flex justify-center items-center gap-2"
        >
          <i className="uil uil-export"></i> Xuất Excel
        </button>

        {/* Nút Tạo mới */}
        <button
          onClick={onCreate}
          className="flex-1 sm:flex-none bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer flex justify-center items-center gap-2"
        >
          <i className="uil uil-plus-circle text-lg"></i> Tạo mới
        </button>
      </div>
    </div>
  );
};
export default ContractListHeader;
