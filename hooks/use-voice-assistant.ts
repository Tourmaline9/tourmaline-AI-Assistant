'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { AssistantState, Message, ConversationContext } from '@/lib/types'

// Extend window for webkitSpeechRecognition
interface WindowWithSpeechRecognition extends Window {
  webkitSpeechRecognition: new () => SpeechRecognition
  SpeechRecognition: new () => SpeechRecognition
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onresult: (event: SpeechRecognitionEvent) => void
  onerror: (event: SpeechRecognitionErrorEvent) => void
  onend: () => void
  onstart: () => void
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionResultList {
  length: number
  item: (index: number) => SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  length: number
  item: (index: number) => SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionErrorEvent {
  error: string
  message: string
}

export function useVoiceAssistant() {
  const [state, setState] = useState<AssistantState>('idle')
  const [messages, setMessages] = useState<Message[]>([])
  const [currentTranscript, setCurrentTranscript] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isWakeWordEnabled, setIsWakeWordEnabled] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Initialize speech recognition
  const initSpeechRecognition = useCallback(() => {
    const windowWithSpeech = window as unknown as WindowWithSpeechRecognition
    const SpeechRecognitionConstructor = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition
    
    if (!SpeechRecognitionConstructor) {
      setErrorMessage('Speech recognition not supported in this browser')
      return null
    }

    const recognition = new SpeechRecognitionConstructor()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      if (finalTranscript) {
        setCurrentTranscript(finalTranscript)
        processUserInput(finalTranscript)
      } else {
        setCurrentTranscript(interimTranscript)
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error)
      
      // Handle different error types
      if (event.error === 'no-speech' || event.error === 'aborted') {
        // These are expected behaviors, not errors
        return
      }
      
      let errorMsg = 'Speech recognition error'
      
      if (event.error === 'network') {
        // Network error - usually HTTPS requirement or connectivity issue
        errorMsg = 'Network error. Please ensure you have a stable internet connection. Speech recognition requires HTTPS.'
      } else if (event.error === 'not-allowed') {
        errorMsg = 'Microphone access denied. Please allow microphone permissions.'
      } else if (event.error === 'audio-capture') {
        errorMsg = 'No microphone found. Please connect a microphone.'
      } else if (event.error === 'service-not-allowed') {
        errorMsg = 'Speech recognition service not available.'
      } else {
        errorMsg = `Speech recognition error: ${event.error}`
      }
      
      setErrorMessage(errorMsg)
      setState('error')
      
      // Auto-recover after showing error
      setTimeout(() => {
        setErrorMessage(null)
        setState('idle')
      }, 5000)
    }

    recognition.onend = () => {
      if (state === 'listening') {
        // Restart if we're still supposed to be listening
        try {
          recognition.start()
        } catch {
          // Ignore errors from rapid start/stop
        }
      }
    }

    return recognition
  }, [state])

  // Start audio level monitoring
  const startAudioLevelMonitoring = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream
      
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)
      
      analyserRef.current.fftSize = 256
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)

      const updateLevel = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length
          setAudioLevel(average / 255)
        }
        animationFrameRef.current = requestAnimationFrame(updateLevel)
      }
      
      updateLevel()
    } catch (err) {
      console.error('Failed to start audio monitoring:', err)
    }
  }, [])

  // Stop audio level monitoring
  const stopAudioLevelMonitoring = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
    setAudioLevel(0)
  }, [])

  // Process user input
  const processUserInput = useCallback(async (text: string) => {
    setState('processing')
    setCurrentTranscript('')

    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }
    
    setMessages(prev => [...prev, userMessage])

    try {
      // Get conversation history for context
      const conversationHistory = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content,
      }))

      // Call chat API
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationHistory,
        }),
      })

      if (!chatResponse.ok) {
        throw new Error('Failed to get AI response')
      }

      let aiResponseData = await chatResponse.json()
      let responseText = aiResponseData.text

      // If search is required, perform search
      if (aiResponseData.requiresSearch && aiResponseData.searchQuery) {
        const searchResponse = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: aiResponseData.searchQuery,
            originalMessage: text,
          }),
        })

        if (searchResponse.ok) {
          const searchData = await searchResponse.json()
          responseText = searchData.text
        }
      }

      // Generate TTS
      setState('speaking')
      
      const ttsResponse = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: responseText }),
      })

      const ttsData = await ttsResponse.json()

      // Add assistant message
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
        audioUrl: ttsData.audioUrl,
      }

      setMessages(prev => [...prev, assistantMessage])

      // Play audio if available
      if (ttsData.audioUrl) {
        await playAudio(ttsData.audioUrl)
      } else {
        // Use browser TTS as fallback
        speakWithBrowserTTS(responseText)
      }

    } catch (error) {
      console.error('Error processing input:', error)
      setErrorMessage('Failed to process your request')
      setState('error')
      
      setTimeout(() => {
        setErrorMessage(null)
        setState('idle')
      }, 3000)
    }
  }, [messages])

  // Play audio
  const playAudio = useCallback((audioUrl: string): Promise<void> => {
    return new Promise((resolve) => {
      if (audioRef.current) {
        audioRef.current.pause()
      }

      const audio = new Audio(audioUrl)
      audioRef.current = audio

      audio.onended = () => {
        setState('idle')
        resolve()
      }

      audio.onerror = () => {
        setState('idle')
        resolve()
      }

      audio.play().catch(() => {
        setState('idle')
        resolve()
      })
    })
  }, [])

  // Browser TTS fallback
  const speakWithBrowserTTS = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.volume = 1.0
      
      utterance.onend = () => {
        setState('idle')
      }

      utterance.onerror = () => {
        setState('idle')
      }

      speechSynthesis.speak(utterance)
    } else {
      setState('idle')
    }
  }, [])

  // Start listening
  const startListening = useCallback(async () => {
    setErrorMessage(null)
    
    if (!recognitionRef.current) {
      recognitionRef.current = initSpeechRecognition()
    }

    if (!recognitionRef.current) {
      return
    }

    try {
      await startAudioLevelMonitoring()
      recognitionRef.current.start()
      setState('listening')
    } catch (error) {
      console.error('Failed to start listening:', error)
      setErrorMessage('Failed to start listening')
      setState('error')
    }
  }, [initSpeechRecognition, startAudioLevelMonitoring])

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    stopAudioLevelMonitoring()
    if (state === 'listening') {
      setState('idle')
    }
  }, [state, stopAudioLevelMonitoring])

  // Toggle wake word detection
  const toggleWakeWord = useCallback(() => {
    setIsWakeWordEnabled(prev => !prev)
  }, [])

  // Clear conversation
  const clearConversation = useCallback(() => {
    setMessages([])
    setCurrentTranscript('')
    setErrorMessage(null)
  }, [])

  // Cancel current operation
  const cancel = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort()
    }
    if (audioRef.current) {
      audioRef.current.pause()
    }
    speechSynthesis.cancel()
    stopAudioLevelMonitoring()
    setState('idle')
    setCurrentTranscript('')
  }, [stopAudioLevelMonitoring])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
      if (audioRef.current) {
        audioRef.current.pause()
      }
      stopAudioLevelMonitoring()
    }
  }, [stopAudioLevelMonitoring])

  return {
    state,
    messages,
    currentTranscript,
    errorMessage,
    isWakeWordEnabled,
    audioLevel,
    startListening,
    stopListening,
    toggleWakeWord,
    clearConversation,
    cancel,
    processUserInput,
  }
}
