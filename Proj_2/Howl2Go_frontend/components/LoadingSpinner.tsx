"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  className?: string;
}

export default function LoadingSpinner({
  message = "Loading...",
  size = "md",
  fullScreen = false,
  className = "",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const containerClasses = fullScreen
    ? "min-h-screen flex items-center justify-center"
    : "flex items-center justify-center py-8";

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="flex flex-col items-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <Loader2
            className={`${sizeClasses[size]} text-[var(--orange)]`}
          />
        </motion.div>
        {message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-[var(--text-subtle)]"
          >
            {message}
          </motion.p>
        )}
      </div>
    </div>
  );
}

