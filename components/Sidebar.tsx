"use client";

import Link from "next/link";
import { usePlaylists } from "@/contexts/PlaylistContext";
import { useState } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";
import GenrePlaylistDialog from "@/components/GenrePlaylistDialog";

const playlistItemClass = `
  group flex items-center justify-between
  px-3 py-2 rounded
  cursor-pointer
  hover:bg-indigo-400
  hover:text-black
`;

export default function Sidebar() {
  const { playlists, addPlaylist, removePlaylist } = usePlaylists();
  const [showSmartDialog, setShowSmartDialog] = useState(false);


  const handleCreatePlaylist = () => {
    const name = prompt("Enter playlist name");
    if (!name) return;

    const trimmed = name.trim();
    if (!trimmed) return;

    addPlaylist(trimmed);
  };

  const [pendingDelete, setPendingDelete] = useState<string | null>(null);



  return (
    <aside className="h-full px-4 py-6 bg-black/70 border-r border-white/10 flex flex-col">
      {/* 标题 */}
      <div className="text-lg font-semibold mb-6">
        Music Library
      </div>

      {/* Playlists 标题 + 新建 */}
      <div className="mt-3 flex items-center justify-between text-sm text-white/60 border-t border-white/10 ">

        <span>Playlists</span>
        <button
          onClick={handleCreatePlaylist}
          className="
            text-lg leading-none
            px-2 rounded
            hover:bg-white/10
            text-white/80
          "
          title="Create playlist"
        >
          +
        </button>
      </div>

      <button
          onClick={() => setShowSmartDialog(true)}
          className="
            mt-2 w-full text-sm py-2 rounded
            bg-indigo-500/20 hover:bg-indigo-500
            text-indigo-300 hover:text-black
            hover: bg-indigo-400
            transition
          "
        >
          + Smart Playlist
        </button>

      {/* 歌单列表 */}
      <div className="mt-2 space-y-1 text-sm">

        {/* 用户歌单 */}
        {playlists.map((playlist) => (
          <Link
            key={playlist.name}
            href={`/playlists/${encodeURIComponent(playlist.name)}`}
            className={playlistItemClass}
          >
            {/* 歌单名 */}
            <span className="truncate">{playlist.name}</span>

            {/* 删除按钮 */}
            {playlist.name !== "Liked Songs" && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setPendingDelete(playlist.name);
                }}

                className="
                  hidden group-hover:flex
                  items-center justify-center
                  w-5 h-5
                  text-xs
                  rounded
                  text-white/60
                  hover:text-white
                  hover:bg-white/20
                "
                title="Delete playlist"
              >
                ×
              </button>
            )}
          </Link>
        ))}
      </div>

      <div className="mt-auto text-xs text-white/30 pt-4">
        © Igor Music
      </div>

        {pendingDelete && (
          <ConfirmDialog
            title="Delete playlist?"
            message={`"${pendingDelete}" will be permanently removed.`}
            onCancel={() => setPendingDelete(null)}
            onConfirm={() => {
              removePlaylist(pendingDelete);
              setPendingDelete(null);
            }}
          />
        )}

        {showSmartDialog && (
          <GenrePlaylistDialog
            onClose={() => setShowSmartDialog(false)}
          />
        )}


    </aside>    
  );
}
