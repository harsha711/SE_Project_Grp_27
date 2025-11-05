"use client";

import { motion } from "framer-motion";

interface AnimatedHeadlineProps {
  isSearchFocused: boolean;
}

export default function AnimatedHeadline({ isSearchFocused }: AnimatedHeadlineProps) {
  const headlineContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
    focused: {
      opacity: 0,
      scale: 0.98,
      filter: "blur(4px)",
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1], // Smooth easing curve
      },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    },
  };

  const words = ["Crave", "it.", "Find", "it.", "Instantly."];

  return (
    <motion.h1
      className="text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-12 text-[var(--howl-neutral)]"
      initial="hidden"
      animate={isSearchFocused ? "focused" : "visible"}
      variants={headlineContainerVariants}
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          variants={wordVariants}
          className="inline-block mr-3"
        >
          {word === "Instantly." ? (
            <span className="relative">
              {word}
              <motion.svg
                className="absolute -bottom-2 left-0 w-full"
                height="8"
                viewBox="0 0 200 8"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 1, ease: "easeInOut" }}
              >
                <motion.path
                  d="M2 5C60 2 140 2 198 5"
                  stroke="var(--howl-primary)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </motion.svg>
            </span>
          ) : (
            word
          )}
        </motion.span>
      ))}
    </motion.h1>
  );
}
