import React from "react";

const ContractFilters = ({ currentFilter, onFilterChange }) => {
  const filters = ["all", "client", "provider", "receiver"];

  return (
    <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
      {filters.map((role) => (
        <button
          key={role}
          onClick={() => onFilterChange(role)}
          className={`px-4 py-2 text-sm font-medium rounded-lg capitalize transition-all cursor-pointer 
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
