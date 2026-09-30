import React from "react";

/**
 * StatusPill — vertical badge for contract lifecycle status.
 *
 * Usage:
 *   <StatusPill status={2} />              // numeric (0-5)
 *   <StatusPill status="completed" />       // string keyword
 *
 * Props:
 *   status (number|string) - contract status code or keyword
 *   size?  ("sm"|"md")      - default "md"
 *   showLabel? (bool)       - default true
 */
const STATUS_CONFIG = [
  { label: "Mới tạo",       color: "bg-gray-100 text-gray-700",   dot: "bg-gray-400" },
  { label: "Đã chấp nhận",  color: "bg-purple-100 text-purple-700", dot: "bg-purple-500" },
  { label: "Đang vận chuyển", color: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  { label: "Đã hoàn thành", color: "bg-green-100 text-green-700",  dot: "bg-green-500" },
  { label: "Đã thanh toán", color: "bg-blue-100 text-blue-700",   dot: "bg-blue-500" },
  { label: "Đã hủy",       color: "bg-red-100 text-red-700",      dot: "bg-red-500" },
];

// Map string keywords to numeric indices
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

const StatusPill = ({ status, size = "md", showLabel = true }) => {
  // Resolve string keyword to numeric index
  let safeStatus;
  if (typeof status === "string") {
    safeStatus = STATUS_MAP[status.toLowerCase()];
    if (safeStatus === undefined) {
      safeStatus = 0; // default to "created"
    }
  } else {
    safeStatus = Math.min(Math.max(status || 0, 0), 5);
  }

  const cfg = STATUS_CONFIG[safeStatus] || STATUS_CONFIG[0];

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-3 py-1 text-xs",
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-bold rounded-full
        ${sizeClasses[size] || sizeClasses.md}
        ${cfg.color}
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
      {showLabel && cfg.label}
    </span>
  );
};

export default StatusPill;
