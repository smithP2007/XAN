"use client";

// components/watch/VerificationBadge.tsx
import { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, Server, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CookieStatus {
  hasCookie: boolean;
  isExpired: boolean;
  ageMinutes: number | null;
}

export function VerificationBadge() {
  const [status, setStatus] = useState<CookieStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/cf/status")
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) {
          setStatus(json);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
      <Badge
        variant="outline"
        className="border-xan-crimson/30 text-xan-crimson bg-xan-crimson/5"
      >
        <Server className="h-3 w-3 mr-1" />
        Backend Streaming
      </Badge>

      {loading ? (
        <span className="flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Checking…
        </span>
      ) : (
        <Link
          href="/settings"
          className="flex items-center gap-1 hover:text-foreground transition-colors"
          title="AllAnime provider is active — streams use real anime sources"
        >
          <ShieldCheck className="h-3 w-3 text-emerald-500" />
          <span className="text-emerald-500">AllAnime active</span>
          <span className="text-muted-foreground">· real streams</span>
        </Link>
      )}
    </div>
  );
}
