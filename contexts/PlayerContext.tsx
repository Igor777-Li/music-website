"use client";

import {
  createContext,
  useContext,
  ReactNode,
} from "react";
import { usePlayer } from "@/hooks/usePlayer";

type PlayerContextType = ReturnType<typeof usePlayer>;

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const player = usePlayer();

  return (
    <PlayerContext.Provider value={player}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayerContext() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayerContext must be used within PlayerProvider");
  }
  return context;
}
