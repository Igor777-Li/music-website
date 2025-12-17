"use client";

import { PlayerProvider } from "@/contexts/PlayerContext";
import { PlaylistProvider } from "@/contexts/PlaylistContext";
import { ToastProvider } from "@/contexts/ToastContext";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PlayerProvider>
      <PlaylistProvider>
        <ToastProvider>
            {children}    
        </ToastProvider>
    </PlaylistProvider>
    </PlayerProvider>
  );
}
