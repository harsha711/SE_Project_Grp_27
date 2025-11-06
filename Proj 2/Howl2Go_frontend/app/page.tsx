"use client";

import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--howl-bg)]">
      <Header />

      <main className="flex-1 flex items-center justify-center">
        <HeroSection />
      </main>

      <Footer />
    </div>
  );
}
