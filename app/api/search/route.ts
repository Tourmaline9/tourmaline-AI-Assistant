import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

interface SearchResult {
  title: string
  link: string
  snippet: string
}

export async function POST(req: NextRequest) {
  try {
    const { query, originalMessage } = await req.json()

    if (!process.env.SEARCHAPI_API_KEY) {
      // Fallback: use Gemini to generate a response without search
      return await generateFallbackResponse(originalMessage)
    }

    // Perform search using SearchAPI
    const searchResponse = await fetch(
      `https://www.searchapi.io/api/v1/search?engine=google&q=${encodeURIComponent(query)}&api_key=${process.env.SEARCHAPI_API_KEY}`
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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    
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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    
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
