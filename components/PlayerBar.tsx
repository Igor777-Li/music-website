"use client";

import { useState } from "react";
import { usePlayerContext } from "@/contexts/PlayerContext";

export default function PlayerBar() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    toggle,
    seek,
    queue,
    currentIndex,
    playTrack,
    playMode,
    setPlayMode,
    removeFromQueue,
    playNext,
    playPrev,
    
  } = usePlayerContext();

  const formatTime = (time: number) => {
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };
  //const [showQueue, setShowQueue] = useState(false);
  const { toggleQueuePanel } = usePlayerContext();

  const togglePlayMode = () => {
    setPlayMode((prev) => (prev === "list" ? "single" : "list"));
  };


  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-[#0b1020]/95 backdrop-blur border-t border-white/10 flex flex-col px-6">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-md bg-indigo-500/30 flex items-center justify-center">
            🎵
          </div>
            <div>
                <div className="text-sm font-semibold">
                    {currentTrack?.title ?? "Song Title"}
                </div>

                <div className="text-xs text-white/60">
                    {currentTrack?.artist ?? "Artist Name"}
                </div>

                {currentTrack && !currentTrack.previewUrl && (
                    <div className="text-xs text-white/40">
                    Demo audio (Spotify preview unavailable)
                    </div>
                )}
            </div>

        </div>

        <div className="flex items-center space-x-6">
          <button 
            className="text-white/70 hover:text-white"
            onClick={playPrev}
            >⏮</button>

          <button
            onClick={toggle}
            className="w-10 h-10 rounded-full bg-indigo-500 hover:bg-indigo-400 flex items-center justify-center text-black font-bold"
          >
            {isPlaying ? "⏸" : "▶"}
          </button>

          <button 
            className="text-white/70 hover:text-white"
            onClick={playNext}
            >⏭</button>

          <button
            onClick={togglePlayMode}
            className={`
              w-10 h-10
              flex items-center justify-center
              rounded-lg
              text-sm font-semibold
              transition
              border-2
              ${
                playMode === "single"
                  ? "border-indigo-400 bg-indigo-500/20 text-indigo-400"
                  : "border-white/20 text-white/70 hover:text-white hover:bg-white/10"
              }
            `}
            title={playMode === "single" ? "Single loop" : "List loop"}
          >
            {playMode === "single" ? "1" : "L"}
          </button>




          <button
            onClick={toggleQueuePanel}
            className="text-white/70 hover:text-white"
            title="Queue"
          >
            ☰
          </button>


        </div>

        <div className="w-32 text-right text-xs text-white/60">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <span className="text-xs text-white/50">
          {formatTime(currentTime)}
        </span>

        <input
          type="range"
          min={0}
          max={duration}
          value={currentTime}
          onChange={(e) => seek(Number(e.target.value))}
          className="flex-1 accent-indigo-500"
        />

        <span className="text-xs text-white/50">
          {formatTime(duration)}
        </span>
      </div>

    </div>
  );
}
