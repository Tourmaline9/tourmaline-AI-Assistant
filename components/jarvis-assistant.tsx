'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChatInterface } from './chat-interface'

export function JarvisAssistant() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Generate particle positions only on client to avoid hydration mismatch
  const particles = useMemo(() => {
    if (!isClient) return []
    return [...Array(15)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 8 + Math.random() * 6,
      delay: Math.random() * 5,
    }))
  }, [isClient])

  useEffect(() => {
    setIsClient(true)
    
    // Load the ElevenLabs Convai widget script
    const existingScript = document.querySelector('script[src="https://unpkg.com/@elevenlabs/convai-widget-embed"]')
    if (!existingScript) {
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed'
      script.async = true
      script.type = 'text/javascript'
      document.body.appendChild(script)
    }
  }, [])

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-background">
      {/* Background effects */}
      <div className="absolute inset-0 sci-fi-grid opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--primary)_0%,_transparent_50%)] opacity-5" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_var(--background)_70%)]" />

      {/* Main content - centered */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-8 px-4 w-full">
        {/* Title */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <h1 className="text-5xl md:text-7xl font-bold holographic-text tracking-tight">
            TOURMALINE
          </h1>
          <p className="text-muted-foreground mt-3 text-lg tracking-wide">
            Your Personal AI Assistant
          </p>
        </motion.div>

        {/* Central Voice Interface - ElevenLabs Widget */}
        <motion.div
          className="relative flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {/* Animated rings behind the widget */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full border border-primary/30"
                style={{
                  width: 220 + i * 80,
                  height: 220 + i * 80,
                }}
                animate={{
                  scale: [1, 1.08, 1],
                  opacity: [0.4 - i * 0.1, 0.6 - i * 0.15, 0.4 - i * 0.1],
                }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.4,
                }}
              />
            ))}
          </div>

          {/* Glow effect */}
          <div className="absolute w-64 h-64 bg-primary/20 rounded-full blur-3xl" />

          {/* ElevenLabs Widget Container - Centered */}
          <div className="elevenlabs-centered-container relative z-10">
            {isClient && (
              // @ts-expect-error - ElevenLabs custom element
              <elevenlabs-convai agent-id="agent_6701kq5tdq3eetfbq9jedvmzy35r"></elevenlabs-convai>
            )}
          </div>
        </motion.div>

        {/* Status text */}
        <motion.p
          className="text-center text-muted-foreground text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          Tap the orb to start a conversation
        </motion.p>

        {/* Chat button - secondary option */}
        <motion.button
          onClick={() => setIsChatOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-secondary/50 hover:bg-secondary text-secondary-foreground rounded-full transition-all hover:scale-105 text-sm border border-border/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>Or type a message</span>
        </motion.button>
      </div>

      {/* Chat Interface Modal */}
      <AnimatePresence>
        {isChatOpen && (
          <ChatInterface isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        )}
      </AnimatePresence>

      {/* Ambient floating particles - only render on client */}
      {isClient && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-1 h-1 bg-primary/40 rounded-full"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
