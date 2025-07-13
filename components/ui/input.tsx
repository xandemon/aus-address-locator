import { InputHTMLAttributes, forwardRef, useState } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  errorMessage?: string;
  label?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, errorMessage, label, hint, id, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(
      !!props.value || !!props.defaultValue
    );
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const handleFocus = () => setIsFocused(true);
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(!!e.target.value);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value);
      props.onChange?.(e);
    };

    return (
      <div className="space-y-2">
        <div className="relative">
          <input
            id={inputId}
            className={cn(
              "peer w-full px-4 py-4 text-sm text-gray-500 font-medium border border-slate-300 rounded-xl bg-white placeholder-transparent transition-all duration-200",
              "focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none",
              "disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed",
              error &&
                "border-red-400 focus:border-red-500 focus:ring-red-500/10",
              className
            )}
            ref={ref}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            placeholder={label || props.placeholder}
            {...props}
          />

          {label && (
            <label
              htmlFor={inputId}
              className={cn(
                "absolute left-4 transition-all duration-200 pointer-events-none",
                "bg-white px-1 text-sm",
                isFocused || hasValue || props.value
                  ? "-top-2 text-xs text-slate-600 font-medium"
                  : "top-4 text-slate-500",
                isFocused && !error && "text-blue-600",
                error && "text-red-600"
              )}
            >
              {label}
            </label>
          )}
        </div>

        {hint && !error && (
          <p className="text-xs text-slate-500 px-1">{hint}</p>
        )}

        {error && errorMessage && (
          <p className="text-xs text-red-600 px-1 flex items-center">
            <svg
              className="w-3 h-3 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input, type InputProps };
