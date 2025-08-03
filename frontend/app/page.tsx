'use client'

import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Pricing } from "@/components/Pricing";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen aeon-hero-bg">
      <Hero />
      <Features />
      <Pricing />
      <Footer />
    </div>
  );
}
