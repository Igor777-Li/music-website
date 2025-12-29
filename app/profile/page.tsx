"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePlaylists } from "@/contexts/PlaylistContext";

type User = {
  id?: string | number;
  username?: string;
  email?: string;
  bio?: string;
  avatarUrl?: string;
};

export default function ProfilePage() {
  const { playlists } = usePlaylists(); // ← 直接拿歌单
  const [user, setUser] = useState<User | null>(null);

  /* ---------- 只拉一次用户信息 ---------- */
  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((r) => r.startsWith("spotify_access_token="))
      ?.split("=")[1];

    fetch("http://8.134.159.152:3355/user", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  /* ---------- 数据拆分 ---------- */
  const createdPlaylists = playlists.filter((pl) => pl.name !== "Liked Songs");
  const likedPlaylists   = playlists.filter((pl) => pl.name === "Liked Songs");

  /* ---------- 渲染 ---------- */
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold mb-6">个人资料</h1>

        {/* 头像块 */}
        <div className="bg-white/5 rounded-lg p-6 flex items-center gap-6">
          <div className="w-28 h-28 bg-white/5 rounded-full overflow-hidden flex-shrink-0">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm text-white/60">无头像</div>
            )}
          </div>

          <div className="flex-1">
  			<div className="flex items-center justify-between">
    		  <div>
      		    <div className="text-xl font-bold">{user?.username ?? "未登录"}</div>
      		    <div className="text-sm text-white/70">UID: {user?.id ?? "-"}</div>
      		    <div className="text-sm text-white/70">email: {user?.email ?? "未填写"}</div>
      		    <div className="text-sm text-white/60 mt-2">
        		  个性签名: {user?.bio || "暂无签名"}
      		    </div>
    	      </div>

    		{/* 编辑按钮 */}
    		  <Link
      			href="/profile/edit"
      			className="px-3 py-1 rounded-md bg-white/10 text-sm hover:bg-white/20"
    		  >
      			编辑资料
    		  </Link>
  			</div>

            {/* 歌单区域直接复用上下文数据 */}
            <div className="mt-4">
              <h2 className="text-lg font-medium mb-2">创建的歌单</h2>
              {createdPlaylists.length === 0 ? (
                <div className="text-sm text-white/60">未创建歌单</div>
              ) : (
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {createdPlaylists.map((pl) => (
                    <Link
                      key={pl.name}
                      href={`/playlists/${encodeURIComponent(pl.name)}`}
                      className="bg-white/3 p-3 rounded-lg flex items-center gap-3 hover:scale-[1.01] transition"
                    >
                      <div className="w-16 h-16 bg-white/5 rounded overflow-hidden flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium truncate">{pl.name}</div>
                        <div className="text-sm text-white/60">{pl.songs.length} 首</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <h2 className="text-lg font-medium mb-2 mt-6">喜爱的歌单</h2>
              {
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {likedPlaylists.map((pl) => (
                    <Link
                      key={pl.name}
                      href={`/playlists/${encodeURIComponent(pl.name)}`}
                      className="bg-white/3 p-3 rounded-lg flex items-center gap-3 hover:scale-[1.01] transition"
                    >
                      <div className="w-16 h-16 bg-white/5 rounded overflow-hidden flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium truncate">{pl.name}</div>
                        <div className="text-sm text-white/60">{pl.songs.length} 首</div>
                      </div>
                    </Link>
                  ))}
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}