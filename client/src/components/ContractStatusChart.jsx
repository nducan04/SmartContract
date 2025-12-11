import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const ContractStatusChart = ({ contracts }) => {
  // 1. Xử lý dữ liệu
  const data = [
    { name: "Mới tạo", value: 0, color: "#A78BFA" },
    { name: "Đang xử lý", value: 0, color: "#FBBF24" },
    { name: "Hoàn thành", value: 0, color: "#8B5CF6" },
    { name: "Đã hủy", value: 0, color: "#F87171" },
  ];

  contracts.forEach((c) => {
    if (c.status === 0) data[0].value++;
    else if (c.status === 1 || c.status === 2) data[1].value++;
    else if (c.status === 3 || c.status === 4) data[2].value++;
    else if (c.status === 5) data[3].value++;
  });

  const activeData = data.filter((item) => item.value > 0);
  const totalContracts = contracts.length;

  // === HÀM VẼ SỐ % TRÊN BIỂU ĐỒ ===
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

    // Chỉ hiện nếu tỷ lệ > 5% để đỡ bị chồng chéo
    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-bold shadow-sm"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (contracts.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm min-h-[300px]">
        <i className="uil uil-chart-pie text-4xl mb-2 opacity-50"></i>
        <p className="text-sm">Chưa có dữ liệu biểu đồ</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col min-h-[350px]">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        Phân bổ Trạng thái
      </h3>

      <div className="flex-1 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={activeData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={110}
              paddingAngle={5}
              dataKey="value"
              cornerRadius={6}
              labelLine={false} // Tắt đường kẻ nối
              label={renderCustomizedLabel} // Sử dụng hàm vẽ % tự chế
            >
              {activeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>

            {/* Center Label (Tổng số) */}
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
              <tspan x="50%" dy="-20" fontSize="14" fill="#9CA3AF">
                Tổng số
              </tspan>
              <tspan
                x="50%"
                dy="28"
                fontSize="32"
                fontWeight="bold"
                fill="#1F2937"
              >
                {totalContracts}
              </tspan>
            </text>

            <Tooltip
              formatter={(value) => [`${value} đơn`, "Số lượng"]}
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              iconSize={10}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ContractStatusChart;
