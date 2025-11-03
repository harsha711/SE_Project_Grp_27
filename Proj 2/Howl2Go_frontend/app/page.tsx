"use client";

import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";

export default function Home() {

  return (
    <div className="min-h-screen bg-[var(--howl-bg)] ">
      <Header />

      <div className="pt-15 ">
        <HeroSection />
      </div>

      {/* <FrequentlyBoughtSection isSearchFocused={isSearchFocused} /> */}

      <Footer />
    </div>
  );
}
