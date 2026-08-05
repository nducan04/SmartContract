import React from "react";
import { useLanguage } from "../../context/LanguageContext";

// Thêm prop onExport
const ContractListHeader = ({ onCreate, onExport }) => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="flex gap-3 w-full sm:w-auto">
        {/* Nút Xuất Excel */}
        <button
          onClick={onExport}
          className="flex-1 sm:flex-none bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition-colors shadow-sm cursor-pointer flex justify-center items-center gap-2"
        >
          <i className="uil uil-export"></i> {t("btnExportExcel")}
        </button>

        {/* Nút Tạo mới */}
        <button
          onClick={onCreate}
          className="flex-1 sm:flex-none bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer flex justify-center items-center gap-2"
        >
          <i className="uil uil-plus-circle text-lg"></i> {t("btnCreateNew")}
        </button>
      </div>
    </div>
  );
};
export default ContractListHeader;
