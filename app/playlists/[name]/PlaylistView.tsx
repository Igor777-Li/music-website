"use client";

import { usePlaylists } from "@/contexts/PlaylistContext";
import { usePlayerContext } from "@/contexts/PlayerContext";

export default function PlaylistView({
  playlistName,
}: {
  playlistName: string;
}) {
  const { playlists } = usePlaylists();
  const player = usePlayerContext();

  const playlist = playlists.find(
    (p) => p.name === playlistName
  );

  if (!playlist) {
    return (
      <div className="px-10 py-8 text-white/60">
        Playlist not found
      </div>
    );
  }

  return (
    <div className="px-10 py-8">
      {/* 标题 */}
      <h1 className="text-3xl font-bold mb-2">
        {playlist.name}
      </h1>

      <p className="text-white/50 mb-6">
        Playlist · {playlist.songs.length} songs
      </p>

      {/* 空歌单 */}
      {playlist.songs.length === 0 ? (
        <div className="text-white/40">
          This playlist is empty.
        </div>
      ) : (
        <div className="space-y-1">
          {playlist.songs.map((song, index) => (
            <div
              key={`${song.id}-${index}`}
              className="
                flex items-center justify-between
                px-4 py-3 rounded
                hover:bg-white/5
                transition
              "
            >
              {/* 左侧：序号 + 歌曲信息 */}
              <div className="flex items-center gap-4 min-w-0">
                <span className="text-white/40 w-6 text-sm">
                  {index + 1}
                </span>

                <div className="min-w-0">
                  <div className="font-medium truncate">
                    {song.title}
                  </div>
                  <div className="text-xs text-white/50 truncate">
                    {song.artist}
                  </div>
                </div>
              </div>

              {/* 右侧：播放按钮 */}
              <button
                disabled={!song.previewUrl}
                onClick={() =>
                  player.play({
                    id: song.id,
                    title: song.title,
                    artist: song.artist,
                    previewUrl: song.previewUrl,
                  })
                }
                className={`
                  text-xs px-3 py-1 rounded
                  ${
                    song.previewUrl
                      ? "bg-indigo-500 hover:bg-indigo-400 text-black"
                      : "bg-gray-600 text-white/40 cursor-not-allowed"
                  }
                `}
              >
                ▶ Play
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
