import React from "react";

const StatsCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
      <div className="flex flex-col justify-between h-full">
        {/* min-h để giữ chỗ cho title 2 dòng nếu cần */}
        <p className="text-sm text-gray-500 font-medium uppercase tracking-wider leading-relaxed">
          {title}
        </p>
        <h4 className="text-2xl font-bold text-gray-800 mt-2">{value}</h4>
      </div>

      <div
        className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
          colorClasses[color] || colorClasses.blue
        }`}
      >
        <i className={`uil ${icon}`}></i>
      </div>
    </div>
  );
};

export default StatsCard;
