'use client'

import { motion } from 'framer-motion'

export function BackgroundEffects() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Sci-fi grid */}
      <div className="absolute inset-0 sci-fi-grid opacity-30" />
      
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background opacity-50" />
      
      {/* Floating orbs */}
      <motion.div
        className="absolute w-96 h-96 rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, oklch(0.70 0.18 185) 0%, transparent 70%)',
          top: '10%',
          left: '20%',
        }}
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="absolute w-64 h-64 rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, oklch(0.65 0.15 200) 0%, transparent 70%)',
          bottom: '20%',
          right: '15%',
        }}
        animate={{
          x: [0, -40, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="absolute w-48 h-48 rounded-full opacity-5"
        style={{
          background: 'radial-gradient(circle, oklch(0.80 0.20 175) 0%, transparent 70%)',
          top: '40%',
          right: '30%',
        }}
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Scan line effect */}
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
        style={{ top: '0%' }}
        animate={{
          top: ['0%', '100%'],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-32 h-32">
        <div className="absolute top-4 left-4 w-16 h-px bg-gradient-to-r from-primary/50 to-transparent" />
        <div className="absolute top-4 left-4 w-px h-16 bg-gradient-to-b from-primary/50 to-transparent" />
      </div>
      
      <div className="absolute top-0 right-0 w-32 h-32">
        <div className="absolute top-4 right-4 w-16 h-px bg-gradient-to-l from-primary/50 to-transparent" />
        <div className="absolute top-4 right-4 w-px h-16 bg-gradient-to-b from-primary/50 to-transparent" />
      </div>
      
      <div className="absolute bottom-0 left-0 w-32 h-32">
        <div className="absolute bottom-4 left-4 w-16 h-px bg-gradient-to-r from-primary/50 to-transparent" />
        <div className="absolute bottom-4 left-4 w-px h-16 bg-gradient-to-t from-primary/50 to-transparent" />
      </div>
      
      <div className="absolute bottom-0 right-0 w-32 h-32">
        <div className="absolute bottom-4 right-4 w-16 h-px bg-gradient-to-l from-primary/50 to-transparent" />
        <div className="absolute bottom-4 right-4 w-px h-16 bg-gradient-to-t from-primary/50 to-transparent" />
      </div>
    </div>
  )
}
