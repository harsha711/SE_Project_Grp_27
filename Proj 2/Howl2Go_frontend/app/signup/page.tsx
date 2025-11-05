"use client";

import React from "react";
import Link from "next/link";

export default function SignupPage() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Basic validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      // Redirect after successful registration
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    }
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-[var(--login-bg)]">
      <div className="bg-[var(--login-card-bg)] border border-[var(--login-card-border)] rounded-lg p-8 w-full max-w-md">
        <h1 className="text-[var(--login-heading-text)] text-3xl font-bold mb-6 text-center">
          Sign Up
        </h1>

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <input
            className="bg-[var(--login-input-bg)] border border-[var(--login-input-border)] rounded px-4 py-3 text-[var(--login-input-text)] placeholder:text-[var(--login-input-placeholder)] focus:outline-none focus:border-[var(--login-input-border-focus)] transition-colors"
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            maxLength={100}
          />
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
            placeholder="Password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="bg-[var(--login-button-bg)] text-[var(--login-button-text)] font-semibold rounded px-4 py-3 mt-2 hover:bg-[var(--login-button-hover)] transition-colors"
          >
            Sign Up
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[var(--login-input-text)] text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[var(--orange)] hover:underline font-semibold"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
