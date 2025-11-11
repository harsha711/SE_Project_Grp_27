"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchUserProfile } from "@/lib/api/user";

export default function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated } = useAuth();

  // Get return URL from query params
  const returnUrl = searchParams.get("returnUrl") || "/dashboard";

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.replace(returnUrl);
    }
  }, [isAuthenticated, router, returnUrl]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Call login API
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        setIsLoading(false);
        return;
      }

      // Fetch user profile after successful login
      try {
        const userProfile = await fetchUserProfile();

        // Update auth context
        login(userProfile);
      } catch (profileError) {
        console.error("Failed to fetch user profile:", profileError);
        // Continue with redirect even if profile fetch fails
        // The AuthProvider will refetch the profile on mount
      }

      // Use window.location.href for more reliable redirect in production
      window.location.href = returnUrl;
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-[var(--login-bg)]">
      <div className="bg-[var(--login-card-bg)] border border-[var(--login-card-border)] rounded-lg p-8 w-full max-w-md">
        <h1 className="text-[var(--login-heading-text)] text-3xl font-bold mb-6 text-center">
          Login
        </h1>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            className="bg-[var(--login-input-bg)] border border-[var(--login-input-border)] rounded px-4 py-3 text-[var(--login-input-text)] placeholder:text-[var(--login-input-placeholder)] focus:outline-none focus:border-[var(--login-input-border-focus)] transition-colors"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="bg-[var(--login-input-bg)] border border-[var(--login-input-border)] rounded px-4 py-3 text-[var(--login-input-text)] placeholder:text-[var(--login-input-placeholder)] focus:outline-none focus:border-[var(--login-input-border-focus)] transition-colors"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="bg-[var(--login-button-bg)] text-[var(--login-button-text)] font-semibold rounded px-4 py-3 mt-2 hover:bg-[var(--login-button-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[var(--login-input-text)] text-sm">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-[var(--orange)] hover:underline font-semibold"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
