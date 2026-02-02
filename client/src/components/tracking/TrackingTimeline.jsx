import React from "react";

const TrackingTimeline = ({ currentState }) => {
  const statusSteps = [
    { label: "Khởi tạo hợp đồng", icon: "uil-file-edit-alt" },
    { label: "Đã chấp nhận", icon: "uil-user-check" },
    { label: "Đang thực hiện", icon: "uil-truck" },
    { label: "Hoàn thành", icon: "uil-check-circle" },
    { label: "Đã thanh toán", icon: "uil-bill" },
    { label: "Đã hủy", icon: "uil-times-circle", isError: true },
  ];

  return (
    <>
      <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 px-1 mt-6">
        <i className="uil uil-history"></i> Tiến độ thực hiện
      </h3>

      <div className="relative pl-4 border-l-2 border-gray-200 space-y-8 ml-2">
        {statusSteps.slice(0, 5).map((step, index) => {
          const isCompleted = currentState >= index && currentState !== 5;
          const isCurrent = currentState === index;
          const isCancelled = currentState === 5;

          if (isCancelled && index > 0) return null;

          return (
            <div key={index} className="relative pl-6">
              <div
                className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm 
                ${isCurrent || isCompleted ? "bg-blue-600 ring-4 ring-blue-50" : "bg-gray-300"}
                ${isCancelled && index === 0 ? "!bg-red-500 !ring-red-50" : ""}
                `}
              ></div>

              <div
                className={`p-4 rounded-xl border transition-all 
                ${
                  isCurrent
                    ? "bg-white border-blue-200 shadow-md transform scale-105"
                    : isCompleted
                      ? "bg-white border-gray-100 opacity-80"
                      : "bg-gray-50 border-gray-100 opacity-50 grayscale"
                }
              `}
              >
                <div className="flex justify-between items-center mb-1">
                  <h4
                    className={`font-bold text-sm ${isCurrent ? "text-blue-700" : "text-gray-700"}`}
                  >
                    {isCancelled && index === 0
                      ? "Hợp đồng đã hủy"
                      : step.label}
                  </h4>
                  <i
                    className={`uil ${step.icon} text-xl ${isCurrent ? "text-blue-600" : "text-gray-400"}`}
                  ></i>
                </div>
                {isCurrent && (
                  <p className="text-xs text-blue-500 animate-pulse font-medium">
                    • Đang xử lý ở bước này
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default TrackingTimeline;
