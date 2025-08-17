import { NextResponse } from "next/server"
import { defaultPersonas, type Persona } from "@/lib/personas"

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 })
  }

  let personaId: string | undefined
  let voice: string | undefined
  try {
    const body = await request.json().catch(() => ({}))
    personaId = (body as { personaId?: string })?.personaId
    voice = (body as { voice?: string })?.voice
  } catch {}

  const persona: Persona = (defaultPersonas as Persona[]).find((p: Persona) => p.id === personaId) ?? defaultPersonas[0]

  try {
    const res = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "realtime=v1",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: voice || "shimmer",
        modalities: ["text", "audio"],
        instructions: persona.systemPrompt,
        // Spanish primary, allow code-switch
        input_audio_format: "pcm16",
        output_audio_format: "pcm16",
        // Enable server-side transcription of user speech
        input_audio_transcription: { model: "whisper-1" },
        // Ensure turn detection (server VAD) is active
        turn_detection: { type: "server_vad", threshold: 0.5, prefix_padding_ms: 300, silence_duration_ms: 200, create_response: true, interrupt_response: true },
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      return NextResponse.json({ error: "Failed to create session", details: errText }, { status: 500 })
    }

    const data = await res.json()
    // Expecting { client_secret: { value: string, ... }, ... }
    return NextResponse.json({ session: data })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
} 