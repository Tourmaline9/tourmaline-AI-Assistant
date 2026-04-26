'use client'

import { useEffect } from 'react'

interface ElevenLabsWidgetProps {
  agentId: string
}

export function ElevenLabsWidget({ agentId }: ElevenLabsWidgetProps) {
  useEffect(() => {
    // Load the ElevenLabs Convai widget script
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed'
    script.async = true
    script.type = 'text/javascript'
    document.body.appendChild(script)

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://unpkg.com/@elevenlabs/convai-widget-embed"]')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [])

  return (
    <div className="elevenlabs-widget-container">
      {/* @ts-expect-error - ElevenLabs custom element */}
      <elevenlabs-convai agent-id={agentId}></elevenlabs-convai>
    </div>
  )
}
