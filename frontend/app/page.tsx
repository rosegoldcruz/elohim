'use client'

import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Pricing } from "@/components/Pricing";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ff007f] to-[#a100ff]">
      <Hero />
      <Features />
      <Pricing />
      <Footer />
    </div>
  );
}
