"use client"

import { useEffect, useRef } from "react"

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationId = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const isReducedMotion = document.body.classList.contains("reduced-motion")
    const particleCount = isReducedMotion ? 50 : 250
    const particleSpeed = 8

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const particles: Array<{
      x: number
      y: number
      z: number
      color: string
      speed: number
    }> = []

    const colors = ["#8b5cf6", "#06b6d4", "#ec4899", "#3b82f6"] // Purple, Cyan, Pink, Blue

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * canvas.width * 2,
        y: (Math.random() - 0.5) * canvas.height * 2,
        z: Math.random() * 2000, // Start particles at various depths
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: Math.random() * particleSpeed + particleSpeed / 2,
      })
    }

    const animate = () => {
      // Clear canvas with a transparent black overlay to create trails
      // The main background is pure black from the body/layout
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      particles.forEach((p) => {
        p.z -= p.speed // Move particle towards the camera

        // Reset particle if it's too close or behind the camera
        if (p.z <= 0) {
          p.z = 2000 // Reset to the back
          p.x = (Math.random() - 0.5) * canvas.width * 2
          p.y = (Math.random() - 0.5) * canvas.height * 2
        }

        // Perspective projection
        const scale = 300 / (p.z + 300) // Add to p.z to prevent division by zero and keep particles from becoming too large
        const x2d = centerX + p.x * scale
        const y2d = centerY + p.y * scale

        // Calculate line length based on speed and distance (streaks get longer as they approach)
        const lineLength = scale * p.speed * 2 // Adjust multiplier for desired streak length

        // Angle for the streak direction (pointing away from center)
        const angle = Math.atan2(y2d - centerY, x2d - centerX)

        // Draw the neon streak
        ctx.beginPath()
        ctx.strokeStyle = p.color
        ctx.lineWidth = Math.max(0.5, scale * 2.5) // Lines get thicker as they approach
        ctx.shadowColor = p.color // Glow effect
        ctx.shadowBlur = 12 // Glow intensity

        // Start point of the streak (tail)
        const startX = x2d - Math.cos(angle) * lineLength
        const startY = y2d - Math.sin(angle) * lineLength

        ctx.moveTo(startX, startY)
        ctx.lineTo(x2d, y2d) // End point of the streak (head)
        ctx.stroke()
      })

      animationId.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      if (animationId.current) {
        cancelAnimationFrame(animationId.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10 tunnel-streaks tunnel-animation"
      // Canvas itself should be transparent to show the pure black body background
      style={{ backgroundColor: "transparent" }}
    />
  )
}
