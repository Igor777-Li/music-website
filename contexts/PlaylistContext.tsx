// contexts/PlaylistContext.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

/* ---------- 类型定义 ---------- */
export type Song = {
  id: string;
  title: string;
  artist: string;
  previewUrl: string | null;
};

export type Playlist = {
  name: string;
  songs: Song[];
};

type CtxType = {
  playlists: Playlist[];
  loading: boolean;
  error: string | null;
  addPlaylist: (name: string) => Promise<void>;
  removePlaylist: (name: string) => Promise<void>;
  addSongToPlaylist: (playlistName: string, song: Song) => Promise<void>;
  removeSongFromPlaylist: (playlistName: string, songId: string) => Promise<void>;
};

/* ---------- 工具：拿 token ---------- */
function getToken(): string {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("spotify_access_token="))
    ?.split("=")[1];
  if (!token) throw new Error("未登录或 token 失效");
  return token;
}

/* ---------- 工具：统一 fetch 封装（保留，但不再调用） ---------- */
async function api<T = unknown>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const base = "http://8.134.159.152:3355";
  const res = await fetch(`${base}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "Network error");
    throw new Error(text || "请求失败");
  }
  return res.json();
}

/* ---------- Context ---------- */
const PlaylistContext = createContext<CtxType | null>(null);

export function PlaylistProvider({ children }: { children: React.ReactNode }) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = "http://8.134.159.152:3355";

  /* 拉列表 */
  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${baseUrl}/playlist`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        cache: "no-store",
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "Network error");
        throw new Error(txt || "获取列表失败");
      }
      const data: { ok: boolean; list: Playlist[] } = await res.json();
      setPlaylists(data.list);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  /* ---------- 业务方法 ---------- */
  const addPlaylist = async (name: string) => {
    const res = await fetch(`${baseUrl}/playlist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "Network error");
      throw new Error(txt || "创建歌单失败");
    }
    await fetchPlaylists();
  };

  const removePlaylist = async (name: string) => {
    const res = await fetch(`${baseUrl}/playlist`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ name }),   // 把歌单名字放在 body 里传递
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => 'Network error');
      throw new Error(txt || '删除歌单失败');
    }
    await fetchPlaylists();
  };

  const addSongToPlaylist = async (playlistName: string, song: Song) => {
    const res = await fetch(`${baseUrl}/playlist/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ playlistName, song }),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "Network error");
      throw new Error(txt || "收藏歌曲失败");
    }
    await fetchPlaylists();
  };

 const removeSongFromPlaylist = async (
    playlistName: string,
    songId: string
  ) => {
    const res = await fetch(`${baseUrl}/playlist/songs`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ playlistName, songId }), // 两个参数都放 body
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => 'Network error');
      throw new Error(txt || '移除歌曲失败');
    }
    await fetchPlaylists();
  };

  return (
    <PlaylistContext.Provider
      value={{
        playlists,
        loading,
        error,
        addPlaylist,
        removePlaylist,
        addSongToPlaylist,
        removeSongFromPlaylist,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
}

/* ---------- hook ---------- */
export const usePlaylists = () => {
  const ctx = useContext(PlaylistContext);
  if (!ctx) throw new Error("usePlaylists must be used inside PlaylistProvider");
  return ctx;
};