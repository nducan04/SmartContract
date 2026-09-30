import React from "react";
import { useLanguage } from "../../context/LanguageContext";

/**
 * Modern StatusPill component with pulsing dot, dark mode tokens and i18n support.
 */
const StatusPill = ({ status, size = "md", showLabel = true, className = "" }) => {
  const { t } = useLanguage();

  const STATUS_KEYS = [
    "statusCreated",
    "statusAccepted",
    "statusShipping",
    "statusCompleted",
    "statusPaid",
    "statusCancelled",
  ];

  const STATUS_CONFIG = [
    {
      fallbackLabel: "Mới tạo",
      key: "statusCreated",
      color: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
      dot: "bg-slate-400",
      pulse: false,
    },
    {
      fallbackLabel: "Đã chấp nhận",
      key: "statusAccepted",
      color: "bg-purple-50 text-purple-700 border-purple-200/60 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60",
      dot: "bg-purple-500",
      pulse: true,
    },
    {
      fallbackLabel: "Đang vận chuyển",
      key: "statusShipping",
      color: "bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60",
      dot: "bg-amber-500",
      pulse: true,
    },
    {
      fallbackLabel: "Đã hoàn thành",
      key: "statusCompleted",
      color: "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60",
      dot: "bg-emerald-500",
      pulse: false,
    },
    {
      fallbackLabel: "Đã thanh toán",
      key: "statusPaid",
      color: "bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60",
      dot: "bg-blue-500",
      pulse: false,
    },
    {
      fallbackLabel: "Đã hủy",
      key: "statusCancelled",
      color: "bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60",
      dot: "bg-rose-500",
      pulse: false,
    },
  ];

  const STATUS_MAP = {
    created: 0,
    pending: 0,
    accepted: 1,
    confirm: 1,
    shipping: 2,
    shipping_status: 2,
    in_transit: 2,
    completed: 3,
    finished: 3,
    paid: 4,
    cancelled: 5,
    cancelled_status: 5,
    cancelled_vn: 5,
    active: 2,
    warning: 2,
    error: 5,
    info: 1,
  };

  let safeStatus;
  if (typeof status === "string") {
    safeStatus = STATUS_MAP[status.toLowerCase()];
    if (safeStatus === undefined) safeStatus = 0;
  } else {
    safeStatus = Math.min(Math.max(status || 0, 0), 5);
  }

  const cfg = STATUS_CONFIG[safeStatus] || STATUS_CONFIG[0];
  const label = t ? t(cfg.key) || cfg.fallbackLabel : cfg.fallbackLabel;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-semibold rounded-full border
        transition-colors
        ${sizeClasses[size] || sizeClasses.md}
        ${cfg.color}
        ${className}
      `}
    >
      <span className="relative flex h-2 w-2">
        {cfg.pulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${cfg.dot}`}
          ></span>
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${cfg.dot}`}
        ></span>
      </span>
      {showLabel && <span>{label}</span>}
    </span>
  );
};

export default StatusPill;
