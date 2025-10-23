"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";

interface SearchBarProps {
  isDemoMode: boolean;
  isSearchFocused: boolean;
  inputValue: string;
  typedText: string;
  onInputChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
}

export default function SearchBar({
  isDemoMode,
  isSearchFocused,
  inputValue,
  typedText,
  onInputChange,
  onKeyDown,
  onSearchFocus,
  onSearchBlur,
}: SearchBarProps) {
  return (
    <div className="w-full">
      {/* Search Bar - Hero Element with Shared Layout ID */}
      <div className="mb-8">
        <motion.div
          layoutId="hero-search-bar"
          className="w-full px-6 py-5 text-xl sm:text-2xl rounded-full border-2 flex items-center min-h-[70px] relative focus-within:outline-none"
          style={{
            backgroundColor: isDemoMode
              ? "var(--search-bar-bg-demo)"
              : "var(--search-bar-bg-live)",
            outline: "none",
          }}
          initial={{ borderColor: "var(--search-bar-border)" }}
          animate={{
            borderColor: isSearchFocused
              ? "var(--orange)"
              : "var(--search-bar-border)",
            boxShadow: isSearchFocused
              ? "0 8px 24px rgba(198, 107, 77, 0.25)"
              : "0 0 0 0 transparent",
            scale: isSearchFocused ? 1.02 : 1,
          }}
          transition={{
            borderColor: {
              type: "spring",
              stiffness: 300,
              damping: 20,
            },
            boxShadow: { duration: 0.25, ease: "easeOut" },
            scale: { duration: 0.15, ease: "easeOut" },
            layout: {
              duration: 0.6,
              ease: [0.4, 0, 0.2, 1],
            },
          }}
          whileHover={{
            boxShadow: isSearchFocused
              ? "0 8px 24px rgba(198, 107, 77, 0.25)"
              : "0 0 0 2px var(--search-bar-hover-glow)",
          }}
        >
          {/* Always-present search input - focusable in both demo and live modes */}
          <input
            type="text"
            placeholder={isDemoMode ? "" : "Search for any craving..."}
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={onSearchFocus}
            onBlur={onSearchBlur}
            autoFocus={!isDemoMode}
            aria-label="Search for food"
            className="flex-1 bg-transparent outline-none focus:outline-none focus:ring-0 border-0 focus:border-0 text-[var(--search-bar-text)] placeholder:text-[var(--search-bar-placeholder)] relative z-10"
            style={{
              color: isDemoMode ? "transparent" : "var(--search-bar-text)",
              caretColor: isDemoMode
                ? "transparent"
                : "var(--search-bar-cursor)",
              boxShadow: "none",
            }}
          />

          {/* Demo Mode: Typewriter text overlay (positioned absolutely, doesn't block input) */}
          {isDemoMode && (
            <div className="absolute inset-0 flex items-center px-6 pointer-events-none select-none">
              <span className="text-[var(--howl-neutral)]">
                {typedText}
              </span>
              <span className="w-0.5 h-7 animate-pulse bg-[var(--howl-primary)] ml-1"></span>
            </div>
          )}

          {/* Search icon in Live Mode with Enter CTA */}
          {!isDemoMode && (
            <div className="flex items-center gap-2 ml-2 relative z-10">
              <motion.div
                animate={{
                  color: isSearchFocused
                    ? "var(--orange)"
                    : "var(--howl-secondary)",
                }}
                transition={{ duration: 0.3 }}
              >
                <Search className="h-6 w-6" />
              </motion.div>
              <AnimatePresence>
                {isSearchFocused && inputValue.trim().length > 0 && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8, x: -10 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: -10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="text-sm font-medium text-[var(--cream)] flex items-center gap-1"
                  >
                    <span className="hidden sm:inline">Press</span>
                    <kbd className="px-2 py-0.5 text-xs bg-[var(--bg-hover)] border border-[var(--border)] rounded">
                      ↵
                    </kbd>
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* CTA Text Below Search Bar (Alternative/Additional Option) */}
        <AnimatePresence>
          {isSearchFocused && inputValue.trim().length > 1 && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 0.7, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="text-center text-sm text-[var(--cream)] mt-3"
            >
              Press Enter to find your craving
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
