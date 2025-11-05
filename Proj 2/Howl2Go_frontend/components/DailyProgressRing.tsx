"use client";

import { motion } from "framer-motion";
import type { DailyProgress } from "@/types/user";

interface DailyProgressRingProps {
  dailyProgress: DailyProgress;
  size?: "small" | "large";
  onClick?: () => void;
}

export default function DailyProgressRing({
  dailyProgress,
  size = "large",
  onClick,
}: DailyProgressRingProps) {
  const { consumed, goal, remaining, percentage } = dailyProgress;

  // Size configurations
  const dimensions = size === "large" ? 140 : 60;
  const strokeWidth = size === "large" ? 12 : 6;
  const radius = (dimensions - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Color based on progress
  const getProgressColor = () => {
    if (percentage < 50) return "var(--success)";
    if (percentage < 80) return "var(--orange)";
    if (percentage < 100) return "var(--warning)";
    return "var(--error)";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`relative ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.05 } : undefined}
      whileTap={onClick ? { scale: 0.95 } : undefined}
    >
      {/* SVG Progress Ring */}
      <svg
        width={dimensions}
        height={dimensions}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={dimensions / 2}
          cy={dimensions / 2}
          r={radius}
          stroke="var(--bg-hover)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Progress circle */}
        <motion.circle
          cx={dimensions / 2}
          cy={dimensions / 2}
          r={radius}
          stroke={getProgressColor()}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeInOut", delay: 0.3 }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {size === "large" ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-[var(--text)]">
                {consumed.toLocaleString()}
              </div>
              <div className="text-xs text-[var(--text-muted)] mt-0.5">
                of {goal.toLocaleString()}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.4 }}
              className="text-xs font-medium text-[var(--text-subtle)] mt-1"
            >
              {remaining > 0 ? `${remaining} left` : "Goal reached!"}
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="text-[10px] font-bold text-[var(--text)] text-center leading-tight"
          >
            <div>{consumed}</div>
            <div className="text-[8px] text-[var(--text-muted)]">/{goal}</div>
          </motion.div>
        )}
      </div>

      {/* Tooltip on hover (large size only) */}
      {size === "large" && onClick && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileHover={{ opacity: 1, y: 0 }}
          className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-subtle)] whitespace-nowrap pointer-events-none"
        >
          {consumed} cal consumed • {remaining} remaining
        </motion.div>
      )}
    </motion.div>
  );
}
