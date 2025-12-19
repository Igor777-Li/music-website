"use client";

import { usePlayerContext } from "@/contexts/PlayerContext";

export default function QueuePanel() {
  const {
    queue,
    currentIndex,
    playTrack,
    removeFromQueue,
    markUserClearingQueue,
  } = usePlayerContext();

  return (
    <aside
      className="
        w-[360px]
        h-full
        bg-[#0f172a]
        border-l border-white/10
        flex flex-col
      "
    >
      {/* Header */}
      <div className="px-4 py-3 text-sm font-semibold border-b border-white/10">
        Play Queue
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {queue.length === 0 && (
          <div className="px-4 py-6 text-sm text-white/40">
            Queue is empty
          </div>
        )}

        {queue.map((track, index) => {
          const isCurrent = index === currentIndex;

          return (
            <div
              key={`${track.id}-${index}`}
              className={`
                group flex items-center justify-between
                px-4 py-3 cursor-pointer
                ${isCurrent
                  ? "bg-indigo-500/20 text-indigo-300"
                  : "hover:bg-white/10"}
              `}
            >
              {/* 点击左侧 → 播放 */}
              <div
                className="flex-1 min-w-0"
                onClick={() => playTrack(track)}
              >
                <div className="truncate font-medium">
                  {track.title}
                </div>
                <div className="text-xs text-white/50 truncate">
                  {track.artist}
                </div>
              </div>

              {/* 删除当前行（hover 显示更像 Spotify） */}
              <button
                onClick={(e) => {
                  e.stopPropagation();

                  markUserClearingQueue();  
                  removeFromQueue(index);
                }}
                className="
                  ml-3
                  opacity-0 group-hover:opacity-100
                  text-white/40 hover:text-red-400
                  rounded-full w-7 h-7
                  flex items-center justify-center
                  transition
                "
                title="Remove from queue"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
