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
  addPlaylist: (name: string) => Promise<boolean>;
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
      const data = await res.json();
      if (data.ok) {
        setPlaylists(data.list);
      } else {
        alert("获取列表失败：" + (data.msg || "未知错误"));
      }
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
  const addPlaylist = async (name: string): Promise<boolean> => {
    const res = await fetch(`${baseUrl}/playlist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (data.ok) {
      await fetchPlaylists();
      return true;
    } else {
      alert("创建歌单失败：" + (data.msg || "未知错误"));
      return false;
    }
  };

  const removePlaylist = async (name: string) => {
    const res = await fetch(`${baseUrl}/playlist`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (data.ok) {
      await fetchPlaylists();
    } else {
      alert("删除歌单失败：" + (data.msg || "未知错误"));
    }
  };

  const addSongToPlaylist = async (playlistName: string, song: Song) => {
    const res = await fetch(`${baseUrl}/playlist/song`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ playlistName, song }),
    });
    const data = await res.json();
    if (data.ok) {
      await fetchPlaylists();
    } else {
      alert("收藏歌曲失败：" + (data.msg || "未知错误"));
    }
  };

  const removeSongFromPlaylist = async (
    playlistName: string,
    songId: string
  ) => {
    const res = await fetch(`${baseUrl}/playlist/song`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ playlistName, songId }),
    });
    const data = await res.json();
    if (data.ok) {
      await fetchPlaylists();
    } else {
      alert("移除歌曲失败：" + (data.msg || "未知错误"));
    }
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