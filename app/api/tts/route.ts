import { NextRequest, NextResponse } from 'next/server'

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech'

// Rachel voice - clear, professional, slightly warm
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'

export async function POST(req: NextRequest) {
  try {
    const { text, voiceId = DEFAULT_VOICE_ID } = await req.json()

    if (!process.env.ELEVENLABS_API_KEY) {
      // Return a flag indicating TTS is unavailable
      return NextResponse.json({
        audioUrl: null,
        fallbackText: text,
        error: 'ElevenLabs API key not configured',
      })
    }

    const response = await fetch(`${ELEVENLABS_API_URL}/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2_5',
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
