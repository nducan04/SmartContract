import React from "react";
import { useLanguage } from "../../context/LanguageContext";
import { Download, Plus } from "lucide-react";

const ContractListHeader = ({ onCreate, onExport }) => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Danh sách hợp đồng
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Quản lý và tra cứu các thỏa thuận thông minh trên blockchain
        </p>
      </div>

      <div className="flex items-center gap-2.5 w-full sm:w-auto">
        {/* Nút Xuất Excel */}
        <button
          onClick={onExport}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-750 transition-all shadow-xs active:scale-95 cursor-pointer"
        >
          <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{t("btnExportExcel")}</span>
        </button>

        {/* Nút Tạo mới */}
        <button
          onClick={onCreate}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/25 hover:shadow-lg transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t("btnCreateNew")}</span>
        </button>
      </div>
    </div>
  );
};

export default ContractListHeader;
