import React from "react";

const ContractFilters = ({ currentFilter, onFilterChange }) => {
  const filters = ["all", "client", "provider", "receiver"];

  return (
    <div className="flex flex-wrap sm:flex-nowrap gap-1 bg-gray-100 p-1 mb-6 rounded-xl w-full sm:w-fit overflow-x-auto custom-scrollbar">
      {filters.map((role) => (
        <button
          key={role}
          onClick={() => onFilterChange(role)}
          className={`px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-lg capitalize transition-all cursor-pointer whitespace-nowrap
          ${currentFilter === role
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
            }`}
        >
          {role === "all" ? "Tất cả" : role}
        </button>
      ))}
    </div>
  );
};
export default ContractFilters;
