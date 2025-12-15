"use client";

import { usePlayerContext } from "@/contexts/PlayerContext";

const localSongs = [
  {
    id: "song1",
    title: "Song 1",
    artist: "Local Artist",
    src: "/audio/song1.mp3",
  },
  {
    id: "song2",
    title: "Song 2",
    artist: "Local Artist",
    src: "/audio/song2.mp3",
  },
  {
    id: "song3",
    title: "Song 3",
    artist: "Local Artist",
    src: "/audio/song3.mp3",
  },
];

export default function LocalSection() {
  const player = usePlayerContext();

  const visibleSongs = localSongs.slice(0, 5); // 👈 最多显示 5 首

  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold mb-4">My Local Music</h2>

      <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3">
        {visibleSongs.length === 0 && (
          <>
            <p className="text-white/60 text-sm">
              Your local music library will appear here.
            </p>
            <p className="text-white/40 text-xs mt-2">
              Manage local playlists in the My page.
            </p>
          </>
        )}

        {visibleSongs.map((song) => (
          <div
            key={song.id}
            className="
              flex items-center justify-between
              rounded-md bg-white/5 hover:bg-white/10
              px-4 py-3 transition
            "
          >
            {/* 左侧：信息 */}
            <div>
              <div className="text-sm font-medium">{song.title}</div>
              <div className="text-xs text-white/50">{song.artist}</div>
            </div>

            {/* 右侧：播放按钮 */}
            <button
              onClick={() =>
                player.play({
                  id: song.id,
                  title: song.title,
                  artist: song.artist,
                  previewUrl: song.src, // 👈 本地音频
                })
              }
              className="
                text-xs px-3 py-1
                rounded bg-indigo-500 hover:bg-indigo-400
                text-black
              "
            >
              ▶ Play
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
