import React from "react";

const ContractListHeader = ({ onCreate }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <i className="uil uil-list-ul text-blue-600"></i> Quản lý Hợp đồng
      </h1>
      <button
        onClick={onCreate}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
      >
        + Tạo mới
      </button>
    </div>
  );
};
export default ContractListHeader;
