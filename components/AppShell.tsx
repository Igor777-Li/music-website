"use client";

import { useEffect, useRef, useState } from "react";
import Sidebar from "@/components/Sidebar";

const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 420;

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const isResizing = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;

      const newWidth = Math.min(
        MAX_SIDEBAR_WIDTH,
        Math.max(MIN_SIDEBAR_WIDTH, e.clientX)
      );

      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const startResize = () => {
    isResizing.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* 左侧 Sidebar */}
      <div
        style={{ width: sidebarWidth }}
        className="bg-black/40 border-r border-white/10"
      >
        <Sidebar />
      </div>

      {/* 拖拽条 */}
      <div
        onMouseDown={startResize}
        className="
          w-[4px]
          cursor-col-resize
          bg-transparent
          hover:bg-white/20
          transition
        "
      />

      {/* 右侧主内容 */}
      <main className="flex-1 bg-gradient-to-br from-[#0f172a] to-[#1e1b4b] overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
