import React from "react";

/**
 * Modern Status Badge with subtle transparent backgrounds and dark mode tokens.
 */
const Badge = ({
  children,
  variant = "gray",
  size = "md",
  rounded = true,
  dot = false,
  pulse = false,
  className = "",
  ...rest
}) => {
  const variantClasses = {
    primary:
      "bg-blue-50 text-blue-700 border border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60",
    primarySolid: "bg-blue-600 text-white shadow-xs",
    success:
      "bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60",
    successSolid: "bg-emerald-600 text-white shadow-xs",
    warning:
      "bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60",
    warningSolid: "bg-amber-600 text-white shadow-xs",
    error:
      "bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60",
    errorSolid: "bg-rose-600 text-white shadow-xs",
    purple:
      "bg-purple-50 text-purple-700 border border-purple-200/60 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60",
    purpleSolid: "bg-purple-600 text-white shadow-xs",
    gray:
      "bg-slate-100 text-slate-700 border border-slate-200/60 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700/60",
    cyan:
      "bg-cyan-50 text-cyan-700 border border-cyan-200/60 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800/60",
  };

  const dotColors = {
    primary: "bg-blue-500",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    error: "bg-rose-500",
    purple: "bg-purple-500",
    gray: "bg-slate-400",
    cyan: "bg-cyan-500",
  };

  const sizeClasses = {
    xs: "px-2 py-0.5 text-[10px] font-bold tracking-wider",
    sm: "px-2.5 py-0.5 text-xs font-semibold",
    md: "px-3 py-1 text-xs font-semibold",
    lg: "px-3.5 py-1.5 text-sm font-semibold",
  };

  const variantClass = variantClasses[variant] || variantClasses.gray;
  const sizeClass = sizeClasses[size] || sizeClasses.sm;
  const roundedClass = rounded ? "rounded-full" : "rounded-lg";
  const dotColor = dotColors[variant.replace("Solid", "")] || "bg-current";

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 transition-all
        ${sizeClass}
        ${variantClass}
        ${roundedClass}
        ${className}
      `}
      {...rest}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          {pulse && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor}`}
            ></span>
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`}
          ></span>
        </span>
      )}
      {children}
    </span>
  );
};

export default Badge;
