"use client";

import { useState } from "react";
import { usePlaylists } from "@/contexts/PlaylistContext";

type Props = {
  onClose: () => void;
};

const GENRES = [
  "pop",
  "indie",
  "rock",
  "jazz",
  "hip-hop",
  "anime",
  "k-pop",
  "electronic",
];

export default function GenrePlaylistDialog({ onClose }: Props) {
  const { addPlaylist, addSongToPlaylist } = usePlaylists();

  const [playlistName, setPlaylistName] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* 切换 genre */
  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
  };

  /* 创建智能歌单 */
  const handleCreate = async () => {
    if (!playlistName.trim()) {
      setError("Please enter a playlist name.");
      return;
    }

    if (selectedGenres.length === 0) {
      setError("Please select at least one genre.");
      return;
    }


    setLoading(true);
    setError(null);

    try {
      // 1️⃣ 调用你现有的 recommendations API
      const res = await fetch(
        `/api/auth/spotify/smart-tracks?genres=${encodeURIComponent(selectedGenres.join(","))}&limit=12`
      );


      if (!res.ok) {
        throw new Error("Failed to fetch recommendations");
      }

      const data = await res.json();
      const tracks = data.tracks ?? [];

      console.log("[SmartPlaylist] selectedGenres:", selectedGenres);
      console.log("[SmartPlaylist] fetched track ids:", tracks.map((t:any)=>t.id).slice(0,5));

      // 2️⃣ 创建歌单
      const ok = await addPlaylist(playlistName);
      if (!ok) {
        onClose();
        return;
      }

      // 3️⃣ 把推荐歌曲加入歌单
      for (const track of tracks) {
        await addSongToPlaylist(playlistName, {
          id: track.id,
          title: track.name,
          artist: track.artists
            ?.map((a: any) => a.name)
            .join(", ") ?? "Unknown",
          previewUrl: track.preview_url,
        });
      };

      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to create smart playlist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="w-[420px] rounded-xl bg-[#0f172a] p-6 border border-white/10">
        {/* 标题 */}
        <h2 className="text-lg font-semibold mb-4">
          Create Smart Playlist
        </h2>

        {/* 歌单名输入 */}
        <input
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
          placeholder="Playlist name"
          className="
            w-full mb-4 px-3 py-2 rounded
            bg-black/40 border border-white/10
            text-sm outline-none
            focus:border-indigo-400
          "
        />

        {/* 风格选择 */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => toggleGenre(genre)}
              className={`
                px-3 py-2 rounded text-sm transition
                ${
                  selectedGenres.includes(genre)
                    ? "bg-indigo-500 text-black"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }
              `}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="text-sm text-red-400 mb-3">
            {error}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="text-white/60 hover:text-white"
          >
            Cancel
          </button>

          <button
            onClick={handleCreate}
            disabled={loading}
            className="
              px-4 py-2 rounded
              bg-indigo-500 hover:bg-indigo-400
              text-black text-sm
              disabled:opacity-50
            "
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
