"use client";

import { useEffect, useState } from "react";
import { usePlayerContext } from "@/contexts/PlayerContext";

export default function RecommendedSection() {
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const player = usePlayerContext();

  useEffect(() => {
    async function fetchRecommended() {
      try {
        const res = await fetch(
          "/api/auth/spotify/search?q=pop&limit=8"
        );
        if (!res.ok) return;

        const data = await res.json();
        setTracks(data.tracks?.items || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommended();
  }, []);

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">
        Recommended for You
      </h2>

      {loading && (
        <div className="text-white/50 text-sm">
          Loading recommendations...
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tracks.map((track) => {
          const hasPreview = Boolean(track.preview_url);

          return (
            <div
              key={track.id}
              className="rounded-lg bg-white/5 border border-white/10 p-4 hover:bg-white/10 transition"
            >
              <div className="h-32 bg-indigo-500/30 rounded mb-3 flex items-center justify-center">
                🎵
              </div>

              <div className="text-sm font-medium truncate">
                {track.name}
              </div>
              <div className="text-xs text-white/60 truncate">
                {track.artists.map((a: any) => a.name).join(", ")}
              </div>

              <button
                disabled={!hasPreview}
                onClick={() =>
                  player.play({
                    id: track.id,
                    title: track.name,
                    artist: track.artists[0].name,
                    previewUrl: track.preview_url,
                  })
                }
                className={`mt-3 w-full text-sm rounded-md py-1 ${
                  hasPreview
                    ? "bg-indigo-500 hover:bg-indigo-400 text-black"
                    : "bg-gray-600 text-white/40 cursor-not-allowed"
                }`}
              >
                ▶ Play
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
