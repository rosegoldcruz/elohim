"use client"

import { useLayoutEffect } from "react"

// This component runs client-side to detect device capabilities and apply optimizations.
export default function PerformanceOptimizer() {
  useLayoutEffect(() => {
    // Detect low-end devices based on CPU cores
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
      document.body.classList.add("reduced-motion")
    }

    // Intersection Observer to pause animations when not visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("animation-paused")
          } else {
            entry.target.classList.add("animation-paused")
          }
        })
      },
      { threshold: 0.1 },
    )

    const animatedElements = document.querySelectorAll(".animate-on-scroll")
    animatedElements.forEach((el) => observer.observe(el))

    return () => {
      animatedElements.forEach((el) => observer.unobserve(el))
    }
  }, [])

  return null
}
