"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePlayerContext } from "@/contexts/PlayerContext";

const PAGE_SIZE = 12;

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [total, setTotal] = useState<number | null>(null);
  const [paginationRoot, setPaginationRoot] =
    useState<HTMLElement | null>(null);

  const player = usePlayerContext();

  const totalPages =
    total === null ? null : Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildSearchUrl = (q: string, pageNumber: number) => {
    const params = new URLSearchParams({
      q,
      limit: String(PAGE_SIZE),
      offset: String((pageNumber - 1) * PAGE_SIZE),
    });
    return `/api/auth/spotify/search?${params.toString()}`;
  };

  const normalizePage = (value: string) => {
    const parsed = Number.parseInt(value, 10);
    const base = Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
    if (totalPages !== null) {
      return Math.min(base, totalPages);
    }
    return base;
  };

  async function handleSearch(targetPage?: number) {
    if (!query) return;

    const nextPage = targetPage ?? page;
    setLoading(true);
    const res = await fetch(buildSearchUrl(query, nextPage));

    if (!res.ok) {
      console.error("Search failed", res.status);
      setTracks([]);
      setTotal(null);
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

    setTotal(data.tracks?.total ?? null);
    setPage(nextPage);
    setPageInput(String(nextPage));
    setLoading(false);
  }

  useEffect(() => {
    setPaginationRoot(
      document.getElementById("search-pagination-root")
    );
  }, []);

  const paginationControls = (
    <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-3 rounded-xl border border-white/10 bg-neutral-900/90 px-4 py-3 text-sm backdrop-blur">
      <button
        type="button"
        onClick={() => handleSearch(page - 1)}
        disabled={loading || page <= 1 || !query}
        className="rounded-lg bg-neutral-800 px-4 py-2 disabled:opacity-50"
      >
        Prev
      </button>

      <div className="flex items-center gap-2 text-neutral-300">
        <input
          type="number"
          min={1}
          max={totalPages ?? undefined}
          value={pageInput}
          onChange={(e) => setPageInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const nextPage = normalizePage(pageInput);
              handleSearch(nextPage);
            }
          }}
          onBlur={() => {
            const nextPage = normalizePage(pageInput);
            if (nextPage !== page) handleSearch(nextPage);
            else setPageInput(String(page));
          }}
          className="w-20 rounded-lg bg-neutral-900 px-3 py-1 text-center text-white"
        />
      </div>

      <button
        type="button"
        onClick={() => handleSearch(page + 1)}
        disabled={
          loading || !query || (totalPages !== null && page >= totalPages)
        }
        className="rounded-lg bg-neutral-800 px-4 py-2 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );

  return (
    <div className="flex h-full flex-col gap-4 p-6">
      {/* 搜索框 */}
      <div className="sticky top-0 z-10 -mx-6 bg-gradient-to-b from-[#0f172a] via-[#0f172a] to-transparent px-6 pb-4 pt-2">
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-lg bg-neutral-900 px-4 py-2 text-white"
            placeholder="Search songs or artists"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch(1);
            }}
          />
          <button
            onClick={() => handleSearch(1)}
            className="rounded-lg bg-purple-600 px-4 py-2"
          >
            Search
          </button>
        </div>
      </div>

      {/* 搜索结果 */}
      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {loading && <div>Loading...</div>}

        <ul className="space-y-2 pb-24">
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

      {paginationRoot &&
        createPortal(paginationControls, paginationRoot)}
    </div>
  );
}
