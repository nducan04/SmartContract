import React from "react";
import { AlertCircle, UploadCloud } from "lucide-react";

/**
 * Modern Accessible Form Input with dark mode, glow focus ring, and helper states.
 */
const Input = React.forwardRef(
  (
    {
      label,
      name,
      type = "text",
      placeholder,
      value,
      onChange,
      onBlur,
      error,
      helperText,
      required = false,
      disabled = false,
      icon: Icon,
      className = "",
      inputClassName = "",
      ...rest
    },
    ref,
  ) => {
    const inputId = `input-${name || Math.random().toString(36).slice(2)}`;

    return (
      <div className={`space-y-1.5 ${className}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
          >
            {label}
            {required && <span className="text-rose-500 ml-1 font-bold">*</span>}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none z-10">
              {typeof Icon === "function" || typeof Icon === "object" ? (
                <Icon className="w-4 h-4" />
              ) : (
                <i className={`uil ${Icon} text-lg`}></i>
              )}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            name={name}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            className={`
              w-full bg-slate-50/70 dark:bg-slate-900/70 border rounded-xl px-4 py-2.5
              text-slate-900 dark:text-slate-100 text-sm placeholder-slate-400 dark:placeholder-slate-500
              outline-none transition-all duration-200
              focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10
              ${Icon ? "pl-10" : ""}
              ${
                error
                  ? "border-rose-400 dark:border-rose-500/70 focus:border-rose-500 focus:ring-rose-500/10"
                  : "border-slate-200 dark:border-slate-800"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
              ${inputClassName}
            `}
            {...rest}
          />
        </div>
        {error && (
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1.5 mt-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        )}
        {helperText && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{helperText}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

/* Textarea sub-component */
Input.Textarea = React.forwardRef(
  ({ label, name, placeholder, value, onChange, error, helperText, rows = 4, required, className = "", ...rest }, ref) => {
    const inputId = `textarea-${name || Math.random().toString(36).slice(2)}`;
    return (
      <div className={`space-y-1.5 ${className}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
          >
            {label}
            {required && <span className="text-rose-500 ml-1 font-bold">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          rows={rows}
          className={`
            w-full bg-slate-50/70 dark:bg-slate-900/70 border rounded-xl px-4 py-3
            text-slate-900 dark:text-slate-100 text-sm placeholder-slate-400 dark:placeholder-slate-500
            outline-none transition-all duration-200 resize-y
            focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10
            ${
              error
                ? "border-rose-400 dark:border-rose-500/70 focus:border-rose-500 focus:ring-rose-500/10"
                : "border-slate-200 dark:border-slate-800"
            }
          `}
          {...rest}
        />
        {error && (
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1.5 mt-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        )}
        {helperText && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{helperText}</p>}
      </div>
    );
  },
);
Input.Textarea.displayName = "Input.Textarea";

/* Select sub-component */
Input.Select = React.forwardRef(
  ({ label, name, value, onChange, options, error, required, className = "", ...rest }, ref) => {
    const inputId = `select-${name || Math.random().toString(36).slice(2)}`;
    return (
      <div className={`space-y-1.5 ${className}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
          >
            {label}
            {required && <span className="text-rose-500 ml-1 font-bold">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          className={`
            w-full bg-slate-50/70 dark:bg-slate-900/70 border rounded-xl px-4 py-2.5
            text-slate-900 dark:text-slate-100 text-sm outline-none transition-all duration-200
            focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10
            appearance-none cursor-pointer
            ${error ? "border-rose-400" : "border-slate-200 dark:border-slate-800"}
          `}
          {...rest}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  },
);
Input.Select.displayName = "Input.Select";

/* File sub-component */
Input.File = React.forwardRef(
  ({ label, name, onFileChange, error, helperText, accept = "image/*,.pdf,.doc,.docx", className = "", ...rest }, ref) => {
    const inputId = `file-${name || Math.random().toString(36).slice(2)}`;
    return (
      <div className={`space-y-1.5 ${className}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
          >
            {label}
            <span className="text-rose-500 ml-1 font-bold">*</span>
          </label>
        )}
        <div
          className={`
            relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer
            transition-all duration-200
            ${
              error
                ? "border-rose-300 bg-rose-50/30 dark:bg-rose-950/20"
                : "border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-950/20"
            }
          `}
        >
          <input
            ref={ref}
            id={inputId}
            name={name}
            type="file"
            accept={accept}
            onChange={onFileChange}
            className="hidden"
            {...rest}
          />
          <div className="flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <label htmlFor={inputId} className="block text-sm font-semibold text-slate-800 dark:text-slate-200 cursor-pointer hover:text-blue-600">
              {label || "Chọn tệp từ máy tính"}
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{helperText || "Hỗ trợ PDF, DOC, DOCX, hoặc hình ảnh (PNG, JPG)"}</p>
          </div>
        </div>
        {error && (
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1.5 mt-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  },
);
Input.File.displayName = "Input.File";

export default Input;
