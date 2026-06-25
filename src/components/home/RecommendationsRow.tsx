"use client";

// components/home/RecommendationsRow.tsx
import { motion } from "motion/react";
import { Sparkles, RefreshCw } from "lucide-react";
import { useRecommendations } from "@/hooks/useRecommendations";
import { AnimeCard } from "@/components/cards/AnimeCard";
import { AnimeCardSkeleton } from "@/components/cards/AnimeCardSkeleton";
import { Button } from "@/components/ui/button";

export function RecommendationsRow() {
  const { recommendations, topGenres, isLoading, refresh } = useRecommendations();

  if (topGenres.length === 0) return null;

  const subtitle =
    topGenres.length > 0
      ? `Because you like ${topGenres.slice(0, 2).join(" & ")}`
      : "Based on your watch history";

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-bold font-display text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-xan-violet" />
            Recommended For You
          </h2>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={refresh}
          disabled={isLoading}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }, (_, i) => (
            <AnimeCardSkeleton key={i} />
          ))}
        </div>
      ) : recommendations.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {recommendations.map((item, idx) => (
            <AnimeCard key={item.id} anime={item} index={idx} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-xan-border bg-xan-card/50 py-10 text-center">
          <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Watch more anime to get better recommendations.
          </p>
        </div>
      )}
    </motion.section>
  );
}
