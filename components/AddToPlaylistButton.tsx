"use client";

import { useState } from "react";
import { usePlaylists } from "@/contexts/PlaylistContext";
import { useToast } from "@/contexts/ToastContext";
import { usePlayerContext } from "@/contexts/PlayerContext";

type Song = {
  id: string;
  title: string;
  artist: string;
  previewUrl: string | null;
};

export default function AddToPlaylistButton({ song }: { song: Song }) {
  const { playlists, addSongToPlaylist } = usePlaylists();
  const { showToast } = useToast();
  const { addNextToQueue } = usePlayerContext();

  const [open, setOpen] = useState(false);

  return (
    <>
      {/* + 按钮：只负责打开弹窗 */}
      <button
        onClick={() => setOpen(true)}
        className="
          w-6 h-6 rounded-full
          bg-black/60 hover:bg-black
          text-white text-sm
          flex items-center justify-center
        "
        title="Add options"
      >
        +
      </button>

      {/* 弹窗 */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-[#0f172a] rounded-xl p-6 w-80 border border-white/10">
            <h3 className="text-lg font-semibold mb-4">
              Add to…
            </h3>

            {/* 快速操作 */}
            <div className="mb-4">
              <button
                onClick={() => {
                  addNextToQueue(song);
                  showToast(`"${song.title}" will play next`);
                  setOpen(false);
                }}
                className="
                  w-full flex items-center justify-between
                  px-3 py-2 rounded
                  hover:bg-white/10
                "
              >
                <span>▶ Play next</span>
              </button>
            </div>

            <div className="text-xs text-white/40 mb-2">
              Add to playlist
            </div>

            {/* Playlist 列表 */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
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
              className="
                mt-6
                w-full
                inline-flex items-center justify-center
                px-4 py-2
                text-sm
                rounded-md
                border border-white/30
                bg-white/5
                text-white/80
                hover:bg-white/15
                hover:text-white
                transition
              "
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
