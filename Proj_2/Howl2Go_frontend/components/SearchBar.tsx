"use client";

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
        <div
          className={`w-full px-6 py-5 text-xl sm:text-2xl rounded-full border-2 flex items-center min-h-[70px] relative transition-all duration-500 ease-out ${
            isSearchFocused
              ? 'border-[var(--orange)] shadow-[0_8px_24px_rgba(198,107,77,0.25)] scale-[1.02]'
              : 'border-[var(--search-bar-border)] shadow-none scale-100'
          }`}
          style={{
            backgroundColor: isDemoMode
              ? "var(--search-bar-bg-demo)"
              : "var(--search-bar-bg-live)",
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
            className="flex-1 bg-transparent border-none focus:border-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 text-[var(--search-bar-text)] placeholder:text-[var(--search-bar-placeholder)] relative z-10"
          />

          {/* Demo Mode: Typewriter text overlay (positioned absolutely, doesn't block input) */}
          {isDemoMode && (
            <div className="absolute inset-0 flex items-center px-6 pointer-events-none select-none">
              <span className="text-[var(--howl-neutral)]">{typedText}</span>
              <span className="w-0.5 h-7 animate-pulse bg-[var(--howl-primary)] ml-1"></span>
            </div>
          )}

          {/* Search icon in Live Mode with Enter CTA */}
          {!isDemoMode && (
            <div className="flex items-center gap-2 ml-2 relative z-10">
              <div
                className={`transition-colors duration-300 ${
                  isSearchFocused ? 'text-[var(--orange)]' : 'text-[var(--howl-secondary)]'
                }`}
              >
                <Search className="h-6 w-6" />
              </div>
              {isSearchFocused && inputValue.trim().length > 0 && (
                <span className="text-sm font-medium text-[var(--cream)] flex items-center gap-1 animate-[fadeIn_0.3s_ease-out]">
                  <span className="hidden sm:inline">Press</span>
                  <kbd className="px-2 py-0.5 text-xs bg-[var(--bg-hover)] border border-[var(--border)] rounded">
                    ↵
                  </kbd>
                </span>
              )}
            </div>
          )}
        </div>

        {/* CTA Text Below Search Bar */}
        {isSearchFocused && inputValue.trim().length > 1 && (
          <p className="text-center text-sm text-[var(--cream)] mt-3 opacity-70 animate-[fadeIn_0.3s_ease-out]">
            Press Enter to find your craving
          </p>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
}
