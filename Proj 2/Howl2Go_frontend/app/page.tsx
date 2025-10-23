"use client";

import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FrequentlyBoughtSection from "@/components/FrequentlyBoughtSection";
import Footer from "@/components/Footer";

export default function Home() {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--howl-bg)]">
      <Header />

      <div className="pt-15 min-h-screen">
        <HeroSection onSearchFocusChange={setIsSearchFocused} />
      </div>

      <FrequentlyBoughtSection isSearchFocused={isSearchFocused} />

      <Footer />
    </div>
  );
}
