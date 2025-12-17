"use client";

import { useState } from "react";
import { usePlaylists } from "@/contexts/PlaylistContext";
import { useToast } from "@/contexts/ToastContext";

type Song = {
  id: string;
  title: string;
  artist: string;
  previewUrl: string | null;
};

export default function AddToPlaylistButton({
  song,
}: {
  song: Song;
}) {
  const { playlists, addSongToPlaylist } = usePlaylists();
  const { showToast } = useToast();

  const [open, setOpen] = useState(false);

  return (
    <>
      {/* + 按钮 */}
      <button
        onClick={() => setOpen(true)}
        className="
          w-6 h-6 rounded-full
          bg-black/60 hover:bg-black
          text-white text-sm
          flex items-center justify-center
        "
        title="Add to playlist"
      >
        +
      </button>

      {/* 弹窗 */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-[#0f172a] rounded-xl p-6 w-80 border border-white/10">
            <h3 className="text-lg font-semibold mb-4">
              Add to playlist
            </h3>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {playlists.map((playlist) => (
                <button
                  key={playlist.name}
                  onClick={() => {
                    addSongToPlaylist(playlist.name, song);
                    showToast(
                      `Added "${song.title}" to ${playlist.name}`
                    );
                    setOpen(false);
                  }}
                  className="
                    w-full text-left
                    px-3 py-2 rounded
                    hover:bg-white/10
                  "
                >
                  {playlist.name}
                </button>
              ))}
            </div>

            <button
              onClick={() => setOpen(false)}
              className="mt-4 text-sm text-white/50 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
