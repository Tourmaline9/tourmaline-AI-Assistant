'use client'

import { motion } from 'framer-motion'
import type { AssistantState } from '@/lib/types'

interface StatusIndicatorProps {
  state: AssistantState
  errorMessage?: string | null
}

export function StatusIndicator({ state, errorMessage }: StatusIndicatorProps) {
  const getStatusText = () => {
    switch (state) {
      case 'idle':
        return 'Ready'
      case 'listening':
        return 'Listening...'
      case 'processing':
        return 'Processing...'
      case 'speaking':
        return 'Speaking...'
      case 'error':
        return errorMessage || 'Error occurred'
      default:
        return 'Ready'
    }
  }

  const getStatusColor = () => {
    switch (state) {
      case 'idle':
        return 'text-muted-foreground'
      case 'listening':
        return 'text-primary animate-text-glow'
      case 'processing':
        return 'text-accent'
      case 'speaking':
        return 'text-primary'
      case 'error':
        return 'text-destructive'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <motion.div
      className="flex items-center gap-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Status dot */}
      <motion.div
        className={`w-2 h-2 rounded-full ${
          state === 'idle' ? 'bg-muted-foreground' :
          state === 'listening' ? 'bg-primary' :
          state === 'processing' ? 'bg-accent' :
          state === 'speaking' ? 'bg-primary' :
          'bg-destructive'
        }`}
        animate={
          state === 'listening' || state === 'processing' || state === 'speaking'
            ? { scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }
            : {}
        }
        transition={{ duration: 1, repeat: Infinity }}
      />

      {/* Status text */}
      <span className={`text-sm font-mono uppercase tracking-widest ${getStatusColor()}`}>
        {getStatusText()}
      </span>
    </motion.div>
  )
}
