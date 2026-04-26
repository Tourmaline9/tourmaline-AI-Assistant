import { NextRequest, NextResponse } from 'next/server'

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech'
const DEFAULT_ELEVENLABS_API_KEY = '4e3842f2b9fbddf43ce2767eab902b98a9bd8ca210e50c168b93ef3422a9e4b5'
const ELEVENLABS_MODEL = 'eleven_v3'

// Rachel voice - clear, professional, slightly warm
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'

export async function POST(req: NextRequest) {
  try {
    const { text, voiceId = DEFAULT_VOICE_ID } = await req.json()
    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY || DEFAULT_ELEVENLABS_API_KEY

    const response = await fetch(`${ELEVENLABS_API_URL}/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsApiKey,
      },
      body: JSON.stringify({
        text,
        model_id: ELEVENLABS_MODEL,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.3,
          use_speaker_boost: true,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('ElevenLabs API error:', errorText)
      return NextResponse.json({
        audioUrl: null,
        fallbackText: text,
        error: 'Failed to generate speech',
      })
    }

    const audioBuffer = await response.arrayBuffer()
    const base64Audio = Buffer.from(audioBuffer).toString('base64')
    const audioUrl = `data:audio/mpeg;base64,${base64Audio}`

    return NextResponse.json({
      audioUrl,
      fallbackText: text,
    })
  } catch (error) {
    console.error('TTS API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate speech', fallbackText: '' },
      { status: 500 }
    )
  }
}