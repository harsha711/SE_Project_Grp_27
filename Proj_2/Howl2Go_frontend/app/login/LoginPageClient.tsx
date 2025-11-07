"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchUserProfile } from "@/lib/api/user";

export default function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

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
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        setIsLoading(false);
        return;
      }

      // Fetch user profile after successful login
      const userProfile = await fetchUserProfile();

      // Update auth context
      login(userProfile);

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
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
