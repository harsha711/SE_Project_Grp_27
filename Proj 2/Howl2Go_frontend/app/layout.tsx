import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Howl2Go - Smart Menu Food Discovery",
  description: "Find your next favorite meal instantly. No traditional menu - just search for what you're craving and discover amazing dishes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <CartProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "var(--bg-card)",
                  color: "var(--text)",
                  border: "1px solid var(--border)",
                },
                success: {
                  iconTheme: {
                    primary: "var(--success)",
                    secondary: "var(--bg-card)",
                  },
                },
                error: {
                  iconTheme: {
                    primary: "var(--error)",
                    secondary: "var(--bg-card)",
                  },
                },
              }}
            />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
