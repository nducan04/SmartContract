import React from "react";

/**
 * Reusable Button component with consistent styling across the app.
 *
 * Variants:
 *   - primary   → gradient blue→purple, white text
 *   - primarySolid → solid blue
 *   - secondary → gray outline
 *   - outline   → transparent with border
 *   - ghost     → transparent, no border
 *   - danger    → solid red
 *   - success   → solid green
 *
 * Sizes: sm | md | lg  (height & padding consistent)
 *
 * Usage:  <Button variant="primary" size="md" icon="uil-rocket" onClick={...} />
 */
const Button = ({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  disabled = false,
  loading = false,
  fullWidth = false,
  className = "",
  onClick,
  ...rest
}) => {
  /* --- Size tokens --- */
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base",
  };

  /* --- Variant tokens --- */
  const variantClasses = {
    primary:
      "bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold " +
      "shadow-lg shadow-blue-200 hover:shadow-xl hover:from-blue-700 hover:to-purple-700 " +
      "focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2",
    primarySolid:
      "bg-blue-600 text-white font-semibold " +
      "shadow-lg shadow-blue-200 hover:shadow-xl hover:bg-blue-700 " +
      "focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2",
    secondary:
      "bg-gray-100 text-gray-800 font-semibold " +
      "hover:bg-gray-200 focus-visible:ring-2 focus-visible:ring-gray-400/50 focus-visible:ring-offset-2",
    outline:
      "border-2 border-blue-600 text-blue-600 font-semibold " +
      "hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2",
    ghost:
      "text-gray-600 font-semibold hover:bg-gray-100 " +
      "focus-visible:ring-2 focus-visible:ring-gray-400/50 focus-visible:ring-offset-2",
    danger:
      "bg-red-600 text-white font-semibold " +
      "shadow-md hover:bg-red-700 " +
      "focus-visible:ring-2 focus-visible:ring-red-500/50 focus-visible:ring-offset-2",
    success:
      "bg-green-600 text-white font-semibold " +
      "shadow-md hover:bg-green-700 " +
      "focus-visible:ring-2 focus-visible:ring-green-500/50 focus-visible:ring-offset-2",
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const variantClass = variantClasses[variant] || variantClasses.primary;
  const fullClass = fullWidth ? "w-full" : "";
  const disabledClass = disabled || loading ? "opacity-50 cursor-not-allowed" : "";

  /* --- Build icon element --- */
  const iconElement = icon ? (
    <i className={`uil ${icon} ${children ? "mr-2" : ""} text-lg`}></i>
  ) : null;

  const iconRight = icon && iconPosition === "right" ? (
    <i className={`uil ${icon} ${children ? "ml-2" : ""} text-lg`}></i>
  ) : null;

  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        rounded-xl transition-all duration-200 ease-in-out
        transform hover:scale-[1.02] active:scale-[0.98]
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
          <i className="uil uil-spinner-alt animate-spin text-lg"></i>
          {children || "Processing..."}
        </span>
      ) : (
        <>
          {icon && iconPosition === "left" && iconElement}
          {children}
          {iconRight}
        </>
      )}
    </button>
  );
};

export default Button;
