"use client";

import { Suspense } from "react";
import LoginPageClient from "./LoginPageClient";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex justify-center items-center">
          Loading...
        </div>
      }
    >
      <LoginPageClient />
    </Suspense>
  );
}
