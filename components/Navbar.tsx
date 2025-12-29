"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type UserInfo = {
  email: string;
  displayName: string;
};

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const linkClass = (path: string) =>
    `px-3 py-2 rounded-md text-sm ${
      pathname === path
        ? "bg-white/10 text-white"
        : "text-white/70 hover:text-white"
    }`;

    /* ---------- 拿用户状态 ---------- */
  useEffect(() => {
    const token = document.cookie
      .split('; ')
      .find((r) => r.startsWith('spotify_access_token='))
      ?.split('=')[1];

    fetch('http://8.134.159.152:3355/user', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: 'no-store',
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  /* ---------- 登录/登出按钮 ---------- */
  const AuthButton = () => {
    if (loading) return null;          // 加载中什么都不显示
    if (user)
      return (
        <Link
          href="/auth/logout"
          className="px-4 py-2 rounded-md bg-red-600 text-white font-medium hover:bg-red-700"
        >
          Logout
        </Link>
      );
    return (
      <Link
        href="/auth/login"
        className="px-4 py-2 rounded-md bg-green-500 text-black font-medium hover:bg-green-400"
      >
        Login
      </Link>
    );
  };

  return (
    <header className="h-14 bg-[#0b1020]/80 backdrop-blur border-b border-white/10 flex items-center px-6 justify-between">
      <div className="flex items-center gap-6">
        <div className="font-semibold tracking-wide">Music App</div>

        <nav className="flex gap-2">
          <Link href="/" className={linkClass("/")}>Home</Link>
          <Link href="/search" className={linkClass("/search")}>Search</Link>
          <Link href="/profile" className={linkClass("/profile")}>Profile</Link>
        </nav>
      </div>

      {/* 右侧：动态按钮 */}
      <AuthButton />
    </header>
  );
}