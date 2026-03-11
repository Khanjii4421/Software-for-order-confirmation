"use client";

import { motion } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface PremiumCardProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}

export function PremiumCard({ children, className, delay = 0 }: PremiumCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className={cn(
                "bg-white/80 backdrop-blur-md border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-2xl p-6 transition-all hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] hover:border-indigo-500/30",
                className
            )}
        >
            {children}
        </motion.div>
    );
}

export function PremiumButton({
    children,
    className,
    onClick,
    type = "button",
    disabled,
    loading
}: {
    children: React.ReactNode,
    className?: string,
    onClick?: () => void,
    type?: "button" | "submit",
    disabled?: boolean,
    loading?: boolean
}) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={cn(
                "relative flex items-center justify-center px-6 py-3 rounded-xl font-bold text-white transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none overflow-hidden group",
                "bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] hover:bg-[right_center]",
                className
            )}
        >
            <span className="relative z-10">{children}</span>
        </button>
    );
}
