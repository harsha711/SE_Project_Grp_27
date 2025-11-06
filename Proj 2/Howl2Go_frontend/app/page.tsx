"use client";

import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="relative bg-[var(--howl-bg)] flex flex-col min-h-screen overflow-hidden">
      {/* Fixed Header */}
      <header
        className="fixed top-0 left-0 w-full z-50"
        style={{ height: "var(--header-height)" }}
      >
        <Header />
      </header>

      {/* Main content fills the space between header and footer */}
      <main
        className="flex items-center justify-center"
        style={{
          paddingTop: "var(--header-height)",
          paddingBottom: "var(--footer-height)",
          minHeight:
            "calc(100vh - var(--header-height) - var(--footer-height))",
        }}
      >
        <HeroSection />
      </main>

      {/* Fixed Footer */}
      <footer
        className="fixed bottom-0 left-0 w-full z-50"
        style={{ height: "var(--footer-height)" }}
      >
        <Footer />
      </footer>
    </div>
  );
}
