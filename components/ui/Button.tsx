"use client";

import React from "react";
import clsx from "clsx";

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      fullWidth = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      className,
      disabled,
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseClasses = clsx(
      // Base styles
      "inline-flex items-center justify-center gap-2",
      "font-medium transition-colors",
      "focus:outline-none focus:ring-2 focus:ring-offset-2",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      "rounded-lg",
      // Touch target compliance - minimum 44px height
      "min-h-[44px]",
      // Responsive padding and text sizing
      size === "sm" && "px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm",
      size === "md" && "px-4 py-2 md:px-5 md:py-2.5 text-sm md:text-base",
      size === "lg" && "px-5 py-2.5 md:px-6 md:py-3 text-base md:text-lg",
      // Width
      fullWidth ? "w-full" : "w-full md:w-auto",
      // Variant styles
      variant === "primary" &&
        "bg-primary text-white hover:bg-primary-hover focus:ring-primary",
      variant === "secondary" &&
        "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500",
      variant === "outline" &&
        "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-500",
      variant === "ghost" &&
        "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
      variant === "danger" &&
        "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
      className
    );

    return (
      <button
        ref={ref}
        type={type}
        className={baseClasses}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0 w-4 h-4 md:w-5 md:h-5 [&>svg]:w-full [&>svg]:h-full">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="flex-shrink-0 w-4 h-4 md:w-5 md:h-5 [&>svg]:w-full [&>svg]:h-full">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
