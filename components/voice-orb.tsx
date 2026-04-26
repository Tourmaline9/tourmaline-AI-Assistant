'use client'

import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import type { AssistantState } from '@/lib/types'

interface VoiceOrbProps {
  state: AssistantState
  audioLevel: number
  onClick: () => void
  disabled?: boolean
}

export function VoiceOrb({ state, audioLevel, onClick, disabled }: VoiceOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const timeRef = useRef(0)
  const audioLevelRef = useRef(audioLevel)

  // Update audio level ref
  useEffect(() => {
    audioLevelRef.current = audioLevel
  }, [audioLevel])

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
    const baseRadius = 80

    const getStateConfig = () => {
      switch (state) {
        case 'listening':
          return {
            baseColor: [0, 220, 180], // Cyan/teal
            pulseSpeed: 0.03,
            waveAmplitude: 25 + audioLevelRef.current * 30,
            waveCount: 6,
            glowIntensity: 0.8 + audioLevelRef.current * 0.4,
            morphSpeed: 0.025,
          }
        case 'processing':
          return {
            baseColor: [100, 180, 255], // Blue
            pulseSpeed: 0.05,
            waveAmplitude: 15,
            waveCount: 8,
            glowIntensity: 0.7,
            morphSpeed: 0.04,
          }
        case 'speaking':
          return {
            baseColor: [0, 255, 200], // Bright cyan
            pulseSpeed: 0.04,
            waveAmplitude: 20 + Math.sin(timeRef.current * 0.1) * 15,
            waveCount: 7,
            glowIntensity: 0.9,
            morphSpeed: 0.035,
          }
        case 'error':
          return {
            baseColor: [255, 80, 80], // Red
            pulseSpeed: 0.02,
            waveAmplitude: 8,
            waveCount: 4,
            glowIntensity: 0.5,
            morphSpeed: 0.015,
          }
        default:
          return {
            baseColor: [60, 140, 150], // Dim teal
            pulseSpeed: 0.015,
            waveAmplitude: 5,
            waveCount: 5,
            glowIntensity: 0.4,
            morphSpeed: 0.01,
          }
      }
    }

    const animate = () => {
      timeRef.current += 1
      const config = getStateConfig()

      ctx.clearRect(0, 0, size, size)

      // Draw multiple layers of the blob for depth
      const layers = 4
      for (let layer = layers; layer >= 0; layer--) {
        const layerOffset = layer * 0.3
        const layerAlpha = layer === 0 ? 1 : 0.15 - layer * 0.03
        const layerRadius = baseRadius + layer * 15

        drawBlob(
          ctx,
          centerX,
          centerY,
          layerRadius,
          config,
          layerOffset,
          layerAlpha
        )
      }

      // Draw inner glow
      const innerGradient = ctx.createRadialGradient(
        centerX - 20,
        centerY - 20,
        0,
        centerX,
        centerY,
        baseRadius
      )
      innerGradient.addColorStop(0, `rgba(255, 255, 255, 0.3)`)
      innerGradient.addColorStop(0.5, `rgba(255, 255, 255, 0.1)`)
      innerGradient.addColorStop(1, 'transparent')
      ctx.fillStyle = innerGradient
      ctx.fill()

      animationRef.current = requestAnimationFrame(animate)
    }

    const drawBlob = (
      ctx: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      radius: number,
      config: ReturnType<typeof getStateConfig>,
      timeOffset: number,
      alpha: number
    ) => {
      const points = 100
      const time = timeRef.current * config.morphSpeed + timeOffset

      ctx.beginPath()

      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2

        // Multiple noise layers for organic movement
        let noise = 0
        for (let w = 1; w <= config.waveCount; w++) {
          const frequency = w * 0.5
          const amplitude = config.waveAmplitude / w
          noise += Math.sin(angle * frequency + time * (w * 0.3)) * amplitude
          noise += Math.cos(angle * frequency * 0.7 + time * (w * 0.2)) * amplitude * 0.5
        }

        // Pulse effect
        const pulse = Math.sin(time * config.pulseSpeed * 100) * 5

        const r = radius + noise + pulse
        const x = cx + Math.cos(angle) * r
        const y = cy + Math.sin(angle) * r

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }

      ctx.closePath()

      // Create gradient fill
      const gradient = ctx.createRadialGradient(
        cx - radius * 0.3,
        cy - radius * 0.3,
        0,
        cx,
        cy,
        radius + config.waveAmplitude
      )

      const [r, g, b] = config.baseColor
      gradient.addColorStop(0, `rgba(${r + 50}, ${g + 50}, ${b + 50}, ${alpha})`)
      gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${alpha * 0.9})`)
      gradient.addColorStop(1, `rgba(${r - 30}, ${g - 30}, ${b - 30}, ${alpha * 0.7})`)

      ctx.fillStyle = gradient
      ctx.fill()

      // Add glow effect for main layer
      if (alpha === 1) {
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${config.glowIntensity})`
        ctx.shadowBlur = 40
        ctx.fill()
        ctx.shadowBlur = 0
      }
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [state])

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer ambient glow */}
      <motion.div
        className="absolute w-80 h-80 rounded-full"
        style={{
          background: state === 'error'
            ? 'radial-gradient(circle, rgba(255,80,80,0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(0,220,180,0.15) 0%, transparent 70%)',
        }}
        animate={{
          scale: state === 'listening' ? [1, 1.1 + audioLevel * 0.2, 1] : [1, 1.05, 1],
          opacity: state === 'idle' ? 0.3 : 0.6,
        }}
        transition={{
          duration: state === 'listening' ? 0.5 : 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Secondary glow ring */}
      {(state === 'listening' || state === 'speaking') && (
        <motion.div
          className="absolute w-72 h-72 rounded-full border border-primary/20"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      )}

      {/* Processing orbital ring */}
      {state === 'processing' && (
        <motion.div
          className="absolute w-64 h-64"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          <div 
            className="absolute top-0 left-1/2 w-3 h-3 -ml-1.5 rounded-full"
            style={{ background: 'rgba(100, 180, 255, 0.8)' }}
          />
          <div 
            className="absolute bottom-0 left-1/2 w-2 h-2 -ml-1 rounded-full"
            style={{ background: 'rgba(100, 180, 255, 0.5)' }}
          />
        </motion.div>
      )}

      {/* Main canvas blob */}
      <motion.button
        onClick={onClick}
        disabled={disabled}
        className="relative cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 rounded-full"
        whileHover={state === 'idle' ? { scale: 1.05 } : {}}
        whileTap={state === 'idle' ? { scale: 0.95 } : {}}
        aria-label={
          state === 'idle' ? 'Click to start listening' :
          state === 'listening' ? 'Listening... Click to stop' :
          state === 'processing' ? 'Processing...' :
          state === 'speaking' ? 'Speaking... Click to stop' :
          'Error occurred'
        }
      >
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          className="w-[200px] h-[200px] sm:w-[250px] sm:h-[250px]"
        />

        {/* Center indicator overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {state === 'idle' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-white/60"
            >
              <svg 
                className="w-10 h-10" 
                fill="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
              </svg>
            </motion.div>
          )}
          
          {state === 'error' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-white/80"
            >
              <svg 
                className="w-10 h-10" 
                fill="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            </motion.div>
          )}
        </div>
      </motion.button>
    </div>
  )
}
