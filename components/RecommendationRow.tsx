"use client";

import { useEffect, useRef, useState } from "react";
import { usePlayerContext } from "@/contexts/PlayerContext";
import AddToPlaylistButton from "@/components/AddToPlaylistButton";


type Props = {
  title: string;
  source: "search" | "personalized";
  keyword?: string;
};


export default function RecommendationRow({ title, keyword, source }: Props) {
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const rowRef = useRef<HTMLDivElement>(null);
  const player = usePlayerContext();
  const [showPicker, setShowPicker] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<any>(null);



  useEffect(() => {
    async function fetchTracks() {
      try {
        const url =
          source === "personalized"
            ? "/api/auth/spotify/recommendations"
            : `/api/auth/spotify/search?q=${encodeURIComponent(keyword ?? "")}&limit=12`;

        const res = await fetch(url);

        if (!res.ok) return;

        const data = await res.json();

        const items =
          source === "personalized"
            ? data.tracks ?? []
            : data.tracks?.items ?? [];

        setTracks(items);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchTracks();
  }, [keyword, source]);

  const scrollLeft = () => {
    rowRef.current?.scrollBy({ left: -320, behavior: "smooth" });
  };

  const scrollRight = () => {
    rowRef.current?.scrollBy({ left: 320, behavior: "smooth" });
  };

  return (
    <section className="mb-12">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>

      {loading && (
        <div className="text-sm text-white/50">Loading...</div>
      )}

      {/* 外层：箭头 + 可视窗口 */}
      <div className="flex items-center relative">
        {/* 左箭头 */}
        <button
          onClick={scrollLeft}
          className="
            flex-shrink-0
            w-10 h-10 mr-2
            rounded-full
            bg-black/60 hover:bg-black
            text-white
            flex items-center justify-center
          "
        >
          ◀
        </button>

        {/* 中间：固定可视宽度窗口 */}
        <div className="overflow-hidden max-w-[1400px]">
          <div
            ref={rowRef}
            className="
              flex gap-4
              overflow-x-auto
              scroll-smooth
              scrollbar-hide
              pb-2
            "
          >
            {tracks.map((track) => {
              const playable = Boolean(track.preview_url);

              const coverUrl =
                track.album?.images?.[1]?.url ||
                track.album?.images?.[0]?.url ||
                "/placeholder.png";

              return (
                <div
                  key={track.id}
                  className="
                    relative
                    w-44 flex-shrink-0
                    bg-white/5 hover:bg-white/10
                    border border-white/10
                    rounded-xl
                    p-3 pt-2
                    transition
                  "
                >
            
                  <AddToPlaylistButton
                    song={{
                      id: track.id,
                      title: track.name,
                      artist: track.artists
                        ?.map((a: any) => a.name)
                        .join(", ") ?? "Unknown",
                      previewUrl: track.preview_url,
                    }}
                  />

                  {/* 封面 */}
                  <img
                    src={coverUrl}
                    alt={track.name}
                    className="
                      w-full aspect-square
                      rounded-lg
                      object-cover
                      mb-3
                    "
                  />


                  {/* 歌名 */}
                  <div className="text-sm font-medium truncate">
                    {track.name}
                  </div>

                  {/* 艺术家 */}
                  <div className="text-xs text-white/60 truncate">
                    {track.artists.map((a: any) => a.name).join(", ")}
                  </div>

                  {/* 播放按钮 */}
                  <button
                    disabled={!playable}
                    onClick={() =>
                      player.playTrack({
                        id: track.id,
                        title: track.name,
                        artist: track.artists[0].name,
                        previewUrl: track.preview_url,
                      })
                    }
                    className={`mt-3 w-full text-xs rounded py-1 ${
                      playable
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
        </div>

        {/* 右箭头 */}
        <button
          onClick={scrollRight}
          className="
            flex-shrink-0
            w-10 h-10 ml-2
            rounded-full
            bg-black/60 hover:bg-black
            text-white
            flex items-center justify-center
          "
        >
          ▶
        </button>
      </div>

    </section>

  );
}
