'use client'

import { motion } from 'framer-motion'
import { useVoiceAssistant } from '@/hooks/use-voice-assistant'
import { VoiceOrb } from './voice-orb'
import { MessageList } from './message-list'
import { StatusIndicator } from './status-indicator'
import { ControlPanel } from './control-panel'
import { BackgroundEffects } from './background-effects'
import { TextInput } from './text-input'

export function TourmalineAssistant() {
  const {
    state,
    messages,
    currentTranscript,
    errorMessage,
    audioLevel,
    startListening,
    stopListening,
    clearConversation,
    cancel,
    processUserInput,
  } = useVoiceAssistant()

  const handleOrbClick = () => {
    if (state === 'idle') {
      startListening()
    } else if (state === 'listening' || state === 'speaking') {
      cancel()
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6">
      <BackgroundEffects />
      
      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-4xl">
        {/* Header */}
        <motion.header
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
            <span className="holographic-text">Tourmaline</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base font-mono tracking-wide">
            AI Voice Assistant
          </p>
        </motion.header>

        {/* Status indicator */}
        <StatusIndicator state={state} errorMessage={errorMessage} />

        {/* Voice orb */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <VoiceOrb
            state={state}
            audioLevel={audioLevel}
            onClick={handleOrbClick}
            disabled={state === 'processing'}
          />
        </motion.div>

        {/* Instructions */}
        <motion.p
          className="text-center text-muted-foreground text-sm max-w-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {state === 'idle' && 'Click the orb to speak or type below'}
          {state === 'listening' && 'Speak your question or command'}
          {state === 'processing' && 'Analyzing your request...'}
          {state === 'speaking' && 'Tap to interrupt'}
          {state === 'error' && 'Something went wrong. Try again.'}
        </motion.p>

        {/* Text input fallback */}
        <TextInput state={state} onSubmit={processUserInput} />

        {/* Control panel */}
        <ControlPanel
          state={state}
          hasMessages={messages.length > 0}
          onClear={clearConversation}
          onCancel={cancel}
        />

        {/* Message list */}
        <MessageList
          messages={messages}
          currentTranscript={currentTranscript}
        />

        {/* Footer */}
        <motion.footer
          className="absolute bottom-6 left-0 right-0 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <p className="text-xs text-muted-foreground/50 font-mono">
            Powered by Gemini AI
          </p>
        </motion.footer>
      </div>
    </div>
  )
}
