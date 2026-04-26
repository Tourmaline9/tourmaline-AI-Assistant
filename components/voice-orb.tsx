'use client'

import { motion } from 'framer-motion'
import type { AssistantState } from '@/lib/types'

interface VoiceOrbProps {
  state: AssistantState
  audioLevel: number
  onClick: () => void
  disabled?: boolean
}

export function VoiceOrb({ state, audioLevel, onClick, disabled }: VoiceOrbProps) {
  const getOrbStyles = () => {
    switch (state) {
      case 'listening':
        return {
          scale: 1 + audioLevel * 0.3,
          boxShadow: `0 0 ${30 + audioLevel * 50}px oklch(0.70 0.18 185 / ${0.4 + audioLevel * 0.4}),
                      0 0 ${60 + audioLevel * 80}px oklch(0.70 0.18 185 / ${0.2 + audioLevel * 0.3}),
                      0 0 ${100 + audioLevel * 100}px oklch(0.70 0.18 185 / ${0.1 + audioLevel * 0.2})`,
        }
      case 'processing':
        return {
          scale: 1,
          boxShadow: `0 0 40px oklch(0.75 0.15 200 / 0.5),
                      0 0 80px oklch(0.75 0.15 200 / 0.3),
                      0 0 120px oklch(0.75 0.15 200 / 0.2)`,
        }
      case 'speaking':
        return {
          scale: 1.05,
          boxShadow: `0 0 50px oklch(0.80 0.20 175 / 0.6),
                      0 0 100px oklch(0.80 0.20 175 / 0.4),
                      0 0 150px oklch(0.80 0.20 175 / 0.2)`,
        }
      case 'error':
        return {
          scale: 1,
          boxShadow: `0 0 30px oklch(0.55 0.22 25 / 0.5),
                      0 0 60px oklch(0.55 0.22 25 / 0.3)`,
        }
      default:
        return {
          scale: 1,
          boxShadow: `0 0 20px oklch(0.40 0.10 190 / 0.3),
                      0 0 40px oklch(0.40 0.10 190 / 0.2)`,
        }
    }
  }

  const getInnerGradient = () => {
    switch (state) {
      case 'listening':
        return 'linear-gradient(135deg, oklch(0.70 0.18 185) 0%, oklch(0.60 0.15 200) 50%, oklch(0.50 0.12 210) 100%)'
      case 'processing':
        return 'linear-gradient(135deg, oklch(0.65 0.15 200) 0%, oklch(0.55 0.12 220) 50%, oklch(0.45 0.10 240) 100%)'
      case 'speaking':
        return 'linear-gradient(135deg, oklch(0.80 0.20 175) 0%, oklch(0.70 0.18 185) 50%, oklch(0.60 0.15 195) 100%)'
      case 'error':
        return 'linear-gradient(135deg, oklch(0.55 0.22 25) 0%, oklch(0.45 0.18 30) 100%)'
      default:
        return 'linear-gradient(135deg, oklch(0.40 0.10 190) 0%, oklch(0.30 0.08 200) 50%, oklch(0.25 0.06 210) 100%)'
    }
  }

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer pulse rings */}
      {state === 'listening' && (
        <>
          <motion.div
            className="absolute w-48 h-48 rounded-full border border-primary/30"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute w-48 h-48 rounded-full border border-primary/30"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
          />
          <motion.div
            className="absolute w-48 h-48 rounded-full border border-primary/30"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 1 }}
          />
        </>
      )}

      {/* Processing spinner */}
      {state === 'processing' && (
        <motion.div
          className="absolute w-56 h-56 rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, transparent, oklch(0.70 0.18 185 / 0.5), transparent)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* Speaking wave rings */}
      {state === 'speaking' && (
        <motion.div
          className="absolute w-52 h-52 rounded-full border-2 border-primary/40"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.6, 0.3, 0.6],
          }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Main orb button */}
      <motion.button
        onClick={onClick}
        disabled={disabled}
        className="relative w-48 h-48 rounded-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
        style={{ background: getInnerGradient() }}
        animate={getOrbStyles()}
        transition={{ duration: 0.3, ease: 'easeOut' }}
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
        {/* Inner glow */}
        <div 
          className="absolute inset-4 rounded-full opacity-60"
          style={{
            background: 'radial-gradient(circle at 30% 30%, oklch(0.95 0.02 200 / 0.4) 0%, transparent 70%)',
          }}
        />

        {/* Center icon/indicator */}
        <div className="absolute inset-0 flex items-center justify-center">
          {state === 'idle' && (
            <svg 
              className="w-16 h-16 text-primary-foreground/80" 
              fill="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
            </svg>
          )}
          
          {state === 'listening' && (
            <motion.div 
              className="flex items-end gap-1 h-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 bg-primary-foreground/80 rounded-full"
                  animate={{
                    height: [8, 20 + audioLevel * 20, 8],
                  }}
                  transition={{
                    duration: 0.4,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </motion.div>
          )}
          
          {state === 'processing' && (
            <motion.div
              className="w-12 h-12 border-4 border-primary-foreground/30 border-t-primary-foreground/80 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          )}
          
          {state === 'speaking' && (
            <motion.div 
              className="flex items-center gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {[...Array(7)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1.5 bg-primary-foreground/80 rounded-full"
                  animate={{
                    height: [4, 24, 4],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.07,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </motion.div>
          )}
          
          {state === 'error' && (
            <svg 
              className="w-16 h-16 text-destructive-foreground/80" 
              fill="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          )}
        </div>
      </motion.button>
    </div>
  )
}
