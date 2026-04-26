import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const DEFAULT_GEMINI_API_KEY = 'AIzaSyDFpfATXFFpTu434Ahmk2Xi_U-tXq6Z6k8'
const GEMINI_MODEL = 'gemini-2.5-flash'

const geminiApiKey = process.env.GEMINI_API_KEY || DEFAULT_GEMINI_API_KEY
const genAI = new GoogleGenerativeAI(geminiApiKey)

const SYSTEM_PROMPT = `You are Tourmaline, a sophisticated AI voice assistant with a calm, helpful, and slightly futuristic personality. 

Key traits:
- You speak naturally and conversationally, as if talking to a friend
- You're concise but thorough - aim for responses under 100 words unless more detail is needed
- You have a subtle sense of humor and can be witty when appropriate
- You're knowledgeable across many topics but honest when you don't know something
- You occasionally use subtle sci-fi references naturally in conversation

When responding:
- If the user asks about current events, news, weather, or time-sensitive information, respond with: [SEARCH_REQUIRED: <search query>]
- Otherwise, provide a direct, helpful response
- Keep responses conversational and natural for voice output
- Avoid using markdown, bullet points, or formatting - speak naturally
- Don't use emojis or special characters

Remember: You're a voice assistant, so your responses should sound natural when spoken aloud.`

export async function POST(req: NextRequest) {
  try {
    const { message, conversationHistory } = await req.json()

    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL })

    // Build conversation context
    const history = conversationHistory?.map((msg: { role: string; content: string }) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    })) || []

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
        { role: 'model', parts: [{ text: 'Understood. I am Tourmaline, ready to assist.' }] },
        ...history,
      ],
    })

    const result = await chat.sendMessage(message)
    const response = result.response.text()

    // Check if search is required
    const searchMatch = response.match(/\[SEARCH_REQUIRED:\s*(.+?)\]/)
    if (searchMatch) {
      return NextResponse.json({
        text: response,
        requiresSearch: true,
        searchQuery: searchMatch[1].trim(),
      })
    }

    return NextResponse.json({
      text: response,
      requiresSearch: false,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}