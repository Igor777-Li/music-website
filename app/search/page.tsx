"use client";

import { useState } from "react";
import { usePlayerContext } from "@/contexts/PlayerContext";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const player = usePlayerContext();

  async function handleSearch() {
    if (!query) return;

    setLoading(true);
    const res = await fetch(`/api/auth/spotify/search?q=${query}`);

    if (!res.ok) {
    console.error("Search failed", res.status);
    setTracks([]);
    setLoading(false);
    return;
  }

    const data = await res.json();

    setTracks(
    (data.tracks?.items || []).map((track: any) => ({
        ...track,
        hasPreview: Boolean(track.preview_url),
    }))
    );

    setLoading(false);

  }

  return (
    <div className="p-6 space-y-6">
      {/* 搜索框 */}
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-lg bg-neutral-900 px-4 py-2 text-white"
          placeholder="Search songs or artists"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          onClick={handleSearch}
          className="rounded-lg bg-purple-600 px-4 py-2"
        >
          Search
        </button>
      </div>

      {/* 搜索结果 */}
      {loading && <div>Loading...</div>}

      <ul className="space-y-2">
        {tracks.map((track) => (
          <li
            key={track.id}
            className="flex items-center justify-between rounded-lg bg-neutral-800 p-3 hover:bg-neutral-700"
          >
            <div>
              <div className="font-medium">{track.name}</div>
              <div className="text-sm text-neutral-400">
                {track.artists.map((a: any) => a.name).join(", ")}
              </div>
            </div>

            <button
                disabled={!track.preview_url}
                onClick={() =>
                    player.playTrack({
                    id: track.id,
                    title: track.name,
                    artist: track.artists[0].name,
                    previewUrl: track.preview_url,
                    })
                }
                className={`rounded-full px-4 py-1 ${
                    track.preview_url
                    ? "bg-purple-500 hover:bg-purple-400"
                    : "bg-gray-600 cursor-not-allowed opacity-50"
                }`}
                >
                ▶
            </button>

          </li>
        ))}
      </ul>
    </div>
  );
}
