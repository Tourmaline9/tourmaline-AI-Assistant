'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import type { AssistantState } from '@/lib/types'

interface ControlPanelProps {
  state: AssistantState
  hasMessages: boolean
  onClear: () => void
  onCancel: () => void
}

export function ControlPanel({ state, hasMessages, onClear, onCancel }: ControlPanelProps) {
  const isActive = state !== 'idle'

  return (
    <motion.div
      className="flex items-center gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      {/* Cancel button - shown when active */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          </Button>
        </motion.div>
      )}

      {/* Clear conversation button */}
      {hasMessages && !isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}
