'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef } from 'react'
import type { Message } from '@/lib/types'

interface MessageListProps {
  messages: Message[]
  currentTranscript: string
}

export function MessageList({ messages, currentTranscript }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, currentTranscript])

  if (messages.length === 0 && !currentTranscript) {
    return null
  }

  return (
    <div 
      ref={scrollRef}
      className="w-full max-w-2xl max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
    >
      <div className="space-y-4 p-4">
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-md px-4 py-3 rounded-2xl glass-panel ${
                  message.role === 'user'
                    ? 'bg-primary/20 border-primary/30'
                    : 'bg-secondary/40 border-accent/20'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    {message.role === 'user' ? 'You' : 'Tourmaline'}
                  </span>
                  <span className="text-xs text-muted-foreground/50">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {message.content}
                </p>
              </div>
            </motion.div>
          ))}

          {/* Live transcript */}
          {currentTranscript && (
            <motion.div
              key="live-transcript"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex justify-end"
            >
              <div className="max-w-md px-4 py-3 rounded-2xl glass-panel bg-primary/10 border-primary/20 border-dashed">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    Listening...
                  </span>
                  <motion.span
                    className="inline-block w-2 h-2 rounded-full bg-primary"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                </div>
                <p className="text-sm text-foreground/80 italic">
                  {currentTranscript}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}
