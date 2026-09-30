import React from "react";

/**
 * Reusable Card component.
 *
 * Usage:
 *   <Card variant="elevated" padding="md">
 *     <CardHeader>...</CardHeader>
 *     <CardBody>...</CardBody>
 *     <CardFooter>...</CardFooter>
 *   </Card>
 *
 * Or simple: <Card>...</Card>
 */
const Card = ({
  children,
  variant = "elevated",
  padding = "md",
  bordered = false,
  hover = false,
  className = "",
  onClick,
}) => {
  const variantClasses = {
    elevated: "bg-white border border-gray-100 shadow-sm",
    flat: "bg-white",
    outline: "bg-white border border-gray-200",
    ghost: "bg-transparent",
  };

  const paddingClasses = {
    none: "p-0",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const baseClass = variantClasses[variant] || variantClasses.elevated;
  const padClass = paddingClasses[padding] || paddingClasses.md;
  const borderClass = bordered ? "border border-gray-200" : "";
  const hoverClass = hover
    ? "transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-blue-200"
    : "transition-all duration-200";

  return (
    <div
      className={`
        rounded-2xl ${baseClass} ${padClass} ${borderClass}
        ${hoverClass}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

/* Sub-components for structured cards */
export const CardHeader = ({ children, className = "" }) => (
  <div className={`mb-4 ${className}`}>{children}</div>
);

export const CardBody = ({ children, className = "" }) => (
  <div className={`flex-1 ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = "" }) => (
  <div className={`mt-4 pt-4 border-t border-gray-100 ${className}`}>{children}</div>
);

export default Card;
