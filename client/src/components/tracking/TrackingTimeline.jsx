import React from "react";
import {
  FileEdit,
  UserCheck,
  Truck,
  CheckCircle2,
  Coins,
  XCircle,
  Clock
} from "lucide-react";

const TrackingTimeline = ({ currentState }) => {
  const statusSteps = [
    { label: "Khởi tạo hợp đồng", icon: FileEdit },
    { label: "Đã chấp nhận", icon: UserCheck },
    { label: "Đang vận chuyển", icon: Truck },
    { label: "Hoàn thành giao nhận", icon: CheckCircle2 },
    { label: "Đã giải ngân thanh toán", icon: Coins },
    { label: "Đã hủy hợp đồng", icon: XCircle, isError: true },
  ];

  return (
    <div>
      <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-6 flex items-center gap-2">
        <Clock className="w-4 h-4 text-blue-500" />
        <span>Tiến trình thực hiện trên Blockchain</span>
      </h3>

      <div className="relative pl-4 border-l-2 border-slate-200 dark:border-slate-800 space-y-6 ml-2">
        {statusSteps.slice(0, 5).map((step, index) => {
          const Icon = step.icon;
          const isCompleted = currentState >= index && currentState !== 5;
          const isCurrent = currentState === index;
          const isCancelled = currentState === 5;

          if (isCancelled && index > 0) return null;

          return (
            <div key={index} className="relative pl-6">
              <div
                className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 shadow-sm transition-all
                ${
                  isCurrent || isCompleted
                    ? "bg-blue-600 ring-4 ring-blue-500/20"
                    : "bg-slate-300 dark:bg-slate-700"
                }
                ${isCancelled && index === 0 ? "!bg-rose-500 !ring-rose-500/20" : ""}
                `}
              ></div>

              <div
                className={`p-4 rounded-2xl border transition-all duration-200
                ${
                  isCurrent
                    ? "bg-white dark:bg-slate-900 border-blue-400 dark:border-blue-500/50 shadow-md"
                    : isCompleted
                      ? "bg-white/80 dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                      : "bg-slate-50 dark:bg-slate-900/40 border-slate-200/40 dark:border-slate-800/40 opacity-50 grayscale"
                }
              `}
              >
                <div className="flex justify-between items-center mb-1">
                  <h4
                    className={`font-bold text-sm ${
                      isCurrent
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {isCancelled && index === 0
                      ? "Hợp đồng đã hủy"
                      : step.label}
                  </h4>
                  <Icon
                    className={`w-5 h-5 ${
                      isCurrent
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  />
                </div>
                {isCurrent && (
                  <p className="text-xs text-blue-500 dark:text-blue-400 font-medium flex items-center gap-1.5 mt-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                    </span>
                    <span>Đang ở giai đoạn này</span>
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrackingTimeline;
