import { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const channel = searchParams.get("channel")?.trim()
  if (!channel) {
    return new Response(JSON.stringify({ error: "Missing channel" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    })
  }

  const clientId = process.env.TWITCH_CLIENT_ID
  const accessToken = process.env.TWITCH_ACCESS_TOKEN
  if (!clientId || !accessToken) {
    return new Response(JSON.stringify({ error: "Server not configured" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    })
  }

  try {
    const response = await fetch(
      `https://api.twitch.tv/helix/streams?user_login=${encodeURIComponent(channel)}`,
      {
        headers: {
          "Client-Id": clientId,
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      }
    )
    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Twitch API error", status: response.status }),
        { status: 502, headers: { "content-type": "application/json" } }
      )
    }
    type TwitchStream = {
      title?: string
      viewer_count?: number
      started_at?: string
    }
    const data = (await response.json()) as { data?: TwitchStream[] }
    const stream: TwitchStream | undefined = Array.isArray(data.data)
      ? data.data[0]
      : undefined
    const result = {
      online: Boolean(stream),
      title: stream?.title ?? null,
      viewer_count: stream?.viewer_count ?? null,
      started_at: stream?.started_at ?? null,
    }
    return new Response(JSON.stringify(result), {
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


