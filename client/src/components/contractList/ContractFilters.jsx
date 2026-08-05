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
    <div className="flex flex-wrap sm:flex-nowrap gap-1 bg-gray-100 p-1 mb-6 rounded-xl w-full sm:w-fit overflow-x-auto custom-scrollbar">
      {filters.map((role) => (
        <button
          key={role}
          onClick={() => onFilterChange(role)}
          className={`px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap
          ${currentFilter === role
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
            }`}
        >
          {getFilterLabel(role)}
        </button>
      ))}
    </div>
  );
};
export default ContractFilters;
