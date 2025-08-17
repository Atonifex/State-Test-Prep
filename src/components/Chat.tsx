"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"

type Message = { id: string; role: "user" | "assistant"; content: string }

type ChatProps = {
  personaName: string
  connected: boolean
  sendText: (text: string) => void
  onTextDelta: (cb: (delta: string) => void) => () => void
  onCompleted: (cb: () => void) => () => void
  onUserTextDelta?: (cb: (delta: string) => void) => () => void
  onUserCompleted?: (cb: () => void) => () => void
  createResponseNow?: () => void
}

export function Chat({ personaName, connected, sendText, onTextDelta, onCompleted, onUserTextDelta, onUserCompleted, createResponseNow }: ChatProps) {
  const { state: speech, start, stop } = useSpeechRecognition()
  const [messages, setMessages] = useState<Message[]>([])
  const [assistantStream, setAssistantStream] = useState("")
  const [userStream, setUserStream] = useState("")
  const [autoSend, setAutoSend] = useState(true)
  const [inputValue, setInputValue] = useState("")

  const endRef = useRef<HTMLDivElement | null>(null)
  const prevListening = useRef(false)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages, assistantStream, userStream])

  // Assistant stream subscription
  useEffect(() => {
    const offDelta = onTextDelta((delta) => {
      setAssistantStream((prev) => prev + delta)
    })
    const offCompleted = onCompleted(() => {
      const finalText = assistantStream.trim()
      if (finalText) setMessages((m) => [...m, { id: crypto.randomUUID(), role: "assistant", content: finalText }])
      setAssistantStream("")
    })
    return () => {
      offDelta()
      offCompleted()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onTextDelta, onCompleted, assistantStream])

  // User stream subscription (server-side transcription of your speech)
  useEffect(() => {
    if (!onUserTextDelta || !onUserCompleted) return
    const offUserDelta = onUserTextDelta((delta) => {
      setUserStream((prev) => prev + delta)
    })
    const offUserCompleted = onUserCompleted(() => {
      const finalText = userStream.trim()
      if (finalText) setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", content: finalText }])
      setUserStream("")
    })
    return () => {
      offUserDelta()
      offUserCompleted()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onUserTextDelta, onUserCompleted, userStream])

  const lastUserText = useMemo(() => speech.transcript.trim(), [speech.transcript])

  // Auto-trigger after mic stop
  useEffect(() => {
    if (prevListening.current && !speech.listening && connected) {
      if (createResponseNow) createResponseNow()
      // If browser transcript present, optionally also send via text lane
      if (autoSend && lastUserText) {
        const t = lastUserText
        setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", content: t }])
        sendText(t)
      }
    }
    prevListening.current = speech.listening
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speech.listening, autoSend, lastUserText, connected, createResponseNow])

  const sendManual = () => {
    const t = inputValue.trim()
    if (!t || !connected) return
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", content: t }])
    setInputValue("")
    sendText(t)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 pb-3">
        <button
          onClick={() => setAutoSend((v) => !v)}
          className={`rounded-xl px-3 py-2 border ${autoSend ? "bg-[#E8B4B8] text-white border-transparent" : "bg-white text-[#5A3E3E] border-[#EED9DF]"}`}
        >
          Auto-Send: {autoSend ? "On" : "Off"}
        </button>
        <button
          onClick={speech.listening ? stop : start}
          className="rounded-xl bg-[#E8B4B8] text-white px-4 py-2 shadow-sm transition-transform hover:scale-[1.03] disabled:opacity-50"
          disabled={!connected}
        >
          {speech.listening ? "Stop mic" : "Start mic"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto rounded-xl border border-[#EED9DF] bg-white/70 backdrop-blur p-4 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`${m.role === "user" ? "bg-[#E6F0FF] text-[#1b3a6b]" : "bg-[#FDF6F8] text-[#5A3E3E]"} max-w-[75%] rounded-2xl px-3 py-2 shadow-sm`}>{m.content}</div>
          </div>
        ))}
        {userStream && (
          <div className="flex justify-end">
            <div className="bg-[#E6F0FF] text-[#1b3a6b] max-w-[75%] rounded-2xl px-3 py-2 opacity-80 shadow-sm">{userStream}</div>
          </div>
        )}
        {assistantStream && (
          <div className="flex justify-start">
            <div className="bg-[#FDF6F8] text-[#5A3E3E] max-w-[75%] rounded-2xl px-3 py-2 opacity-90 shadow-sm whitespace-pre-wrap">{assistantStream}</div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") sendManual() }}
          placeholder="Type a message…"
          className="flex-1 rounded-xl border border-[#EED9DF] bg-white/90 px-3 py-2 outline-none focus:ring-2 focus:ring-[#E8B4B8]"
        />
        <button
          onClick={sendManual}
          disabled={!connected || !inputValue.trim()}
          className="rounded-xl bg-[#E8B4B8] text-white px-4 py-2 shadow-sm disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  )
} 