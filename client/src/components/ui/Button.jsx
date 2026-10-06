import React from "react";
import { useLanguage } from "../../context/LanguageContext";

/**
 * Modern High-Performance Button component.
 * Supports primary gradient, outline, ghost, danger, success, and dark mode out-of-the-box.
 */
const Button = ({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  disabled = false,
  loading = false,
  fullWidth = false,
  className = "",
  onClick,
  ...rest
}) => {
  const { t } = useLanguage();
  /* --- Size tokens --- */
  const sizeClasses = {
    xs: "px-2.5 py-1 text-xs rounded-lg gap-1.5",
    sm: "px-3.5 py-1.5 text-xs font-semibold rounded-xl gap-2",
    md: "px-4 py-2.5 text-sm font-semibold rounded-xl gap-2",
    lg: "px-6 py-3.5 text-base font-semibold rounded-2xl gap-2.5",
  };

  /* --- Variant tokens --- */
  const variantClasses = {
    primary:
      "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 " +
      "text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 " +
      "focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2",
    primarySolid:
      "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 " +
      "focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2",
    secondary:
      "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 " +
      "border border-slate-200/80 dark:border-slate-700/80 focus-visible:ring-2 focus-visible:ring-slate-400/50",
    outline:
      "border border-blue-500/40 hover:border-blue-600 text-blue-600 dark:text-blue-400 " +
      "hover:bg-blue-50/50 dark:hover:bg-blue-950/30 focus-visible:ring-2 focus-visible:ring-blue-500/50",
    ghost:
      "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 " +
      "hover:bg-slate-100 dark:hover:bg-slate-800/60 focus-visible:ring-2 focus-visible:ring-slate-400/50",
    danger:
      "bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20 " +
      "focus-visible:ring-2 focus-visible:ring-red-500/50",
    success:
      "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 " +
      "focus-visible:ring-2 focus-visible:ring-emerald-500/50",
    glass:
      "backdrop-blur-md bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 " +
      "text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 shadow-sm",
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const variantClass = variantClasses[variant] || variantClasses.primary;
  const fullClass = fullWidth ? "w-full" : "";
  const disabledClass = disabled || loading ? "opacity-60 cursor-not-allowed pointer-events-none" : "cursor-pointer active:scale-[0.98]";

  const renderIcon = () => {
    if (!Icon) return null;
    // Check if Icon is a React component or a string class
    if (typeof Icon === "function" || typeof Icon === "object") {
      const LucideIcon = Icon;
      return <LucideIcon className="w-4 h-4 shrink-0 transition-transform" />;
    }
    return <i className={`uil ${Icon} text-base shrink-0`}></i>;
  };

  return (
    <button
      className={`
        inline-flex items-center justify-center font-medium
        transition-all duration-200 ease-out select-none
        ${sizeClass}
        ${variantClass}
        ${fullClass}
        ${disabledClass}
        ${className}
      `}
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span>{children || t("createProcessing")}</span>
        </span>
      ) : (
        <>
          {Icon && iconPosition === "left" && renderIcon()}
          {children}
          {Icon && iconPosition === "right" && renderIcon()}
        </>
      )}
    </button>
  );
};

export default Button;
