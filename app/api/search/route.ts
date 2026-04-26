import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const DEFAULT_GEMINI_API_KEY = 'AIzaSyCSfrNilcmtq3XZ2Q8n0jmhfzAqxEQz0gI'
const DEFAULT_SEARCH_API_KEY = 'ZYeCDgUXTN4SZQ7MwtuMqVJs'
const GEMINI_MODEL = 'gemini-2.5-pro'

const geminiApiKey = process.env.GEMINI_API_KEY || DEFAULT_GEMINI_API_KEY
const searchApiKey = process.env.SEARCHAPI_API_KEY || DEFAULT_SEARCH_API_KEY
const genAI = new GoogleGenerativeAI(geminiApiKey)

interface SearchResult {
  title: string
  link: string
  snippet: string
}

export async function POST(req: NextRequest) {
  try {
    const { query, originalMessage } = await req.json()

    // Perform search using SearchAPI
    const searchResponse = await fetch(
      `https://www.searchapi.io/api/v1/search?engine=google&q=${encodeURIComponent(query)}&api_key=${searchApiKey}`
    )

    if (!searchResponse.ok) {
      return await generateFallbackResponse(originalMessage)
    }

    const searchData = await searchResponse.json()

    const results: SearchResult[] = (searchData.organic_results || [])
      .slice(0, 5)
      .map((result: { title: string; link: string; snippet: string }) => ({
        title: result.title,
        link: result.link,
        snippet: result.snippet,
      }))

    // Use Gemini to synthesize a response from search results
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL })

    const synthesisPrompt = `You are Tourmaline, a voice assistant. Based on the following search results, provide a concise, conversational response to the user's question: "${originalMessage}"

Search Results:
${results.map((r, i) => `${i + 1}. ${r.title}: ${r.snippet}`).join('\n')}

Guidelines:
- Synthesize the information naturally, as if speaking
- Keep the response under 100 words
- Be conversational and helpful
- Don't mention that you searched - just provide the information naturally
- Don't use markdown or bullet points`

    const result = await model.generateContent(synthesisPrompt)
    const response = result.response.text()

    return NextResponse.json({
      text: response,
      searchResults: results,
    })
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    )
  }
}

async function generateFallbackResponse(message: string) {
  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL })

    const fallbackPrompt = `You are Tourmaline, a voice assistant. The user asked: "${message}"

This seems to be a question that might need current information, but I don't have access to real-time search right now. Please provide a helpful response based on your training data, and if the information might be outdated, gently mention that the user might want to verify for the most current details.

Keep the response conversational and under 100 words.`

    const result = await model.generateContent(fallbackPrompt)
    const response = result.response.text()

    return NextResponse.json({
      text: response,
      searchResults: [],
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}
