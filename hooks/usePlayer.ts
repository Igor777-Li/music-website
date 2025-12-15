"use client";

import { useEffect, useRef, useState } from "react";

export type PlayableTrack = {
  id: string;
  title: string;
  artist: string;
  previewUrl: string | null;
};

export function usePlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentTrack, setCurrentTrack] = useState<PlayableTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // 初始化 audio
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoaded = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);

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

  // 播放指定 track（只播 preview）
  function play(track: PlayableTrack) {
    if (!track.previewUrl) {
      console.warn("Track has no previewUrl");
      return;
    }

    const audio = audioRef.current!;
    audio.pause();

    audio.src = track.previewUrl;
    audio.currentTime = 0;

    audio
      .play()
      .then(() => {
        setCurrentTrack(track);
        setIsPlaying(true);
      })
      .catch((err) => {
        console.warn("Audio play failed:", err);
      });
  }

  function pause() {
    audioRef.current?.pause();
    setIsPlaying(false);
  }

  function toggle() {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn("Toggle play failed:", err);
        });
    }
  }

  function seek(time: number) {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  }

  return {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    play,
    pause,
    toggle,
    seek,
  };
}
