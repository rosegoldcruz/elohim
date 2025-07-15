"use client"

import { useEffect, useRef, useCallback } from "react"

interface Particle {
  x: number
  y: number
  z: number
  color: string
  speed: number
  size: number
  opacity: number
  trail: Array<{ x: number; y: number; opacity: number }>
}

interface FloatingOrb {
  x: number
  y: number
  z: number
  radius: number
  color: string
  speed: number
  angle: number
  pulse: number
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationId = useRef<number>()
  const mouseRef = useRef({ x: 0, y: 0 })
  const timeRef = useRef(0)

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current = {
      x: e.clientX,
      y: e.clientY
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Add mouse tracking
    window.addEventListener("mousemove", handleMouseMove)

    const isReducedMotion = document.body.classList.contains("reduced-motion")
    const particleCount = isReducedMotion ? 100 : 400
    const orbCount = isReducedMotion ? 3 : 8
    const particleSpeed = 12

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Enhanced color palette
    const neonColors = [
      "#00ffff", // Neon cyan
      "#8b5cf6", // Electric purple
      "#ff0080", // Neon pink
      "#0080ff", // Electric blue
      "#00ff80", // Matrix green
      "#ff6b6b", // Coral
      "#4ecdc4", // Turquoise
      "#ffeaa7"  // Electric yellow
    ]

    const particles: Particle[] = []
    const floatingOrbs: FloatingOrb[] = []

    // Initialize particles with enhanced properties
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * canvas.width * 3,
        y: (Math.random() - 0.5) * canvas.height * 3,
        z: Math.random() * 3000 + 100,
        color: neonColors[Math.floor(Math.random() * neonColors.length)],
        speed: Math.random() * particleSpeed + particleSpeed / 2,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
        trail: []
      })
    }

    // Initialize floating orbs
    for (let i = 0; i < orbCount; i++) {
      floatingOrbs.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 1000 + 500,
        radius: Math.random() * 80 + 40,
        color: neonColors[Math.floor(Math.random() * neonColors.length)],
        speed: Math.random() * 0.5 + 0.2,
        angle: Math.random() * Math.PI * 2,
        pulse: Math.random() * Math.PI * 2
      })
    }

    const animate = () => {
      timeRef.current += 0.016 // ~60fps

      // Create dynamic background with subtle gradient
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height)
      )
      gradient.addColorStop(0, "rgba(0, 0, 0, 0.95)")
      gradient.addColorStop(0.5, "rgba(5, 5, 15, 0.98)")
      gradient.addColorStop(1, "rgba(0, 0, 0, 1)")

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const mouse = mouseRef.current

      // Draw floating orbs with interactive effects
      floatingOrbs.forEach((orb) => {
        orb.angle += orb.speed * 0.01
        orb.pulse += 0.05

        // Mouse interaction
        const mouseDistance = Math.sqrt(
          Math.pow(mouse.x - orb.x, 2) + Math.pow(mouse.y - orb.y, 2)
        )
        const mouseInfluence = Math.max(0, 1 - mouseDistance / 300)

        // Gentle floating motion
        orb.x += Math.sin(orb.angle) * 0.5 + (mouse.x - orb.x) * mouseInfluence * 0.01
        orb.y += Math.cos(orb.angle * 0.7) * 0.3 + (mouse.y - orb.y) * mouseInfluence * 0.01

        // Keep orbs in bounds
        if (orb.x < -100) orb.x = canvas.width + 100
        if (orb.x > canvas.width + 100) orb.x = -100
        if (orb.y < -100) orb.y = canvas.height + 100
        if (orb.y > canvas.height + 100) orb.y = -100

        // Draw orb with glow effect
        const pulsedRadius = orb.radius + Math.sin(orb.pulse) * 10
        const orbGradient = ctx.createRadialGradient(
          orb.x, orb.y, 0,
          orb.x, orb.y, pulsedRadius
        )
        orbGradient.addColorStop(0, `${orb.color}40`)
        orbGradient.addColorStop(0.3, `${orb.color}20`)
        orbGradient.addColorStop(0.7, `${orb.color}10`)
        orbGradient.addColorStop(1, "transparent")

        ctx.fillStyle = orbGradient
        ctx.beginPath()
        ctx.arc(orb.x, orb.y, pulsedRadius, 0, Math.PI * 2)
        ctx.fill()
      })

      // Enhanced particle system
      particles.forEach((p, index) => {
        // Move particles towards viewer
        p.z -= p.speed

        // Reset particle when too close
        if (p.z <= 0) {
          p.x = (Math.random() - 0.5) * canvas.width * 3
          p.y = (Math.random() - 0.5) * canvas.height * 3
          p.z = 3000
          p.trail = []
        }

        // Perspective projection with enhanced depth
        const scale = 400 / (p.z + 400)
        const x2d = centerX + p.x * scale
        const y2d = centerY + p.y * scale

        // Add to trail
        p.trail.push({ x: x2d, y: y2d, opacity: p.opacity * scale })
        if (p.trail.length > 8) p.trail.shift()

        // Mouse interaction effect
        const mouseDistance = Math.sqrt(
          Math.pow(mouse.x - x2d, 2) + Math.pow(mouse.y - y2d, 2)
        )
        const mouseEffect = Math.max(0, 1 - mouseDistance / 200)

        // Draw particle trail
        ctx.strokeStyle = p.color
        ctx.lineWidth = Math.max(0.5, scale * p.size * (1 + mouseEffect))
        ctx.shadowColor = p.color
        ctx.shadowBlur = 15 + mouseEffect * 10

        if (p.trail.length > 1) {
          ctx.beginPath()
          ctx.moveTo(p.trail[0].x, p.trail[0].y)

          for (let i = 1; i < p.trail.length; i++) {
            const trailPoint = p.trail[i]
            const alpha = (i / p.trail.length) * trailPoint.opacity
            ctx.globalAlpha = alpha
            ctx.lineTo(trailPoint.x, trailPoint.y)
          }

          ctx.stroke()
          ctx.globalAlpha = 1
        }

        // Draw particle head with enhanced glow
        const particleSize = Math.max(1, scale * p.size * 3)
        const headGradient = ctx.createRadialGradient(
          x2d, y2d, 0,
          x2d, y2d, particleSize * 2
        )
        headGradient.addColorStop(0, p.color)
        headGradient.addColorStop(0.5, `${p.color}80`)
        headGradient.addColorStop(1, "transparent")

        ctx.fillStyle = headGradient
        ctx.beginPath()
        ctx.arc(x2d, y2d, particleSize, 0, Math.PI * 2)
        ctx.fill()
      })

      animationId.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      window.removeEventListener("mousemove", handleMouseMove)
      if (animationId.current) {
        cancelAnimationFrame(animationId.current)
      }
    }
  }, [handleMouseMove])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10 tunnel-animation"
    />
  )
}
