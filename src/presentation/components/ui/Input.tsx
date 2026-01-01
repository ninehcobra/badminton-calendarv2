import React, { InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={twMerge(
                        clsx(
                            "w-full px-4 py-3 rounded-lg bg-[#2f2f2f] text-white border border-transparent outline-none transition-all duration-200",
                            "focus:border-tik-cyan focus:ring-1 focus:ring-tik-cyan placeholder-gray-500",
                            error && "border-tik-red focus:border-tik-red focus:ring-tik-red",
                            className
                        )
                    )}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-xs text-tik-red">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";
