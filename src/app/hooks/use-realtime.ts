"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export type RealtimeState = {
	connected: boolean
	error?: string
	isServerListening?: boolean
	isProcessing?: boolean
}

export type TextDeltaCallback = (delta: string) => void
export type CompletedCallback = () => void

export function useRealtime(personaId: string) {
	const pcRef = useRef<RTCPeerConnection | null>(null)
	const [state, setState] = useState<RealtimeState>({ connected: false, isServerListening: false, isProcessing: false })
	const [voice, setVoice] = useState<string>("shimmer")
	const audioElRef = useRef<HTMLAudioElement | null>(null)
	const micStreamRef = useRef<MediaStream | null>(null)
	const dcRef = useRef<RTCDataChannel | null>(null)

	const textDeltaListeners = useRef<Set<TextDeltaCallback>>(new Set())
	const completedListeners = useRef<Set<CompletedCallback>>(new Set())
	const userDeltaListeners = useRef<Set<TextDeltaCallback>>(new Set())
	const userCompletedListeners = useRef<Set<CompletedCallback>>(new Set())

	const setAudioElement = useCallback((el: HTMLAudioElement | null) => {
		audioElRef.current = el
	}, [])

	const emit = (set: Set<Function>, ...args: unknown[]) => {
		for (const cb of set) (cb as any)(...args)
	}

	const onTextDelta = useCallback((cb: TextDeltaCallback) => {
		textDeltaListeners.current.add(cb)
		return () => textDeltaListeners.current.delete(cb)
	}, [])
	const onCompleted = useCallback((cb: CompletedCallback) => {
		completedListeners.current.add(cb)
		return () => completedListeners.current.delete(cb)
	}, [])

	const onUserTextDelta = useCallback((cb: TextDeltaCallback) => {
		userDeltaListeners.current.add(cb)
		return () => userDeltaListeners.current.delete(cb)
	}, [])
	const onUserCompleted = useCallback((cb: CompletedCallback) => {
		userCompletedListeners.current.add(cb)
		return () => userCompletedListeners.current.delete(cb)
	}, [])

	const disconnect = useCallback(() => {
		console.log("[realtime] disconnect")
		dcRef.current?.close()
		dcRef.current = null
		pcRef.current?.getSenders().forEach((s) => s.track?.stop())
		pcRef.current?.close()
		pcRef.current = null
		micStreamRef.current?.getTracks().forEach((t) => t.stop())
		micStreamRef.current = null
		setState({ connected: false, isServerListening: false, isProcessing: false })
	}, [])

	const extractAssistantDelta = (msg: any): string | null => {
		try {
			if (!msg || typeof msg !== "object") return null
			if (msg.type === "response.delta" && msg.delta && typeof msg.delta.text === "string") return msg.delta.text
			if (typeof msg.type === "string" && msg.type.includes("output_text.delta")) {
				if (typeof msg.delta === "string") return msg.delta
				if (msg.delta && typeof msg.delta.text === "string") return msg.delta.text
			}
			if (msg.type === "response.audio_transcript.delta" && typeof msg.delta === "string") return msg.delta
			if (Array.isArray(msg?.delta)) return msg.delta.map((d: any) => d?.text ?? "").join("")
			if (typeof msg?.text === "string") return msg.text
			return null
		} catch {
			return null
		}
	}

	const extractUserDelta = (msg: any): string | null => {
		try {
			const t = typeof msg?.type === "string" ? msg.type : ""
			if (t.includes("input_audio_transcription") && (t.includes("delta") || t.includes("chunk"))) {
				if (typeof msg?.delta === "string") return msg.delta
				if (typeof msg?.text === "string") return msg.text
				if (Array.isArray(msg?.delta)) return msg.delta.map((d: any) => d?.text ?? "").join("")
			}
			return null
		} catch {
			return null
		}
	}

	const isUserTranscriptionDone = (msg: any): boolean => {
		const t = typeof msg?.type === "string" ? msg.type : ""
		return t.includes("input_audio_transcription") && (t.includes("done") || t.includes("complete"))
	}

	const handleDataMessage = useCallback((event: MessageEvent) => {
		try {
			const raw = typeof event.data === "string" ? event.data : new TextDecoder().decode(event.data)
			console.log("[realtime] dc message", raw)
			const msg = JSON.parse(raw)

			// Track listening/processing
			if (typeof msg?.type === "string") {
				if (msg.type.includes("input_audio_transcription") && (msg.type.includes("delta") || msg.type.includes("chunk"))) {
					setState((s) => ({ ...s, isServerListening: true }))
				}
				if (isUserTranscriptionDone(msg)) {
					setState((s) => ({ ...s, isServerListening: false, isProcessing: true }))
				}
				if (msg.type === "response.created" || msg.type === "output_audio_buffer.started") {
					setState((s) => ({ ...s, isProcessing: true }))
				}
				if (msg.type === "response.done" || msg.type === "response.audio_transcript.done" || msg.type === "output_audio_buffer.stopped") {
					setState((s) => ({ ...s, isProcessing: false }))
				}
			}

			const userDelta = extractUserDelta(msg)
			if (userDelta) {
				emit(userDeltaListeners.current, userDelta)
				return
			}

			const assistantDelta = extractAssistantDelta(msg)
			if (assistantDelta) {
				emit(textDeltaListeners.current, assistantDelta)
				return
			}

			if (isUserTranscriptionDone(msg)) {
				emit(userCompletedListeners.current)
				return
			}
			if (msg?.type === "response.audio_transcript.done" || msg?.type === "response.completed") {
				emit(completedListeners.current)
				return
			}

			console.log("[realtime] event", msg?.type)
		} catch (err) {
			console.warn("[realtime] non-JSON dc message", err)
		}
	}, [])

	const connect = useCallback(async () => {
		try {
			console.log("[realtime] requesting session for persona", personaId)
			const sessionRes = await fetch("/api/realtime/session", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ personaId, voice }),
			})
			const { session, error } = await sessionRes.json()
			if (error) throw new Error(error)
			const clientSecret = session?.client_secret?.value
			if (!clientSecret) throw new Error("Missing client secret from session")

			const pc = new RTCPeerConnection()
			pcRef.current = pc
			console.log("[realtime] created RTCPeerConnection")

			pc.onconnectionstatechange = () => console.log("[realtime] pc connectionState", pc.connectionState)
			pc.oniceconnectionstatechange = () => console.log("[realtime] pc iceConnectionState", pc.iceConnectionState)

			pc.ontrack = (event) => {
				const [remoteStream] = event.streams
				console.log("[realtime] ontrack received, stream tracks:", remoteStream.getTracks().map(t => t.kind))
				if (audioElRef.current) {
					audioElRef.current.srcObject = remoteStream
					audioElRef.current.play().then(() => console.log("[realtime] audio playback started")).catch((e) => console.warn("[realtime] audio play error", e))
				}
			}

			const dc = pc.createDataChannel("oai-events")
			dcRef.current = dc
			dc.onopen = () => {
				console.log("[realtime] data channel open")
				try {
					dc.send(JSON.stringify({ type: "response.create", response: { modalities: ["text", "audio"], voice } }))
				} catch (e) {
					console.warn("[realtime] greeting send failed", e)
				}
			}
			dc.onclose = () => console.log("[realtime] data channel closed")
			dc.onerror = (e) => console.warn("[realtime] data channel error", e)
			dc.onmessage = handleDataMessage

			const mic = await navigator.mediaDevices.getUserMedia({ audio: true })
			console.log("[realtime] mic acquired, tracks:", mic.getTracks().length)
			micStreamRef.current = mic
			mic.getTracks().forEach((track) => pc.addTrack(track, mic))

			const offer = await pc.createOffer({ offerToReceiveAudio: true })
			await pc.setLocalDescription(offer)
			console.log("[realtime] local description set")

			const baseUrl = "https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17"
			const sdpRes = await fetch(baseUrl, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${clientSecret}`,
					"Content-Type": "application/sdp",
					"OpenAI-Beta": "realtime=v1",
				},
				body: offer.sdp ?? "",
			})
			const answerSdp = await sdpRes.text()
			const answer = { type: "answer", sdp: answerSdp } as RTCSessionDescriptionInit
			await pc.setRemoteDescription(answer)
			console.log("[realtime] remote description set")

			setState((s) => ({ ...s, connected: true }))
			console.log("[realtime] connected")
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : "Failed to connect"
			console.error("[realtime] connect error", message, e)
			setState({ connected: false, error: message, isServerListening: false, isProcessing: false })
			disconnect()
		}
	}, [personaId, voice, disconnect])

	const sendTextAndStartResponse = useCallback((text: string) => {
		const dc = dcRef.current
		if (!dc || dc.readyState !== "open") {
			console.warn("[realtime] data channel not open; cannot send text")
			return
		}
		console.log("[realtime] sending text", text)
		const send = (obj: unknown) => dc.send(JSON.stringify(obj))
		send({ type: "input_text", text })
		send({ type: "response.create", response: { modalities: ["text", "audio"], voice } })
		setState((s) => ({ ...s, isProcessing: true }))
	}, [voice])

	const createResponseNow = useCallback(() => {
		const dc = dcRef.current
		if (!dc || dc.readyState !== "open") {
			console.warn("[realtime] data channel not open; cannot create response")
			return
		}
		console.log("[realtime] forcing response.create after mic stop")
		dc.send(JSON.stringify({ type: "response.create", response: { modalities: ["text", "audio"], voice } }))
		setState((s) => ({ ...s, isProcessing: true }))
	}, [voice])

	// Narrator line with voice override (e.g., "coral")
	const speakNarratorLine = useCallback((line: string, narratorVoice = "coral") => {
		const dc = dcRef.current
		if (!dc || dc.readyState !== "open") {
			console.warn("[realtime] data channel not open; cannot narrate")
			return
		}
		const send = (obj: unknown) => dc.send(JSON.stringify(obj))
		send({ type: "input_text", text: line })
		send({ type: "response.create", response: { modalities: ["text", "audio"], voice: narratorVoice } })
	}, [])

	useEffect(() => () => disconnect(), [disconnect])

	return {
		state,
		connect,
		disconnect,
		setAudioElement,
		onTextDelta,
		onCompleted,
		onUserTextDelta,
		onUserCompleted,
		sendTextAndStartResponse,
		createResponseNow,
		setVoice,
		speakNarratorLine,
	}
} 