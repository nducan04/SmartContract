import React from "react";
import { useLanguage } from "../context/LanguageContext";

const ContractStepper = ({ currentStatus }) => {
  const { t } = useLanguage();
  const steps = [
    { label: t("statusCreated"), statusId: 0 },
    { label: t("statusAccepted"), statusId: 1 },
    { label: t("statusShipping"), statusId: 2 },
    { label: t("statusCompleted"), statusId: 3 },
    { label: t("statusPaid"), statusId: 4 },
  ];

  // Xử lý nếu hủy
  if (currentStatus === 5) {
    return (
      <div className="w-full bg-red-50 border border-red-200 text-red-700 py-3 px-4 rounded-lg flex items-center justify-center font-bold text-sm">
        <i className="uil uil-times-circle text-lg mr-2"></i>
        {t("statusCancelled")}
      </div>
    );
  }

  // Giới hạn status tối đa là 4 (để tránh lỗi index nếu có status lạ)
  const activeIndex = Math.min(currentStatus, 4);

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between w-full">
        {steps.map((step, index) => {
          // Logic kiểm tra trạng thái
          const isCompleted = index <= activeIndex;
          const isCurrent = index === activeIndex;
          const isLastStep = index === steps.length - 1;

          return (
            <React.Fragment key={step.statusId}>
              {/* 1. NODE TRÒN */}
              <div className="relative flex flex-col items-center group">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 z-10
                    ${
                      isCompleted
                        ? "bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-200"
                        : "bg-white border-gray-200 text-gray-400"
                    }
                    ${isCurrent ? "ring-4 ring-blue-100 scale-125 shadow-lg animate-pulse" : ""}
                  `}
                >
                  {isCompleted ? (
                    <i className="uil uil-check text-base font-bold"></i>
                  ) : (
                    <span className="text-xs font-semibold">{index + 1}</span>
                  )}
                </div>

                {/* LABEL (Chữ bên dưới) */}
                <div
                  className={`absolute top-10 w-24 text-center text-[10px] uppercase font-bold tracking-wide transition-colors duration-300
                  ${isCompleted ? "text-blue-500" : "text-gray-400"}
                `}
                >
                  {step.label}
                </div>
              </div>

              {/* 2. ĐƯỜNG KẺ NỐI (Line Space) */}
              {/* Chỉ vẽ đường kẻ nếu không phải là bước cuối cùng */}
              {!isLastStep && (
                <div className="flex-1 h-1 mx-2 rounded-full bg-gray-100 overflow-hidden">
                  {/* Thanh màu chạy bên trong */}
                  <div
                    className={`h-full bg-blue-400 transition-all duration-500 ease-out origin-left
                      ${index < activeIndex ? "w-full" : "w-0"}
                    `}
                  ></div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ContractStepper;
