import React from "react";

/**
 * Modern Card component with dark mode support, glassmorphism, and subtle border glow.
 */
const Card = ({
  children,
  variant = "elevated",
  padding = "md",
  bordered = true,
  hover = false,
  className = "",
  onClick,
  ...rest
}) => {
  const variantClasses = {
    elevated:
      "bg-white dark:bg-slate-900 shadow-sm dark:shadow-none border border-slate-200/80 dark:border-slate-800/80",
    glass:
      "backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-card",
    flat:
      "bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60",
    outline:
      "bg-transparent border border-slate-200 dark:border-slate-800",
    gradient:
      "bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border border-slate-200/80 dark:border-slate-800/80 shadow-sm",
  };

  const paddingClasses = {
    none: "p-0",
    xs: "p-3",
    sm: "p-4 sm:p-5",
    md: "p-5 sm:p-6",
    lg: "p-6 sm:p-8",
  };

  const baseClass = variantClasses[variant] || variantClasses.elevated;
  const padClass = paddingClasses[padding] || paddingClasses.md;
  const hoverClass = hover
    ? "transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:border-blue-400/50 dark:hover:border-blue-500/40 cursor-pointer"
    : "transition-all duration-200";

  return (
    <div
      className={`
        rounded-2xl relative overflow-hidden
        ${baseClass}
        ${padClass}
        ${hoverClass}
        ${className}
      `}
      onClick={onClick}
      {...rest}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = "" }) => (
  <div className={`mb-4 flex items-center justify-between gap-4 ${className}`}>{children}</div>
);

export const CardBody = ({ children, className = "" }) => (
  <div className={`flex-1 ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = "" }) => (
  <div className={`mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between ${className}`}>{children}</div>
);

export default Card;
