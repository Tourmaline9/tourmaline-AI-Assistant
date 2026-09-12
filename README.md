# Tourmaline AI Assistant

Tourmaline is a futuristic, voice-first personal AI assistant built with Next.js. It provides an immersive UI, voice interaction, and chat-based conversation in one app.

## What this project does

- Presents an animated assistant interface with an embedded ElevenLabs voice widget.
- Supports text chat with conversational AI responses.
- Detects when a prompt needs current information and performs web search before answering.
- Generates text-to-speech audio for assistant responses.

## What this project uses

### Core framework

- Next.js 16 (App Router)
- React 19
- TypeScript

### UI and styling

- Tailwind CSS 4
- Radix UI component primitives
- Framer Motion animations
- Lucide icons

### AI and voice services

- Google Gemini (`@google/generative-ai`) for chat and synthesis
- ElevenLabs APIs/widgets for voice interaction and TTS
- SearchAPI (`searchapi.io`) for real-time web search

## Project structure

- `app/page.tsx`: App entry rendering the assistant.
- `components/jarvis-assistant.tsx`: Main interactive assistant experience.
- `app/api/chat/route.ts`: Chat endpoint using Gemini.
- `app/api/search/route.ts`: Search + synthesis endpoint.
- `app/api/tts/route.ts`: Text-to-speech endpoint.

## Getting started

Install dependencies and run the dev server:

```bash
pnpm install
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000).

Optional environment variables (`.env.local`):

- `GEMINI_API_KEY`
- `ELEVENLABS_API_KEY`
- `SEARCHAPI_API_KEY`

## Scripts

- `pnpm dev` - start local development
- `pnpm build` - build for production
- `pnpm start` - run production server
- `pnpm lint` - run ESLint
