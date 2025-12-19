"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type PlayableTrack = {
  id: string;
  title: string;
  artist: string;
  previewUrl: string | null;
};

type PlayMode = "single" | "list";

type QueueSource =
  | { type: "playlist"; playlistName: string }
  | { type: "manual" }
  | null;

export function usePlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [queue, setQueue] = useState<PlayableTrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [playMode, setPlayMode] = useState<PlayMode>("list");

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // QueuePanel UI
  const [showQueuePanel, setShowQueuePanel] = useState(false);
  const toggleQueuePanel = () => setShowQueuePanel((v) => !v);

  // 播放来源与快照（用于删空后恢复）
  const [queueSource, setQueueSource] = useState<QueueSource>(null);
  const [playlistSnapshot, setPlaylistSnapshot] = useState<PlayableTrack[] | null>(null);

  // refs：保证 ended 回调拿到最新状态
  const queueRef = useRef<PlayableTrack[]>([]);
  const indexRef = useRef<number>(-1);
  const modeRef = useRef<PlayMode>("list");

  const userClearingQueueRef = useRef(false);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    indexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    modeRef.current = playMode;
  }, [playMode]);

  // 当前播放曲目（由 queue + index 派生）
  const currentTrack = useMemo(() => {
    if (currentIndex < 0) return null;
    return queue[currentIndex] ?? null;
  }, [queue, currentIndex]);

  // 初始化 audio（只一次）
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoaded = () => setDuration(audio.duration || 0);

    const onEnded = () => {
      const q = queueRef.current;
      const i = indexRef.current;
      const mode = modeRef.current;

      if (!q.length || i < 0) return;

      if (mode === "single") {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
      }

      const nextIndex = i + 1 < q.length ? i + 1 : 0;
      setCurrentIndex(nextIndex);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.pause();
      audio.src = "";
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  // currentTrack 变化 -> 统一在这里切歌播放
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!currentTrack) {
      audio.pause();
      audio.src = "";
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      return;
    }

    if (!currentTrack.previewUrl) {
      audio.pause();
      audio.src = "";
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      return;
    }

    audio.pause();
    audio.src = currentTrack.previewUrl;
    audio.currentTime = 0;

    Promise.resolve(audio.play())
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }, [currentTrack?.id, currentTrack?.previewUrl]);

  // ---------- 基础播放控制 ----------
  function toggle() {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    Promise.resolve(audio.play())
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }

  function pause() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
  }

  function seek(time: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
  }

  function playAt(index: number) {
    const q = queueRef.current;
    if (index < 0 || index >= q.length) return;
    setCurrentIndex(index);
  }

  function playNext() {
    const q = queueRef.current;
    if (!q.length) return;

    let nextIndex = indexRef.current + 1;

    if (nextIndex >= q.length) {
      if (modeRef.current === "list") nextIndex = 0;
      else return;
    }

    setCurrentIndex(nextIndex);
  }

  function playPrev() {
    const q = queueRef.current;
    if (!q.length) return;

    let prevIndex = indexRef.current - 1;

    if (prevIndex < 0) {
      if (modeRef.current === "list") prevIndex = q.length - 1;
      else return;
    }

    setCurrentIndex(prevIndex);
  }

  // ---------- 队列写入 ----------
  // 点击某首歌“立即播放”：把它插到下一首，并跳过去
  function playTrack(track: PlayableTrack) {
    setQueue((prev) => {
      const existingIndex = prev.findIndex((t) => t.id === track.id);
      if (existingIndex !== -1) {
        setCurrentIndex(existingIndex);
        return prev;
      }

      if (prev.length === 0 || indexRef.current < 0) {
        setCurrentIndex(0);
        return [track];
      }

      const insertIndex = Math.min(prev.length, indexRef.current + 1);
      const nextQueue = [
        ...prev.slice(0, insertIndex),
        track,
        ...prev.slice(insertIndex),
      ];
      setCurrentIndex(insertIndex);
      return nextQueue;
    });

    // 手动插歌算 manual 来源
    setQueueSource({ type: "manual" });
    setPlaylistSnapshot(null);
  }

  // 只是入队到末尾（不播放）
  const addToQueue = (track: PlayableTrack) => {
    setQueue((prev) => {
      if (prev.some((t) => t.id === track.id)) return prev;
      return [...prev, track];
    });
    setCurrentIndex((prev) => (prev === -1 ? 0 : prev));

    setQueueSource({ type: "manual" });
    setPlaylistSnapshot(null);
  };

  // 入队多首（保持去重）
  const addToQueueMany = (tracks: PlayableTrack[]) => {
    setQueue((prev) => {
      const map = new Map(prev.map((t) => [t.id, t]));
      for (const tr of tracks) map.set(tr.id, tr);
      return Array.from(map.values());
    });
    setCurrentIndex((prev) => (prev === -1 && tracks.length ? 0 : prev));

    setQueueSource({ type: "manual" });
    setPlaylistSnapshot(null);
  };

  // 下一首播放（插到 currentIndex + 1）
  const addNextToQueue = (track: PlayableTrack) => {
    setQueue((prev) => {
      if (prev.some((t) => t.id === track.id)) return prev;

      const cur = indexRef.current;
      if (cur < 0) return [...prev, track];

      const insertIndex = Math.min(prev.length, cur + 1);
      return [
        ...prev.slice(0, insertIndex),
        track,
        ...prev.slice(insertIndex),
      ];
    });

    setQueueSource({ type: "manual" });
    setPlaylistSnapshot(null);
  };

  // ✅ 播放 playlist：把整张歌单变成 queue，并从指定 index 开始播
  function playPlaylistAt(
    tracks: PlayableTrack[],
    startIndex: number,
    playlistName: string
  ) {
    if (!tracks.length) return;
    userClearingQueueRef.current = false; 
    setQueue(tracks);
    setCurrentIndex(Math.max(0, Math.min(startIndex, tracks.length - 1)));

    setQueueSource({ type: "playlist", playlistName });
    setPlaylistSnapshot(tracks);

    // 打开右侧队列面板（你想要的话）
    //setShowQueuePanel(true);
  }

  // ---------- 删除：删空后自动恢复 playlist ----------
  const removeFromQueue = (index: number) => {
    setQueue((prev) => {
      if (index < 0 || index >= prev.length) return prev;

      const next = [...prev];
      next.splice(index, 1);

      // 🚫 用户主动清空 → 不恢复
      if (next.length === 0 && userClearingQueueRef.current) {
        return [];
      }

      // ✅ 非用户行为导致的空队列 → 允许恢复 playlist
      if (
        next.length === 0 &&
        queueSource?.type === "playlist" &&
        playlistSnapshot &&
        playlistSnapshot.length > 0
      ) {
        return playlistSnapshot;
      }

      return next;
    });

    setCurrentIndex((prevIndex) => {
      if (index < prevIndex) return prevIndex - 1;
      if (index === prevIndex) return -1;
      return prevIndex;
    });
  };



  function markUserClearingQueue() {
    userClearingQueueRef.current = true;
  }


  return {
    currentTrack,
    isPlaying,
    currentTime,
    duration,

    queue,
    currentIndex,

    playTrack,
    playAt,

    toggle,
    pause,
    seek,

    playMode,
    setPlayMode,

    addToQueue,
    addToQueueMany,
    addNextToQueue,

    playNext,
    playPrev,

    removeFromQueue,

    showQueuePanel,
    setShowQueuePanel,
    toggleQueuePanel,

    queueSource,
    setQueueSource,
    playlistSnapshot,
    setPlaylistSnapshot,

    playPlaylistAt,
    markUserClearingQueue,
  };
}
