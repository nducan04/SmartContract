import React from "react";

/**
 * StatusPill — vertical badge for contract lifecycle status.
 *
 * Usage:  <StatusPill status={2} />  (0=Created, 1=Accepted, 2=Shipping, 3=Completed, 4=Paid, 5=Cancelled)
 * Props:
 *   status (number)   - contract status code
 *   size?  ("sm"|"md") - default "md"
 *   showLabel? (bool) - default true
 */
const STATUS_CONFIG = [
  { label: "Mới tạo",       color: "bg-gray-100 text-gray-700",   dot: "bg-gray-400" },
  { label: "Đã chấp nhận",  color: "bg-purple-100 text-purple-700", dot: "bg-purple-500" },
  { label: "Đang vận chuyển", color: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  { label: "Đã hoàn thành", color: "bg-green-100 text-green-700",  dot: "bg-green-500" },
  { label: "Đã thanh toán", color: "bg-blue-100 text-blue-700",   dot: "bg-blue-500" },
  { label: "Đã hủy",       color: "bg-red-100 text-red-700",      dot: "bg-red-500" },
];

const StatusPill = ({ status, size = "md", showLabel = true }) => {
  const safeStatus = Math.min(Math.max(status || 0, 0), 5);
  const cfg = STATUS_CONFIG[safeStatus];

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-3 py-1 text-xs",
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-bold rounded-full
        ${sizeClasses[size]}
        ${cfg.color}
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
      {showLabel && cfg.label}
    </span>
  );
};

export default StatusPill;
