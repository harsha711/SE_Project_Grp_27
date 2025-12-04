/**
 * Header component: top navigation and user controls.
 *
 * Renders the site logo/branding, primary navigation links (About, Dashboard, Orders),
 * the cart link with badge (consumes `CartContext`), and the user menu (consumes
 * `AuthContext`) showing the user's name and logout action. Links and menu items
 * are shown/hidden based on authentication state.
 *
 * @author Ahmed Hassan
 */
"use client";

import Image from "next/image";
import Link from "next/link";
import { User, ShoppingCart, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { summary } = useCart();
  const [showUserMenu, setShowUserMenu] = useState(false);
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
          <Link href="/dashboard" className="flex items-center gap-2">
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
          {/* About Link - shown to all users */}
          <Link
            href="/about"
            className="hidden sm:inline-block font-medium transition-colors hover:opacity-70 text-[var(--howl-neutral)]"
          >
            About
          </Link>

          {isAuthenticated ? (
            <>
              {/* Admin: only show Users management link in header */}
              {user?.role === "admin" && (
                <Link
                  href="/admin/users"
                  className="hidden sm:inline-block font-medium transition-colors hover:opacity-70 text-[var(--howl-neutral)]"
                >
                  Manage Users
                </Link>
              )}

              {/* Staff: only show Orders management link in header */}
              {user?.role === "staff" && (
                <Link
                  href="/staff/orders"
                  className="hidden sm:inline-block font-medium transition-colors hover:opacity-70 text-[var(--howl-neutral)]"
                >
                  Manage Orders
                </Link>
              )}

              <Link
                href="/orders"
                className="hidden sm:inline-block font-medium transition-colors hover:opacity-70 text-[var(--howl-neutral)]"
              >
                My Orders
              </Link>

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
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--orange)] transition-colors"
                >
                  <User className="h-4 w-4 text-[var(--orange)]" />
                  <span className="text-sm font-medium text-[var(--text)] hidden sm:inline">
                    {user?.name}
                  </span>
                </button>

                {/* Dropdown Menu - only Logout */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg shadow-lg py-2 z-50">
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
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
