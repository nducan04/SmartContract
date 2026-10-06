import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useLanguage } from "../context/LanguageContext";
import { PieChart as PieChartIcon, PlusCircle, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const ContractStatusChart = ({
  contracts = [],
  statusDistribution = null,
  totalContracts = undefined,
}) => {
  const { t } = useLanguage();

  // Thống kê giá trị theo từng nhóm trạng thái
  let valNew = 0;
  let valProcessing = 0;
  let valCompleted = 0;
  let valCancelled = 0;

  if (statusDistribution && typeof statusDistribution === "object") {
    valNew = Number(statusDistribution[0]) || 0;
    valProcessing =
      (Number(statusDistribution[1]) || 0) + (Number(statusDistribution[2]) || 0);
    valCompleted =
      (Number(statusDistribution[3]) || 0) + (Number(statusDistribution[4]) || 0);
    valCancelled = Number(statusDistribution[5]) || 0;
  } else if (Array.isArray(contracts)) {
    contracts.forEach((c) => {
      if (c.status === 0) valNew++;
      else if (c.status === 1 || c.status === 2) valProcessing++;
      else if (c.status === 3 || c.status === 4) valCompleted++;
      else if (c.status === 5) valCancelled++;
    });
  }

  const calculatedTotal = valNew + valProcessing + valCompleted + valCancelled;
  const total = totalContracts !== undefined ? Number(totalContracts) : calculatedTotal;

  const data = [
    { name: t("chartNew") || "Mới tạo", value: valNew, color: "#3B82F6", key: "new" },
    {
      name: t("chartProcessing") || "Đang xử lý",
      value: valProcessing,
      color: "#F59E0B",
      key: "proc",
    },
    {
      name: t("chartCompleted") || "Hoàn thành",
      value: valCompleted,
      color: "#10B981",
      key: "done",
    },
    {
      name: t("chartCancelled") || "Đã hủy",
      value: valCancelled,
      color: "#F43F5E",
      key: "cancel",
    },
  ];

  const activeData = data.filter((item) => item.value > 0);

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.08) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-[11px] font-bold pointer-events-none select-none"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <PieChartIcon className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              {t("chartTitle") || "Phân bố trạng thái"}
            </h3>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            {total} {t("chartContractsUnit") || "hợp đồng"}
          </span>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
          {t("chartSubtitle") || "Tỷ lệ hợp đồng theo các giai đoạn thực hiện"}
        </p>
      </div>

      {/* Main Content Area */}
      {total === 0 || activeData.length === 0 ? (
        <div className="h-[280px] flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-700/60">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center mb-3">
            <PieChartIcon className="w-7 h-7 opacity-75" />
          </div>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            {t("chartNoData") || "Chưa có dữ liệu biểu đồ"}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-[220px]">
            {t("chartNoDataSub") || "Tạo hợp đồng mới hoặc nhận việc để xem tỷ lệ phân bố trạng thái"}
          </p>
          <Link
            to="/dashboard/create"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{t("chartCreateNow") || "Tạo hợp đồng ngay"}</span>
          </Link>
        </div>
      ) : (
        <>
          {/* Chart Canvas */}
          <div className="w-full h-[260px] relative">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={activeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={68}
                  outerRadius={96}
                  paddingAngle={activeData.length > 1 ? 4 : 0}
                  dataKey="value"
                  cornerRadius={6}
                  labelLine={false}
                  label={renderCustomizedLabel}
                >
                  {activeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>

                {/* Inner Text Center of Donut */}
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                  <tspan
                    x="50%"
                    dy="-12"
                    fontSize="10"
                    fill="#94A3B8"
                    fontWeight="700"
                    letterSpacing="0.05em"
                  >
                    {t("chartTotalLabel") || "TỔNG SỐ"}
                  </tspan>
                  <tspan
                    x="50%"
                    dy="24"
                    fontSize="26"
                    fontWeight="800"
                    fill="currentColor"
                    className="text-slate-900 dark:text-white"
                  >
                    {total}
                  </tspan>
                </text>

                <Tooltip
                  formatter={(value, name) => [`${value} ${t("chartContractsUnit") || "hợp đồng"}`, name]}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "1px solid rgba(226, 232, 240, 0.8)",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Breakdown summary pills */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {data.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 truncate">
                    {item.name}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 shrink-0">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ContractStatusChart;
