"use client";

// components/home/CategoryTabs.tsx
import { useState, useEffect } from "react";
import { AnimeCard } from "@/components/cards/AnimeCard";
import { AnimeCardSkeleton } from "@/components/cards/AnimeCardSkeleton";
import { ErrorCard } from "@/components/ErrorCard";
import { GENRES, TAGS } from "@/lib/constants";
import type { Anime } from "@/types/anime";

interface CategoryTabsProps {
  initialGenre?: string;
}

const GENRE_TABS = GENRES.map((g) => ({ label: g, value: g, isTag: false }));
const TAG_TABS = TAGS.map((t) => ({ label: t.label, value: t.value, isTag: true }));

export function CategoryTabs({ initialGenre = "Action" }: CategoryTabsProps) {
  const [active, setActive] = useState<string>(initialGenre);
  const [data, setData] = useState<Anime[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(false);

    fetch(`/api/genre?genre=${encodeURIComponent(active)}&perPage=15`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        if (!cancelled) {
          setData((json?.data ?? []) as Anime[]);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [active]);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl md:text-2xl font-bold font-display text-foreground">
          Browse by Category
        </h2>
        <p className="text-xs text-muted-foreground">
          Genres and demographics — pick whatever fits your mood
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1 items-center">
        {GENRE_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActive(tab.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
              active === tab.value
                ? "bg-gradient-to-r from-xan-crimson to-xan-violet text-white border-transparent shadow-[0_0_20px_rgba(233,69,96,0.3)]"
                : "bg-xan-card text-muted-foreground hover:text-foreground hover:bg-xan-card-hover border-xan-border"
            }`}
          >
            {tab.label}
          </button>
        ))}

        <span className="flex-shrink-0 h-5 w-px bg-xan-border mx-1" aria-hidden />

        {TAG_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActive(tab.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
              active === tab.value
                ? "bg-gradient-to-r from-xan-crimson to-xan-violet text-white border-transparent shadow-[0_0_20px_rgba(233,69,96,0.3)]"
                : "bg-xan-card text-muted-foreground hover:text-foreground hover:bg-xan-card-hover border-xan-border"
            }`}
            title="Demographic / tag"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error ? (
        <ErrorCard message={`Couldn't load ${active} anime`} />
      ) : isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }, (_, i) => (
            <AnimeCardSkeleton key={i} />
          ))}
        </div>
      ) : data && data.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {data.map((item, idx) => (
            <AnimeCard key={item.id} anime={item} index={idx} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground py-8 text-center">
          No anime found in this category.
        </p>
      )}
    </section>
  );
}
