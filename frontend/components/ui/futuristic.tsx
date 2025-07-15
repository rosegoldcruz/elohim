"use client"

import React, { useState, useRef, useEffect } from "react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Local cn function to avoid import issues
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Futuristic Button Component
interface FuturisticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "neon"
  size?: "sm" | "md" | "lg" | "xl"
  children: React.ReactNode
  glowColor?: string
}

export const FuturisticButton = React.forwardRef<HTMLButtonElement, FuturisticButtonProps>(
  ({ className, variant = "primary", size = "md", children, glowColor, ...props }, ref) => {
    const [isHovered, setIsHovered] = useState(false)

    const variants = {
      primary: "bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-500 hover:via-pink-500 hover:to-cyan-500 text-white",
      secondary: "glass-intense border-purple-400/30 hover:border-purple-400/60 text-white hover:bg-purple-900/20",
      ghost: "bg-transparent border border-white/20 hover:border-white/40 text-white hover:bg-white/5",
      neon: "bg-black border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 hover:shadow-[0_0_30px_rgba(34,211,238,0.5)]"
    }

    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
      xl: "px-12 py-6 text-xl"
    }

    return (
      <button
        ref={ref}
        className={cn(
          "relative font-semibold rounded-xl transition-all duration-300 overflow-hidden group hover:scale-105 hover:-translate-y-1",
          variants[variant],
          sizes[size],
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {/* Animated background overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

        {/* Glow effect */}
        {isHovered && (
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-xl blur-lg opacity-75 -z-10"></div>
        )}

        <span className="relative z-10">{children}</span>
      </button>
    )
  }
)
FuturisticButton.displayName = "FuturisticButton"

// Holographic Card Component
interface HolographicCardProps {
  children: React.ReactNode
  className?: string
  glowOnHover?: boolean
}

export const HolographicCard: React.FC<HolographicCardProps> = ({
  children,
  className,
  glowOnHover = true
}) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={cn(
        "relative p-8 rounded-3xl overflow-hidden group cursor-pointer transition-all duration-300 hover:-translate-y-2",
        "bg-gradient-to-br from-white/5 to-white/2",
        "border border-white/10",
        "backdrop-blur-xl",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Holographic border effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>

      {/* Glow effect */}
      {glowOnHover && isHovered && (
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-cyan-500/30 rounded-3xl blur-xl -z-10"></div>
      )}

      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

// Neon Text Component
interface NeonTextProps {
  children: React.ReactNode
  color?: "purple" | "cyan" | "pink" | "green"
  className?: string
  animated?: boolean
}

export const NeonText: React.FC<NeonTextProps> = ({ 
  children, 
  color = "purple", 
  className,
  animated = false 
}) => {
  const colors = {
    purple: "text-purple-400 drop-shadow-[0_0_10px_rgba(139,92,246,0.8)]",
    cyan: "text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]",
    pink: "text-pink-400 drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]",
    green: "text-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]"
  }

  return (
    <span 
      className={cn(
        "font-bold",
        colors[color],
        animated && "animate-pulse",
        className
      )}
    >
      {children}
    </span>
  )
}

// Floating Action Button
interface FloatingActionButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left"
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  children,
  onClick,
  className,
  position = "bottom-right"
}) => {
  const positions = {
    "bottom-right": "fixed bottom-8 right-8",
    "bottom-left": "fixed bottom-8 left-8",
    "top-right": "fixed top-8 right-8",
    "top-left": "fixed top-8 left-8"
  }

  return (
    <motion.button
      className={cn(
        "w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-2xl z-50",
        "flex items-center justify-center",
        "hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]",
        positions[position],
        className
      )}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.button>
  )
}

// Particle Background for Cards
export const ParticleBackground: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
          initial={{
            x: Math.random() * 400,
            y: Math.random() * 400,
          }}
          animate={{
            x: Math.random() * 400,
            y: Math.random() * 400,
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      ))}
    </div>
  )
}

// Interactive Tilt Card
interface TiltCardProps {
  children: React.ReactNode
  className?: string
  tiltMaxAngle?: number
}

export const TiltCard: React.FC<TiltCardProps> = ({ 
  children, 
  className, 
  tiltMaxAngle = 15 
}) => {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const mouseXSpring = useSpring(x)
  const mouseYSpring = useSpring(y)
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [tiltMaxAngle, -tiltMaxAngle])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-tiltMaxAngle, tiltMaxAngle])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5
    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      className={cn("perspective-1000", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      whileHover={{ scale: 1.05 }}
    >
      {children}
    </motion.div>
  )
}
