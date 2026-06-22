// app/api/stream/[id]/[ep]/route.ts
// Server-side stream proxy.
//
// Flow:
//   1. Try Consumet (animepahe provider) — real anime streams
//   2. If Consumet is unreachable or returns no sources → fall back to mock HLS
//   3. If CONSUMET_URL is not set → use mock HLS directly
//
// Consumet contract (lib/consumet.ts):
//   GET {CONSUMET_URL}/anime/animepahe/info/{anilistId}        → episode list
//   GET {CONSUMET_URL}/anime/animepahe/watch?episodeId={id}    → stream sources
//
// NOTE: The public api.consumet.org is DEAD (HTTP 451). Self-host:
//   https://github.com/consumet/api.consumet.org
//   Then set CONSUMET_URL="https://your-instance.com" in .env.local

import { NextResponse } from "next/server";
import { fetchConsumetStream, getConsumetConfig } from "@/lib/consumet";

export const dynamic = "force-dynamic";
// Consumet can be slow — allow up to 30s
export const maxDuration = 30;

// ─── Mock HLS streams (used when Consumet is unavailable) ───
// Public test streams — verified working, CORS-enabled.
const MOCK_STREAMS: { url: string; quality: string }[] = [
  {
    url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    quality: "1080p (demo)",
  },
  {
    url: "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_ts/master.m3u8",
    quality: "720p (demo)",
  },
];

function mockResponse(animeId: number, episode: number, reason?: string) {
  const pick = MOCK_STREAMS[animeId % MOCK_STREAMS.length];
  return {
    stream: {
      url: pick.url,
      type: "hls" as const,
      quality: pick.quality,
    },
    sources: MOCK_STREAMS.map((s) => ({ ...s, type: "hls" as const })),
    duration: 600,
    episodeTitle: `Episode ${episode}`,
    thumbnail: null,
    fallbackReason: reason ?? null,
  };
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string; ep: string }> },
) {
  const { id, ep } = await context.params;
  const animeId = parseInt(id, 10);
  const episode = parseInt(ep, 10);

  if (isNaN(animeId) || isNaN(episode)) {
    return NextResponse.json(
      { error: "Invalid anime ID or episode number" },
      { status: 400 },
    );
  }

  const cfg = getConsumetConfig();

  // ─── Try Consumet first ───
  if (cfg.configured) {
    const stream = await fetchConsumetStream(animeId, episode);
    if (stream) {
      return NextResponse.json({
        stream: {
          url: stream.url,
          type: stream.type,
          quality: stream.quality,
        },
        sources: [
          {
            url: stream.url,
            type: stream.type,
            quality: stream.quality,
          },
        ],
        duration: null,
        episodeTitle: `Episode ${episode}`,
        thumbnail: null,
        provider: "consumet/animepahe",
      });
    }

    // Consumet failed — fall through to mock with reason
    return NextResponse.json(
      mockResponse(
        animeId,
        episode,
        "Consumet API unreachable or returned no sources. Showing demo stream.",
      ),
    );
  }

  // ─── Consumet not configured → use mock ───
  return NextResponse.json(
    mockResponse(
      animeId,
      episode,
      "CONSUMET_URL not set. Showing demo stream. Set CONSUMET_URL to enable real episode streaming.",
    ),
  );
}
