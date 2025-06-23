"use client"

import { useEffect, useRef } from "react"

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationId = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const isReducedMotion = document.body.classList.contains("reduced-motion")
    const isLowEnd = navigator.hardwareConcurrency < 4
    const ringCount = isReducedMotion ? 8 : isLowEnd ? 15 : 20
    const speed = 3
    
    // Performance throttling
    let lastFrameTime = 0
    const targetFPS = isLowEnd ? 30 : 60
    const frameInterval = 1000 / targetFPS

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    let time = 0
    const centerX = () => canvas.width / 2
    const centerY = () => canvas.height / 2

    const rings: Array<{
      z: number
      rotation: number
      color: string
      opacity: number
    }> = []

    // Initialize rings at proper intervals for immediate visibility
    for (let i = 0; i < ringCount; i++) {
      rings.push({
        z: i * 60 - 300, // Start some in front, some behind
        rotation: i * 0.3,
        color: ["#8b5cf6", "#06b6d4", "#ec4899", "#3b82f6", "#10b981"][i % 5],
        opacity: 0.6 + Math.random() * 0.4
      })
    }

    const drawRing = (ring: typeof rings[0]) => {
      const perspective = 400
      const scale = perspective / (ring.z + perspective)
      
      if (scale <= 0.01 || scale > 10) return

      const radius = Math.min(canvas.width, canvas.height) * 0.4 * scale
      const x = centerX()
      const y = centerY()
      const alpha = Math.min(ring.opacity * scale, 1)

      // Main ring
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.strokeStyle = `${ring.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`
      ctx.lineWidth = scale * 6
      ctx.shadowColor = ring.color
      ctx.shadowBlur = scale * 20
      ctx.stroke()

      // Inner glow
      ctx.beginPath()
      ctx.arc(x, y, radius * 0.9, 0, Math.PI * 2)
      ctx.strokeStyle = `${ring.color}${Math.floor(alpha * 128).toString(16).padStart(2, '0')}`
      ctx.lineWidth = scale * 3
      ctx.stroke()

      // Spiral lights
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + ring.rotation + time * 0.02
        const lightRadius = radius * (0.85 + 0.15 * Math.sin(time * 0.05 + i))
        const lightX = x + Math.cos(angle) * lightRadius
        const lightY = y + Math.sin(angle) * lightRadius
        
        const lightGradient = ctx.createRadialGradient(lightX, lightY, 0, lightX, lightY, scale * 12)
        lightGradient.addColorStop(0, `${ring.color}FF`)
        lightGradient.addColorStop(1, `${ring.color}00`)
        
        ctx.beginPath()
        ctx.arc(lightX, lightY, scale * 6, 0, Math.PI * 2)
        ctx.fillStyle = lightGradient
        ctx.fill()
      }
    }

    const animate = (currentTime: number) => {
      // Throttle frame rate for performance
      if (currentTime - lastFrameTime < frameInterval) {
        animationId.current = requestAnimationFrame(animate)
        return
      }
      lastFrameTime = currentTime

      time += 0.016

      // Clear canvas efficiently
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = "#000000"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Batch drawing operations
      ctx.shadowBlur = 0 // Reset shadow for performance
      
      rings.forEach((ring) => {
        ring.z += speed
        ring.rotation += 0.02

        if (ring.z > 800) {
          ring.z = -400
          ring.color = ["#8b5cf6", "#06b6d4", "#ec4899", "#3b82f6", "#10b981"][Math.floor(Math.random() * 5)]
          ring.opacity = 0.6 + Math.random() * 0.4
        }

        const perspective = 400
        const scale = perspective / (ring.z + perspective)
        
        if (scale <= 0.02 || scale > 8) return

        const radius = Math.min(canvas.width, canvas.height) * 0.4 * scale
        const x = centerX()
        const y = centerY()
        const alpha = Math.min(ring.opacity * scale, 1)

        // Optimized main ring
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.strokeStyle = `${ring.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`
        ctx.lineWidth = scale * 4
        ctx.stroke()

        // Reduce spiral lights for performance
        const lightCount = isLowEnd ? 4 : 6
        for (let i = 0; i < lightCount; i++) {
          const angle = (i / lightCount) * Math.PI * 2 + ring.rotation + time * 0.02
          const lightRadius = radius * 0.85
          const lightX = x + Math.cos(angle) * lightRadius
          const lightY = y + Math.sin(angle) * lightRadius
          
          ctx.beginPath()
          ctx.arc(lightX, lightY, scale * 3, 0, Math.PI * 2)
          ctx.fillStyle = `${ring.color}80`
          ctx.fill()
        }
      })

      animationId.current = requestAnimationFrame(animate)
    }


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
      className="fixed inset-0 w-full h-full -z-10"
      style={{ backgroundColor: "#000000" }}
    />
  )
}