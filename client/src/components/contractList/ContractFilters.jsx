import React from "react";
import { useLanguage } from "../../context/LanguageContext";

const ContractFilters = ({ currentFilter, onFilterChange }) => {
  const { t } = useLanguage();
  const filters = ["all", "client", "provider", "receiver"];

  const getFilterLabel = (role) => {
    switch (role) {
      case "all": return t("filterRoleAll");
      case "client": return t("filterRoleClient");
      case "provider": return t("filterRoleProvider");
      case "receiver": return t("filterRoleReceiver");
      default: return role;
    }
  };

  return (
    <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl w-full sm:w-fit overflow-x-auto border border-slate-200/60 dark:border-slate-700/60 shadow-xs mb-6">
      {filters.map((role) => {
        const isActive = currentFilter === role;
        return (
          <button
            key={role}
            onClick={() => onFilterChange(role)}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap select-none
            ${
              isActive
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {getFilterLabel(role)}
          </button>
        );
      })}
    </div>
  );
};

export default ContractFilters;
