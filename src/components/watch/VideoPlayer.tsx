"use client";

// components/watch/VideoPlayer.tsx
import { useState, useEffect, useCallback } from "react";
import { StreamPlayer } from "./StreamPlayer";
import { AlertCircle, Loader2 } from "lucide-react";

interface VideoPlayerProps {
  animeId: number;
  episode: number;
  animeTitle: string;
  posterUrl?: string;
  autoResumeTime?: number;
  skipIntroOffset?: number;
  onEpisodeEnd?: () => void;
  onProgress?: (currentTime: number, duration: number) => void;
}

interface StreamData {
  url: string;
  type: "hls" | "mp4" | "dash";
  quality: string | null;
  headers?: Record<string, string>;
  sourceName?: string;
  provider?: string;
}

export function VideoPlayer({
  animeId,
  episode,
  animeTitle,
  posterUrl,
  autoResumeTime,
  skipIntroOffset,
  onEpisodeEnd,
  onProgress,
}: VideoPlayerProps) {
  const [stream, setStream] = useState<StreamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const stableOnProgress = useCallback(
    (t: number, d: number) => onProgress?.(t, d),
    [onProgress],
  );

  const stableOnEpisodeEnd = useCallback(() => onEpisodeEnd?.(), [onEpisodeEnd]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setStream(null);

    const titleParam = animeTitle ? `&title=${encodeURIComponent(animeTitle)}` : "";

    fetch(`/api/stream/${animeId}/${episode}?${titleParam}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error || `Backend returned ${res.status}`);
        }
        return res.json();
      })
      .then((json) => {
        if (cancelled) return;
        const s = json?.stream;
        if (s && s.url) {
          setStream({
            url: s.url,
            type: s.type,
            quality: s.quality ?? null,
            headers: s.headers,
            sourceName: s.sourceName,
            provider: json?.provider,
          });
          setLoading(false);
        } else {
          setError("Backend returned an invalid stream response");
          setLoading(false);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load stream");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [animeId, episode, animeTitle]);

  if (error) {
    return (
      <div className="w-full aspect-video bg-zinc-900 rounded-lg flex flex-col items-center justify-center text-center p-6 border border-xan-border">
        <AlertCircle className="h-10 w-10 text-xan-crimson mb-3" />
        <p className="text-foreground font-medium">Stream Unavailable</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">{error}</p>
      </div>
    );
  }

  if (loading || !stream) {
    return (
      <div className="w-full aspect-video bg-zinc-900 rounded-lg flex flex-col items-center justify-center border border-xan-border">
        <Loader2 className="h-10 w-10 text-xan-crimson animate-spin mb-3" />
        <p className="text-sm text-muted-foreground">Loading episode {episode}…</p>
      </div>
    );
  }

  return (
    <StreamPlayer
      streamUrl={stream.url}
      streamType={stream.type}
      title={`${animeTitle} — Episode ${episode}`}
      posterUrl={posterUrl}
      streamHeaders={stream.headers}
      sourceName={stream.sourceName}
      autoResumeTime={autoResumeTime}
      skipIntroOffset={skipIntroOffset}
      onEpisodeEnd={stableOnEpisodeEnd}
      onProgress={stableOnProgress}
    />
  );
}
