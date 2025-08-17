/*"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { defaultPersonas, type Persona } from "@/lib/personas"
import { storage, type UserProfile } from "@/lib/storage"
import { useRealtime } from "@/hooks/use-realtime"
import { Chat } from "@/components/Chat"
import CYOA from "@/components/CYOA"

const rose = {
  bg: "bg-gradient-to-br from-[#F7E7CE] via-[#FFF8F4] to-[#FFE6EE]",
  button:
    "transition-transform duration-150 ease-out hover:scale-[1.03] active:scale-[0.99] shadow-sm hover:shadow md:px-6 px-5 py-3 rounded-xl",
  primary: "bg-[#E8B4B8] text-white",
  secondary: "bg-white text-[#5A3E3E] border border-[#EED9DF]",
}

const voices = ["shimmer", "alloy", "coral", "sage", "ballad", "verse" ]

export default function Home() {
  const [personas, setPersonas] = useState<Persona[]>(defaultPersonas)
  const [selectedId, setSelectedId] = useState<string>(defaultPersonas[0].id)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [toast, setToast] = useState<string>("")
  const [showCYOA, setShowCYOA] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const { state, connect, disconnect, setAudioElement, onTextDelta, onCompleted, onUserTextDelta, onUserCompleted, sendTextAndStartResponse, createResponseNow, setVoice, speakNarratorLine } = useRealtime(selectedId)

  useEffect(() => {
    const p = storage.load()
    setProfile(p)
    if (p.selectedPersonaId) setSelectedId(p.selectedPersonaId)
  }, [])

  useEffect(() => {
    storage.update({ selectedPersonaId: selectedId })
  }, [selectedId])

  useEffect(() => {
    setAudioElement(audioRef.current)
  }, [setAudioElement])

  const selectedPersona = useMemo(
    () => personas.find((p) => p.id === selectedId) ?? personas[0],
    [personas, selectedId],
  )

  const handleSetVoice = (v: string) => {
    setVoice(v)
    setToast(`Voice set to ${v} (applies next reply)`) 
    setTimeout(() => setToast(""), 1800)
  }

  return (
    <div className={`min-h-screen ${rose.bg} text-[#3B2A2A]`}> 
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-black/80 text-white px-3 py-2 rounded-lg text-sm shadow">
          {toast}
        </div>
      )}

      <header className="sticky top-0 z-10 bg-white/60 backdrop-blur border-b border-[#EED9DF]">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#E8B4B8] to-[#F4C2C2] shadow flex items-center justify-center">💬</div>
            <div className="font-semibold tracking-tight">FluentAI</div>
          </div>
          <div className="hidden md:flex items-center gap-3 text-sm text-[#6E5555]">
            <span>Spanish • Beta</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 grid md:grid-cols-[360px_1fr] gap-8">
        <section className="space-y-6">
          <div>
            <h1 className="text-3xl font-semibold">Elige tu compañera</h1>
            <p className="text-[#6E5555]">Personas with distinct vibes. Swap one with your own idea anytime.</p>
          </div>
          <div className="grid gap-3">
            {personas.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={`${rose.button} ${selectedId === p.id ? rose.primary : rose.secondary} flex items-center gap-3 text-left`}
              >
                <span className="text-xl">{p.avatarEmoji}</span>
                <span className="font-medium">{p.name}</span>
                <span className="ml-auto text-xs opacity-80">{p.locale}</span>
              </button>
            ))}
            <button onClick={() => setShowCYOA((v) => !v)} className={`${rose.button} ${rose.secondary} w-full`}>
              {showCYOA ? "Hide adventures" : "Play an adventure"}
            </button>
          </div>

          <div className={`overflow-hidden transition-all duration-300 ${showCYOA ? "max-h:[1000px] opacity-100" : "max-h-0 opacity-0"}`}>
            <CYOA speakNarrator={(line) => speakNarratorLine(line, "coral")} />
          </div>

          <div className="pt-4 border-t border-[#EED9DF] space-y-3">
            <div className="text-sm text-[#6E5555] flex items-center gap-2">
              <span>Status: {state.connected ? "Connected" : "Disconnected"}</span>
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${state.isServerListening ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"}`}>
                {state.isServerListening ? "Listening" : "Idle"}
              </span>
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${state.isProcessing ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                {state.isProcessing ? "Processing" : "Ready"}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-[#6E5555]">Voice:</span>
              {voices.map((v) => (
                <button key={v} onClick={() => handleSetVoice(v)} className={`px-3 py-1 rounded-full border ${rose.secondary} hover:shadow-sm hover:scale-[1.02] transition ${""}`}>{v}</button>
              ))}
            </div>
            {state.error && <div className="text-sm text-red-500">{state.error}</div>}
            <div className="flex gap-3 pt-1">
              {!state.connected ? (
                <button onClick={connect} className={`${rose.button} ${rose.primary}`}>Start conversation</button>
              ) : (
                <button onClick={disconnect} className={`${rose.button} ${rose.secondary}`}>End</button>
              )}
          </div>
          </div>
        </section>

        <section className="relative rounded-2xl border border-[#EED9DF] bg-white/70 backdrop-blur p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 pb-4 border-b border-[#EED9DF]">
            <div className="text-2xl">{selectedPersona.avatarEmoji}</div>
            <div>
              <div className="font-semibold">{selectedPersona.name}</div>
              <div className="text-sm text-[#6E5555]">{selectedPersona.description}</div>
            </div>
          </div>

          <div className="py-4 text-[#5A3E3E] text-sm">Speak naturally; responses will stream in. Mic capture uses server VAD; a response is triggered when you stop.</div>

          <div className="min-h-[320px] flex-1">
            <Chat
              personaName={selectedPersona.name}
              connected={state.connected}
              sendText={sendTextAndStartResponse}
              onTextDelta={onTextDelta}
              onCompleted={onCompleted}
              onUserTextDelta={onUserTextDelta}
              onUserCompleted={onUserCompleted}
              createResponseNow={createResponseNow}
            />
          </div>

          <audio ref={audioRef} autoPlay className="w-full hidden" />
          <div className="absolute inset-0 -z-10 pointer-events-none bg-[radial-gradient(1200px_400px_at_80%_-100px,rgba(232,180,184,0.18),transparent),radial-gradient(800px_300px_at_10%_120%,rgba(255,230,238,0.5),transparent)]" />
        </section>
      </main>

      <footer className="border-t border-[#EED9DF] py-8">
        <div className="mx-auto max-w-6xl px-4 text-sm text-[#6E5555]">© {new Date().getFullYear()} FluentAI</div>
      </footer>
    </div>
  )
}*/
