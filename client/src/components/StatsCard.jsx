import React from "react";

const StatsCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400",
    green: "bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400",
    purple: "bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400",
    orange: "bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400",
    indigo: "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400",
    slate: "bg-slate-50 dark:bg-slate-950/20 text-slate-600 dark:text-slate-400",
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
      <div className="flex flex-col justify-between h-full">
        {/* min-h để giữ chỗ cho title 2 dòng nếu cần */}
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider leading-relaxed">
          {title}
        </p>
        <h4 className="text-2xl font-bold text-gray-800 dark:text-white mt-2">{value}</h4>
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
