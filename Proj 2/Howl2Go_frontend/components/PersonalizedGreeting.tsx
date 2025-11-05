"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface PersonalizedGreetingProps {
  userName: string;
  isSearchFocused?: boolean;
}

export default function PersonalizedGreeting({
  userName,
  isSearchFocused = false,
}: PersonalizedGreetingProps) {
  const [greeting, setGreeting] = useState("Hello");

  // Dynamic time-based greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good morning");
    } else if (hour < 18) {
      setGreeting("Good afternoon");
    } else {
      setGreeting("Good evening");
    }
  }, []);

  // Get motivational tagline
  const getTagline = () => {
    const taglines = [
      "Track. Log. Succeed.",
      "Your health journey continues.",
      "Making healthy choices easy.",
      "Stay on track, stay motivated.",
    ];
    // Use day of month to rotate taglines consistently
    const dayIndex = new Date().getDate() % taglines.length;
    return taglines[dayIndex];
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2,
      },
    },
    focused: {
      opacity: 0,
      scale: 0.98,
      filter: "blur(4px)",
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
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

  // Split into words for animation
  const greetingWords = `${greeting}, ${userName}`.split(" ");
  const tagline = getTagline();

  return (
    <div className="text-center mb-12">
      {/* Main greeting */}
      <motion.h1
        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-[var(--howl-neutral)]"
        initial="hidden"
        animate={isSearchFocused ? "focused" : "visible"}
        variants={containerVariants}
      >
        {greetingWords.map((word, index) => (
          <motion.span
            key={`${word}-${index}`}
            variants={wordVariants}
            className="inline-block mr-3"
          >
            {word}
          </motion.span>
        ))}
      </motion.h1>

      {/* Subtitle tagline */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={
          isSearchFocused
            ? { opacity: 0, y: -10 }
            : { opacity: 0.7, y: 0 }
        }
        transition={{ duration: 0.5, delay: isSearchFocused ? 0 : 0.8 }}
        className="text-lg sm:text-xl text-[var(--text-subtle)] mt-4"
      >
        {tagline}
      </motion.p>

      {/* Date indicator */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={
          isSearchFocused
            ? { opacity: 0 }
            : { opacity: 0.5 }
        }
        transition={{ duration: 0.5, delay: isSearchFocused ? 0 : 1 }}
        className="text-sm text-[var(--text-muted)] mt-2"
      >
        {new Date().toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </motion.p>
    </div>
  );
}
