'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface JarvisOrbProps {
  isActive?: boolean
  isSpeaking?: boolean
}

export function JarvisOrb({ isActive = false, isSpeaking = false }: JarvisOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = 300
    canvas.width = size
    canvas.height = size

    const centerX = size / 2
    const centerY = size / 2

    let time = 0

    const draw = () => {
      ctx.clearRect(0, 0, size, size)

      // Background glow
      const glowGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, size / 2
      )
      glowGradient.addColorStop(0, 'rgba(0, 200, 255, 0.15)')
      glowGradient.addColorStop(0.5, 'rgba(0, 150, 200, 0.05)')
      glowGradient.addColorStop(1, 'rgba(0, 100, 150, 0)')
      ctx.fillStyle = glowGradient
      ctx.fillRect(0, 0, size, size)

      // Multiple rotating rings
      const ringCount = 5
      for (let r = 0; r < ringCount; r++) {
        const baseRadius = 60 + r * 20
        const speed = isActive ? (isSpeaking ? 0.03 : 0.02) : 0.008
        const amplitude = isActive ? (isSpeaking ? 15 : 10) : 5
        const offset = r * Math.PI / ringCount

        ctx.beginPath()
        ctx.strokeStyle = `rgba(0, ${180 + r * 15}, ${220 + r * 10}, ${0.3 - r * 0.04})`
        ctx.lineWidth = 2

        for (let i = 0; i <= 360; i += 2) {
          const angle = (i * Math.PI) / 180
          const wave = Math.sin(angle * 6 + time * speed * 50 + offset) * amplitude
          const radius = baseRadius + wave

          const x = centerX + Math.cos(angle + time * speed + offset) * radius
          const y = centerY + Math.sin(angle + time * speed + offset) * radius

          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.closePath()
        ctx.stroke()
      }

      // Core orb with gradient
      const coreGradient = ctx.createRadialGradient(
        centerX - 20, centerY - 20, 0,
        centerX, centerY, 50
      )
      coreGradient.addColorStop(0, 'rgba(150, 255, 255, 0.9)')
      coreGradient.addColorStop(0.3, 'rgba(0, 200, 255, 0.7)')
      coreGradient.addColorStop(0.7, 'rgba(0, 150, 200, 0.5)')
      coreGradient.addColorStop(1, 'rgba(0, 100, 150, 0.3)')

      const coreRadius = 40 + (isActive ? Math.sin(time * 0.05) * 5 : 0)
      ctx.beginPath()
      ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2)
      ctx.fillStyle = coreGradient
      ctx.fill()

      // Inner core highlight
      const highlightGradient = ctx.createRadialGradient(
        centerX - 15, centerY - 15, 0,
        centerX, centerY, 25
      )
      highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
      highlightGradient.addColorStop(0.5, 'rgba(200, 255, 255, 0.3)')
      highlightGradient.addColorStop(1, 'rgba(0, 200, 255, 0)')

      ctx.beginPath()
      ctx.arc(centerX, centerY, 30, 0, Math.PI * 2)
      ctx.fillStyle = highlightGradient
      ctx.fill()

      // Particle effects when active
      if (isActive) {
        const particleCount = isSpeaking ? 20 : 12
        for (let i = 0; i < particleCount; i++) {
          const angle = (i / particleCount) * Math.PI * 2 + time * 0.02
          const distance = 100 + Math.sin(time * 0.03 + i) * 30
          const x = centerX + Math.cos(angle) * distance
          const y = centerY + Math.sin(angle) * distance
          const particleSize = 2 + Math.sin(time * 0.05 + i * 0.5) * 1.5

          ctx.beginPath()
          ctx.arc(x, y, particleSize, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(0, 220, 255, ${0.5 + Math.sin(time * 0.05 + i) * 0.3})`
          ctx.fill()
        }
      }

      // Speaking wave effect
      if (isSpeaking) {
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)'
        ctx.lineWidth = 2
        for (let w = 0; w < 3; w++) {
          ctx.beginPath()
          const waveRadius = 60 + w * 40 + (time * 2) % 40
          const opacity = 1 - waveRadius / 180
          ctx.strokeStyle = `rgba(0, 255, 255, ${opacity * 0.5})`
          ctx.arc(centerX, centerY, waveRadius, 0, Math.PI * 2)
          ctx.stroke()
        }
      }

      time++
      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [isActive, isSpeaking])

  return (
    <motion.div
      className="relative flex items-center justify-center"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <canvas
        ref={canvasRef}
        className="w-[300px] h-[300px]"
        style={{ filter: isActive ? 'drop-shadow(0 0 30px rgba(0, 200, 255, 0.5))' : 'drop-shadow(0 0 20px rgba(0, 150, 200, 0.3))' }}
      />
    </motion.div>
  )
}
