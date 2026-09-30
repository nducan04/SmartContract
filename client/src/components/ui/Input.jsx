import React from "react";

/**
 * Reusable Input component with consistent styling.
 *
 * Usage:
 *   <Input
 *     label="Receiver Wallet"
 *     placeholder="0x..."
 *     value={value}
 *     onChange={(e) => setValue(e.target.value)}
 *     error="Invalid address"
 *     required
 *   />
 *
 *   <Input.Textarea label="Terms" rows={4} />
 *   <Input.Select label="Status" options={[...]} />
 *   <Input.File label="Upload" onFileChange={handler} />
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
      icon,
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
            className="block text-xs font-semibold text-gray-600 uppercase tracking-wider"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
              <i className={`uil ${icon} text-lg`}></i>
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
              w-full bg-gray-50/80 border rounded-xl px-4 py-2.5
              text-gray-800 text-base placeholder-gray-400
              outline-none transition-all duration-200
              focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100
              ${icon ? "pl-10" : ""}
              ${error ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-gray-200"}
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
              ${inputClassName}
            `}
            {...rest}
          />
        </div>
        {error && (
          <p className="text-xs text-red-600 font-medium flex items-center gap-1">
            <i className="uil uil-exclamation-octagon"></i>
            {error}
          </p>
        )}
        {helperText && (
          <p className="text-xs text-gray-500">{helperText}</p>
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
            className="block text-xs font-semibold text-gray-600 uppercase tracking-wider"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
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
            w-full bg-gray-50/80 border rounded-xl px-4 py-3
            text-gray-800 text-base placeholder-gray-400
            outline-none transition-all duration-200 resize-y
            focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100
            ${error ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-gray-200"}
          `}
          {...rest}
        />
        {error && (
          <p className="text-xs text-red-600 font-medium flex items-center gap-1">
            <i className="uil uil-exclamation-octagon"></i>
            {error}
          </p>
        )}
        {helperText && <p className="text-xs text-gray-500">{helperText}</p>}
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
            className="block text-xs font-semibold text-gray-600 uppercase tracking-wider"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          className={`
            w-full bg-gray-50/80 border rounded-xl px-4 py-2.5
            text-gray-800 text-base outline-none transition-all duration-200
            focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100
            appearance-none cursor-pointer
            ${error ? "border-red-400" : "border-gray-200"}
          `}
          {...rest}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
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
            className="block text-xs font-semibold text-gray-600 uppercase tracking-wider"
          >
            {label}
            <span className="text-red-500 ml-1">*</span>
          </label>
        )}
        <div
          className={`
            relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
            transition-all duration-200
            ${error ? "border-red-300 bg-red-50/30" : "border-gray-200 bg-gray-50/50 hover:border-blue-400 hover:bg-blue-50/30"}
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
          <i className="uil uil-upload-alt text-3xl text-gray-400 mb-3"></i>
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 cursor-pointer">
            {label || "Chọn file"}
          </label>
          <p className="text-xs text-gray-500 mt-1">{helperText || "PDF, DOC, DOCX, hoặc ảnh"}</p>
        </div>
        {error && (
          <p className="text-xs text-red-600 font-medium flex items-center gap-1">
            <i className="uil uil-exclamation-octagon"></i>
            {error}
          </p>
        )}
      </div>
    );
  },
);
Input.File.displayName = "Input.File";

export default Input;
