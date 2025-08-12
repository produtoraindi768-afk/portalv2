import { NextRequest } from "next/server"
import { getNovitaClient, NOVITA_DEFAULT_MODEL } from "@/lib/novita"
import type OpenAI from "openai"

type ChatBody = {
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
  stream?: boolean
  model?: string
  max_tokens?: number
  temperature?: number
  top_p?: number
  min_p?: number
  top_k?: number
  presence_penalty?: number
  frequency_penalty?: number
  repetition_penalty?: number
  response_format?: { type: "text" }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatBody
    const { messages, stream = true, model = NOVITA_DEFAULT_MODEL, ...rest } =
      body || {}

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages é obrigatório" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      })
    }

    const openai = getNovitaClient()

    if (stream) {
      const completion = await openai.chat.completions.create({
        model,
        messages,
        stream: true,
        response_format: { type: "text" },
        ...rest,
      })

      const encoder = new TextEncoder()
      const streamResp = new ReadableStream<Uint8Array>({
        async start(controller) {
          try {
            for await (const part of completion) {
              const choice = part.choices?.[0]
              if (!choice) continue

              if (choice.finish_reason) {
                controller.enqueue(
                  encoder.encode(
                    `event: done\ndata: ${choice.finish_reason}\n\n`
                  )
                )
                break
              }

              const token = choice.delta?.content ?? ""
              if (token) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ token })}\n\n`)
                )
              }
            }
          } catch (_e) {
            controller.enqueue(
              encoder.encode(
                `event: error\ndata: ${JSON.stringify({ message: "stream error" })}\n\n`
              )
            )
          } finally {
            controller.close()
          }
        },
      })

      return new Response(streamResp, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-store",
          Connection: "keep-alive",
          "Transfer-Encoding": "chunked",
        },
      })
    }

    const completion = await openai.chat.completions.create({
      model,
      messages,
      stream: false,
      response_format: { type: "text" },
      ...rest,
    })

    return new Response(JSON.stringify(completion), {
      status: 200,
      headers: { "content-type": "application/json" },
    })
  } catch (_err) {
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    })
  }
}


