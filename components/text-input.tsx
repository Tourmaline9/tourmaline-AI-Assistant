'use client'

import { useState, useCallback, type FormEvent, type KeyboardEvent } from 'react'
import { motion } from 'framer-motion'
import { Send } from 'lucide-react'
import type { AssistantState } from '@/lib/types'

interface TextInputProps {
  state: AssistantState
  onSubmit: (text: string) => void
}

export function TextInput({ state, onSubmit }: TextInputProps) {
  const [inputValue, setInputValue] = useState('')
  
  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault()
    const trimmed = inputValue.trim()
    if (trimmed && state === 'idle') {
      onSubmit(trimmed)
      setInputValue('')
    }
  }, [inputValue, state, onSubmit])

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const trimmed = inputValue.trim()
      if (trimmed && state === 'idle') {
        onSubmit(trimmed)
        setInputValue('')
      }
    }
  }, [inputValue, state, onSubmit])

  const isDisabled = state !== 'idle'

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="w-full max-w-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <div className="relative flex items-center">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isDisabled ? 'Processing...' : 'Type your message...'}
          disabled={isDisabled}
          className="w-full px-5 py-3 pr-14 rounded-full bg-card/80 backdrop-blur-md border border-primary/30 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Message input"
        />
        <motion.button
          type="submit"
          disabled={isDisabled || !inputValue.trim()}
          className="absolute right-2 p-2 rounded-full bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </motion.button>
      </div>
      <p className="text-center text-muted-foreground/60 text-xs mt-2 font-mono">
        Press Enter to send or click the orb for voice input
      </p>
    </motion.form>
  )
}
