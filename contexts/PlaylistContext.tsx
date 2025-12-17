// contexts/PlaylistContext.tsx
"use client";

import { createContext, useContext, useState } from "react";

type Song = {
  id: string;
  title: string;
  artist: string;
  previewUrl: string | null;
};


type Playlist = {
  name: string;
  songs: Song[];
};

type PlaylistContextType = {
  playlists: Playlist[];
  addSongToPlaylist: (playlistName: string, songId: Song) => void;
  addPlaylist: (name: string) => void;
  removePlaylist: (name: string) => void;
};

const PlaylistContext = createContext<PlaylistContextType | null>(null);

export function PlaylistProvider({ children }: { children: React.ReactNode }) {
  const [playlists, setPlaylists] = useState<Playlist[]>([
    { name: "Liked Songs", songs: [] }
  ]);

  const addSongToPlaylist = (playlistName: string, song: Song) => {
    setPlaylists((prev) =>
      prev.map((playlist) => {
        if (playlist.name !== playlistName) return playlist;

        // 防止重复添加
        const alreadyExists = playlist.songs.some(
          (s) => s.id === song.id
        );

        if (alreadyExists) return playlist;

        return {
          ...playlist,
          songs: [...playlist.songs, song],
        };
      })
    );
  };

  const addPlaylist = (name: string) => {
    setPlaylists((prev) =>
        prev.some((p) => p.name === name)
        ? prev
        : [...prev, { name, songs: [] }]
    );
    };

    const removePlaylist = (name: string) => {
    setPlaylists((prev) =>
        prev.filter((p) => p.name !== name)
    );
    };


  return (
    <PlaylistContext.Provider value={{ playlists,
        addSongToPlaylist,
        addPlaylist,
        removePlaylist, }}>
      {children}
    </PlaylistContext.Provider>
  );
}

export const usePlaylists = () => {
  const ctx = useContext(PlaylistContext);
  if (!ctx) throw new Error("usePlaylists must be used inside PlaylistProvider");
  return ctx;
};
