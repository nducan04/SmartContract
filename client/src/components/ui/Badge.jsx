import React from "react";

/**
 * Reusable Badge / Status pill component.
 *
 * Variants: primary • success • warning • error • purple • gray
 * Sizes: sm | md
 *
 * Usage:
 *   <Badge variant="success" size="sm">Hoàn thành</Badge>
 *   <Badge variant="error">Quá hạn</Badge>
 */
const Badge = ({
  children,
  variant = "gray",
  size = "md",
  rounded = true,
  dot = false,
  className = "",
  ...rest
}) => {
  const variantClasses = {
    primary: "bg-blue-100 text-blue-800",
    primarySolid: "bg-blue-600 text-white",
    success: "bg-green-100 text-green-800",
    successSolid: "bg-green-600 text-white",
    warning: "bg-amber-100 text-amber-800",
    warningSolid: "bg-amber-600 text-white",
    error: "bg-red-100 text-red-800",
    errorSolid: "bg-red-600 text-white",
    purple: "bg-purple-100 text-purple-800",
    purpleSolid: "bg-purple-600 text-white",
    gray: "bg-gray-100 text-gray-800",
    graySolid: "bg-gray-600 text-white",
    blue: "bg-blue-50 text-blue-700 border border-blue-200",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  const variantClass = variantClasses[variant] || variantClasses.gray;
  const sizeClass = sizeClasses[size] || sizeClasses.sm;
  const roundedClass = rounded ? "rounded-full" : "rounded";

  return (
    <span
      className={`
        inline-flex items-center gap-1 font-semibold
        ${sizeClass}
        ${variantClass}
        ${roundedClass}
        ${className}
      `}
      {...rest}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            variant.includes("Solid")
              ? "bg-white"
              : variantClass
                  .split(" ")
                  .find((c) => c.startsWith("text-"))
                  ?.replace("text-", "bg-") || "bg-current"
          }`}
        ></span>
      )}
      {children}
    </span>
  );
};

export default Badge;
