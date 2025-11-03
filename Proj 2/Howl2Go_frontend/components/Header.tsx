"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";

export default function Header() {
  return (
    <header
      className="absolute top-0 left-0 right-0 z-50 border-b backdrop-blur-sm"
      style={{
        borderColor:
          "color-mix(in srgb, var(--howl-neutral) 10%, transparent)",
        backgroundColor:
          "color-mix(in srgb, var(--howl-bg) 95%, transparent)",
      }}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          <button
            className="p-2 transition-colors rounded-lg hover:bg-[color-mix(in_srgb,var(--howl-primary)_10%,transparent)]"
            aria-label="Menu"
          >
            <Menu className="h-6 w-6 text-[var(--howl-neutral)]" />
          </button>
          
          <Link href="/">
            <Image
              src="/Howl2go_orange_logo_transparent.png"
              alt="Howl2Go Logo"
              width={60}
              height={20}
              priority
            />
          </Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-6">
          <Link
            href="/about"
            className="hidden sm:inline-block font-medium transition-colors hover:opacity-70 text-[var(--howl-neutral)]"
          >
            About
          </Link>
          <Link
            href="/login"
            className="hidden sm:inline-block font-medium transition-colors hover:opacity-70 text-[var(--howl-neutral)]"
          >
            Log In
          </Link>

          <Link
            href="/cart"
            className="hidden sm:inline-block font-medium transition-colors hover:opacity-70 text-[var(--howl-neutral)]"
          >
            Cart  
          </Link>
          <Link
            href="/dashboard"
            className="px-5 py-2 font-semibold rounded-full transition-all hover:scale-105 hover:shadow-md bg-[var(--howl-secondary)] text-[var(--howl-bg)]"
          >
            Dashboard
          </Link>
        </div>
      </nav>
    </header>
  );
}
