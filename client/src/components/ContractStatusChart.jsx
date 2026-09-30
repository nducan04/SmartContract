import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { useLanguage } from "../context/LanguageContext";
import { PieChart as PieChartIcon } from "lucide-react";

const ContractStatusChart = ({ contracts = [] }) => {
  const { t } = useLanguage();

  const data = [
    { name: t("chartNew") || "Mới tạo", value: 0, color: "#3B82F6" },
    { name: t("chartProcessing") || "Đang xử lý", value: 0, color: "#F59E0B" },
    { name: t("chartCompleted") || "Hoàn thành", value: 0, color: "#10B981" },
    { name: t("chartCancelled") || "Đã hủy", value: 0, color: "#F43F5E" },
  ];

  contracts.forEach((c) => {
    if (c.status === 0) data[0].value++;
    else if (c.status === 1 || c.status === 2) data[1].value++;
    else if (c.status === 3 || c.status === 4) data[2].value++;
    else if (c.status === 5) data[3].value++;
  });

  const activeData = data.filter((item) => item.value > 0);
  const totalContracts = contracts.length;

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
        className="text-[11px] font-bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (contracts.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm min-h-[350px]">
        <PieChartIcon className="w-10 h-10 mb-2 opacity-40 text-blue-500" />
        <p className="text-xs font-semibold">{t("chartNoData") || "Chưa có dữ liệu thống kê"}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800 h-full flex flex-col min-h-[380px]">
      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
        {t("chartTitle") || "Tỷ lệ trạng thái hợp đồng"}
      </h3>
      <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
        Phân bố theo các giai đoạn thực hiện
      </p>

      <div className="flex-1 w-full relative min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={activeData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={4}
              dataKey="value"
              cornerRadius={6}
              labelLine={false}
              label={renderCustomizedLabel}
            >
              {activeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>

            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
              <tspan x="50%" dy="-16" fontSize="11" fill="#94A3B8" fontWeight="600">
                {t("chartTotal") || "TỔNG SỐ"}
              </tspan>
              <tspan
                x="50%"
                dy="26"
                fontSize="28"
                fontWeight="800"
                fill="currentColor"
                className="text-slate-900 dark:text-white"
              >
                {totalContracts}
              </tspan>
            </text>

            <Tooltip
              formatter={(value) => [`${value} hợp đồng`, "Số lượng"]}
              contentStyle={{
                borderRadius: "16px",
                border: "1px solid rgba(226, 232, 240, 0.8)",
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                fontSize: "12px",
                fontWeight: "600"
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "12px", fontWeight: "500" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ContractStatusChart;
