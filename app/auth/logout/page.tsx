"use client";

import { useEffect } from "react";

export default function LogoutPage() {
  useEffect(() => {
    (async () => {
      try {
        const token = document.cookie
          .split("; ")
          .find((r) => r.startsWith("spotify_access_token="))
          ?.split("=")[1];

        await fetch("http://8.134.159.152:3355/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
      } catch {
        /* 后端失败也继续 */
      } finally {
        /* 清本地 Cookie 并跳转 */
        document.cookie = "spotify_access_token=; path=/; max-age=0";
        window.location.href = "/";
      }
    })();
  }, []);

  return (
    <div className="flex h-screen items-center justify-center text-white/70">
      正在退出…
    </div>
  );
}