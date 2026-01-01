import React, { ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, children, variant = 'primary', isLoading, disabled, ...props }, ref) => {
        const baseStyles = "inline-flex items-center justify-center rounded-lg font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

        const variants = {
            primary: "bg-tik-cyan text-black hover:bg-[#00d8d0] focus:ring-tik-cyan shadow-[0_0_15px_rgba(0,242,234,0.4)] hover:shadow-[0_0_25px_rgba(0,242,234,0.6)]",
            secondary: "bg-tik-red text-white hover:bg-[#e60048] focus:ring-tik-red shadow-[0_0_15px_rgba(255,0,80,0.4)] hover:shadow-[0_0_25px_rgba(255,0,80,0.6)]",
            outline: "border-2 border-tik-cyan text-tik-cyan hover:bg-tik-cyan/10",
            ghost: "text-gray-300 hover:text-white hover:bg-white/10",
        };

        const sizes = "px-6 py-3 text-sm";

        return (
            <button
                ref={ref}
                className={twMerge(clsx(baseStyles, variants[variant], sizes, className))}
                disabled={isLoading || disabled}
                {...props}
            >
                {isLoading ? (
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : null}
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";
