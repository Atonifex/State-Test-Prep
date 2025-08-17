export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Missing OPENAI_API_KEY" }), { status: 500 })
  }

  const { system = "", messages = [] } = await request.json().catch(() => ({ system: "", messages: [] as Array<{ role: string; content: string }> }))

  const encoder = new TextEncoder()

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            temperature: 0.8,
            stream: true,
            messages: [
              ...(system ? [{ role: "system", content: system }] : []),
              ...messages,
            ],
          }),
        })

        if (!res.ok || !res.body) {
          const text = await res.text().catch(() => "")
          controller.enqueue(encoder.encode(text || ""))
          controller.close()
          return
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ""

        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })

          const lines = buffer.split("\n")
          buffer = lines.pop() || ""

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed.startsWith("data:")) continue
            const data = trimmed.slice(5).trim()
            if (data === "[DONE]") {
              controller.close()
              return
            }
            try {
              const json = JSON.parse(data)
              const delta = json?.choices?.[0]?.delta?.content
              if (typeof delta === "string" && delta.length > 0) {
                controller.enqueue(encoder.encode(delta))
              }
            } catch {
              // ignore parse errors
            }
          }
        }

        controller.close()
      } catch (e) {
        controller.enqueue(encoder.encode(""))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  })
} 