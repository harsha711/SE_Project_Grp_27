"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  TrendingUp,
  ShoppingCart,
  Shield,
  Zap,
  Heart,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AboutPage() {
  const features = [
    {
      icon: <Search className="h-8 w-8" />,
      title: "Search-First Discovery",
      description:
        "No endless scrolling through menus. Just search for what you're craving and find it instantly across all restaurants.",
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Instant Nutrition Facts",
      description:
        "Get complete nutritional information for every item - calories, protein, carbs, fats, and more at a glance.",
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Health Tracking Dashboard",
      description:
        "Track your daily nutrition goals, monitor calories, and see your progress with our intuitive dashboard.",
    },
    {
      icon: <ShoppingCart className="h-8 w-8" />,
      title: "Smart Cart Management",
      description:
        "Add items to your cart from multiple restaurants with real-time price calculations and seamless checkout.",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Secure & Private",
      description:
        "Your data is protected with industry-standard security. We use httpOnly cookies and encrypted connections.",
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Lightning Fast",
      description:
        "Built with Next.js and optimized for performance. Get results in milliseconds, not seconds.",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--howl-bg)]">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[var(--howl-neutral)] mb-6">
              About{" "}
              <span className="text-[var(--orange)] relative">
                Howl2Go
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  height="8"
                  viewBox="0 0 200 8"
                  fill="none"
                >
                  <path
                    d="M2 5C60 2 140 2 198 5"
                    stroke="var(--orange)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-[var(--text-subtle)] max-w-3xl mx-auto leading-relaxed">
              The smart way to discover food nutrition. No menus. No hassle.
              Just search, find, and track your health goals.
            </p>
          </motion.div>
        </div>
      </section>

      {/* What is Howl2Go */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8 sm:p-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text)] mb-6">
              What is Howl2Go?
            </h2>
            <div className="space-y-4 text-lg text-[var(--text-subtle)] leading-relaxed">
              <p>
                Howl2Go is a revolutionary food delivery platform that puts
                nutrition information first. We believe you shouldn&apos;t have
                to scroll through endless menus to find what you&apos;re looking
                for.
              </p>
              <p>
                Instead, we let you{" "}
                <strong className="text-[var(--cream)]">
                  search for exactly what you want
                </strong>{" "}
                - whether it&apos;s a burger, a salad, or something specific
                like &quot;low-carb breakfast&quot; - and instantly show you
                matching items across all restaurants with complete nutritional
                information.
              </p>
              <p>
                Built with modern web technologies like{" "}
                <span className="text-[var(--orange)]">Next.js</span>,{" "}
                <span className="text-[var(--orange)]">React</span>, and{" "}
                <span className="text-[var(--orange)]">TypeScript</span>,
                Howl2Go delivers a premium, lightning-fast experience with a
                beautiful dark-mode interface designed for food lovers and
                health-conscious eaters alike.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-[var(--text)] mb-4">
              Key Features
            </h2>
            <p className="text-lg text-[var(--text-subtle)]">
              Everything you need for smarter food choices
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 hover:border-[var(--orange)] transition-all"
              >
                <div className="text-[var(--orange)] mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-[var(--text)] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[var(--text-subtle)] leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8 sm:p-12 text-center"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text)] mb-6">
              Built with Modern Technology
            </h2>
            <p className="text-lg text-[var(--text-subtle)] mb-8">
              Howl2Go is powered by cutting-edge web technologies to deliver a
              fast, reliable, and beautiful experience.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                "Next.js",
                "React",
                "TypeScript",
                "Tailwind CSS",
                "Framer Motion",
                "Node.js",
              ].map((tech) => (
                <span
                  key={tech}
                  className="px-6 py-3 bg-[var(--bg-hover)] border border-[var(--border)] rounded-full text-[var(--cream)] font-medium hover:border-[var(--orange)] transition-colors"
                >
                  {tech}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-[var(--text)] mb-6">
              Ready to get started?
            </h2>
            <p className="text-xl text-[var(--text-subtle)] mb-8">
              Search for your next meal and track your nutrition goals today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="px-8 py-4 rounded-full font-semibold text-lg bg-[var(--orange)] text-[var(--text)] hover:bg-[var(--cream)] hover:text-[var(--bg)] transition-all hover:scale-105 hover:shadow-lg"
              >
                Start Searching
              </Link>
              <Link
                href="/dashboard"
                className="px-8 py-4 rounded-full font-semibold text-lg bg-[var(--bg-card)] border-2 border-[var(--orange)] text-[var(--orange)] hover:bg-[var(--orange)] hover:text-[var(--text)] transition-all hover:scale-105"
              >
                View Dashboard
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
