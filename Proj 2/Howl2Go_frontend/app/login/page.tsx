import React from "react";

export default function page() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-[var(--login-bg)]">
      <div className="bg-[var(--login-card-bg)] border border-[var(--login-card-border)] rounded-lg p-8 w-full max-w-md">
        <h1 className="text-[var(--login-heading-text)] text-3xl font-bold mb-6 text-center">
          Login
        </h1>

        <div className="flex flex-col gap-4">
          <input
            className="bg-[var(--login-input-bg)] border border-[var(--login-input-border)] rounded px-4 py-3 text-[var(--login-input-text)] placeholder:text-[var(--login-input-placeholder)] focus:outline-none focus:border-[var(--login-input-border-focus)] transition-colors"
            type="email"
            placeholder="Email"
          />
          <input
            className="bg-[var(--login-input-bg)] border border-[var(--login-input-border)] rounded px-4 py-3 text-[var(--login-input-text)] placeholder:text-[var(--login-input-placeholder)] focus:outline-none focus:border-[var(--login-input-border-focus)] transition-colors"
            type="password"
            placeholder="Password"
          />

          <button className="bg-[var(--login-button-bg)] text-[var(--login-button-text)] font-semibold rounded px-4 py-3 mt-2 hover:bg-[var(--login-button-hover)] transition-colors">
            Log In
          </button>
        </div>
      </div>
    </div>
  );
}
