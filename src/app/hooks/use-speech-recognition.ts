"use client"
//Make line 42 dynamic based on the user's language preference

import { useEffect, useRef, useState } from "react"

// Minimal types for Web Speech API (browser-provided)
// Decision: Inline types for MVP to avoid external type packages.
interface WebSpeechRecognition extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  onresult: ((ev: WebSpeechRecognitionEvent) => void) | null
  onerror: ((e: { error?: string }) => void) | null
  onend: (() => void) | null
  onaudiostart?: (() => void) | null
  onsoundstart?: (() => void) | null
  onspeechstart?: (() => void) | null
}
interface WebSpeechRecognitionEvent extends Event {
  resultIndex: number
  results: { [index: number]: { 0: { transcript: string } } }
}

type SRConstructor = new () => WebSpeechRecognition

export type SpeechState = {
  listening: boolean
  transcript: string
  error?: string
  supported: boolean
}

export function useSpeechRecognition() {
  const [state, setState] = useState<SpeechState>({ listening: false, transcript: "", supported: true })
  const recRef = useRef<WebSpeechRecognition | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) {
      console.warn("[speech] Web Speech API not supported")
      setState((s) => ({ ...s, supported: false, error: "SpeechRecognition not supported" }))
      return
    }
    const rec: WebSpeechRecognition = new (SR as SRConstructor)()
    rec.lang = "es-ES" //**Need to make this dynamic based on the user's language preference**
    rec.interimResults = true
    rec.continuous = true

    rec.onresult = (ev: WebSpeechRecognitionEvent) => {
      let text = ""
      for (let i = ev.resultIndex; i < (ev.results as any).length; i++) {
        text += (ev.results as any)[i][0].transcript
      }
      // console log shortened snippet to avoid spam
      console.log("[speech] onresult", text.slice(0, 80))
      setState((s) => ({ ...s, transcript: text }))
    }
    rec.onerror = (e: { error?: string }) => {
      console.warn("[speech] onerror", e)
      setState((s) => ({ ...s, error: e?.error ?? "speech error" }))
    }
    rec.onend = () => {
      console.log("[speech] onend")
      setState((s) => ({ ...s, listening: false }))
    }
    rec.onaudiostart = () => console.log("[speech] audiostart")
    rec.onsoundstart = () => console.log("[speech] soundstart")
    rec.onspeechstart = () => console.log("[speech] speechstart")

    recRef.current = rec
  }, [])

  const start = () => {
    try {
      if (!recRef.current) return
      console.log("[speech] start")
      recRef.current.start()
      setState((s) => ({ ...s, listening: true }))
    } catch (e) {
      console.warn("[speech] start error", e)
    }
  }
  const stop = () => {
    try {
      if (!recRef.current) return
      console.log("[speech] stop")
      recRef.current.stop()
    } catch (e) {
      console.warn("[speech] stop error", e)
    }
  }

  return { state, start, stop }
} 