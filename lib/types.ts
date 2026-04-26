export type AssistantState = 
  | 'idle'
  | 'listening'
  | 'processing'
  | 'speaking'
  | 'error'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  audioUrl?: string
}

export interface ConversationContext {
  messages: Message[]
  currentTopic?: string
}

export interface SearchResult {
  title: string
  link: string
  snippet: string
}

export interface AIResponse {
  text: string
  requiresSearch: boolean
  searchQuery?: string
}

export interface TTSResponse {
  audioUrl: string
  duration: number
}

export interface WakeWordDetectorConfig {
  accessKey: string
  keyword: 'tourmaline' | 'computer' | 'jarvis' | 'alexa'
  sensitivity?: number
}

export interface SpeechRecognitionResult {
  transcript: string
  confidence: number
  isFinal: boolean
}
