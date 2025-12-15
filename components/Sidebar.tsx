"use client";

import Link from "next/link";
import { useState } from "react";

export default function Sidebar() {
  const [playlists, setPlaylists] = useState<string[]>([
    "My Playlist 1",
  ]);

  // 新建歌单
  const handleCreatePlaylist = () => {
    const name = prompt("Enter playlist name");
    if (!name) return;

    const trimmed = name.trim();
    if (!trimmed) return;
    if (playlists.includes(trimmed)) return;

    setPlaylists((prev) => [...prev, trimmed]);
  };

  // 删除歌单
  const handleDeletePlaylist = (name: string) => {
    setPlaylists((prev) => prev.filter((p) => p !== name));
  };

  return (
    <aside className="h-full px-4 py-6 bg-black/70 border-r border-white/10 flex flex-col">
      {/* 标题 */}
      <div className="text-lg font-semibold mb-6">
        Music Library
      </div>

      {/* 功能入口 */}
      <nav className="space-y-2 text-sm">
        <Link
          href="/"
          className="block rounded px-3 py-2 hover:bg-white/10"
        >
          Home
        </Link>
        <Link
          href="/search"
          className="block rounded px-3 py-2 hover:bg-white/10"
        >
          Search
        </Link>
      </nav>

      {/* Playlists 标题 + 新建 */}
      <div className="mt-8 flex items-center justify-between text-sm text-white/60 border-t border-white/10 pt-4">
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

      {/* 歌单列表 */}
      <div className="mt-2 space-y-1 text-sm">
        {/* 固定歌单：不可删除 */}
        <div className="px-3 py-2 rounded bg-white/5">
          Liked Songs
        </div>

        {/* 用户歌单 */}
        {playlists.map((name) => (
          <div
            key={name}
            className="
              group
              flex items-center justify-between
              px-3 py-2 rounded
              hover:bg-white/10
              cursor-pointer
            "
          >
            {/* 歌单名 */}
            <span className="truncate">{name}</span>

            {/* 删除按钮：hover 显示 */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // 防止触发点击歌单
                handleDeletePlaylist(name);
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
          </div>
        ))}
      </div>

      <div className="mt-auto text-xs text-white/30 pt-4">
        © Igor Music
      </div>
    </aside>
  );
}
