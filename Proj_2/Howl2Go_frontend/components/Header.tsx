"use client";

import Image from "next/image";
import Link from "next/link";
import { User, ShoppingCart, LogOut, Bug } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useState, useEffect, useRef } from "react";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { summary } = useCart();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);
  return (
    <header
      className="absolute top-0 left-0 right-0 z-50 border-b backdrop-blur-sm"
      style={{
        borderColor: "color-mix(in srgb, var(--howl-neutral) 10%, transparent)",
        backgroundColor: "color-mix(in srgb, var(--howl-bg) 95%, transparent)",
      }}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
        {/* Left Side: Logo + Branding */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/Howl2go_orange_logo_transparent.png"
              alt="Howl2Go Logo"
              width={60}
              height={20}
              priority
            />
            <span className="text-4xl font-bold tracking-tight text-[var(--howl-secondary)]">
              Howl<span className="text-[var(--orange)]">2</span>Go
            </span>
          </Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* About Link */}
          <Link
            href="/about"
            className="hidden sm:inline-block font-medium transition-colors hover:opacity-70 text-[var(--howl-neutral)]"
          >
            About
          </Link>

          {isAuthenticated ? (
            <>
              {/* Dashboard Link - when logged in */}
              <Link
                href="/dashboard"
                className="hidden sm:inline-block font-medium transition-colors hover:opacity-70 text-[var(--howl-neutral)]"
              >
                Dashboard
              </Link>

              {/* Orders Link - when logged in */}
              <Link
                href="/orders"
                className="hidden sm:inline-block font-medium transition-colors hover:opacity-70 text-[var(--howl-neutral)]"
              >
                Orders
              </Link>

              {/* Cart Link with Badge - only shown when logged in */}
              <Link
                href="/cart"
                className="relative p-2 transition-colors hover:opacity-70 text-[var(--howl-neutral)]"
              >
                <ShoppingCart className="h-5 w-5" />
                {summary.totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[var(--orange)] text-[var(--text)] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {summary.totalItems}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--orange)] transition-colors"
                >
                  <User className="h-4 w-4 text-[var(--orange)]" />
                  <span className="text-sm font-medium text-[var(--text)] hidden sm:inline">
                    {user?.name}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg shadow-lg py-2 z-50">
                    <Link
                      href="/bug-report"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full text-left px-4 py-2 text-sm text-[var(--text)] hover:bg-[var(--bg-hover)] transition-colors flex items-center gap-2"
                    >
                      <Bug className="h-4 w-4" />
                      Raise a Bug
                    </Link>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-[var(--error)] hover:bg-[var(--bg-hover)] transition-colors flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Log In Link - when logged out */}
              <Link
                href="/login"
                className="hidden sm:inline-block font-medium transition-colors hover:opacity-70 text-[var(--howl-neutral)]"
              >
                Log In
              </Link>

              {/* Dashboard Button - when logged out */}
              <Link
                href="/dashboard"
                className="px-5 py-2 font-semibold rounded-full transition-all hover:scale-105 hover:shadow-md bg-[var(--howl-secondary)] text-[var(--howl-bg)]"
              >
                Dashboard
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
