"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type UserInfo = {
  email: string;
  displayName: string;
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const linkClass = (path: string) =>
    `px-3 py-2 rounded-md text-sm ${
      pathname === path
        ? "bg-white/10 text-white"
        : "text-white/70 hover:text-white"
    }`;

  async function fetchMe() {
    try {
      const res = await fetch("/api/auth/spotify/me", {
        cache: "no-store",
      });
      if (!res.ok) {
        setUser(null);
        return;
      }
      const data = await res.json();
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMe();
  }, []);

  return (
    <header className="h-14 bg-[#0b1020]/80 backdrop-blur border-b border-white/10 flex items-center px-6 justify-between">
      <div className="flex items-center gap-6">
        <div className="font-semibold tracking-wide">Music App</div>

        <nav className="flex gap-2">
          <Link href="/" className={linkClass("/")}>
            Home
          </Link>
          <Link href="/search" className={linkClass("/search")}>
            Search
          </Link>
        </nav>
      </div>

      {!loading && (
        <div className="flex items-center gap-4 text-sm">
          {!user ? (
            <a
              href="/api/auth/spotify/login"
              onClick={() => {
                // 登录完成后刷新
                setTimeout(() => {
                  router.refresh();
                }, 1000);
              }}
              className="px-4 py-2 rounded-md bg-green-500 text-black font-medium hover:bg-green-400"
            >
              Login
            </a>
          ) : (
            <>
              <span className="text-white/80">{user.email}</span>
              <a
                href="/api/auth/spotify/logout"
                onClick={() => {
                  setTimeout(() => {
                    router.refresh();
                  }, 300);
                }}
                className="px-3 py-2 rounded-md text-white/70 hover:text-white border border-white/20"
              >
                Exit
              </a>
            </>
          )}
        </div>
      )}
    </header>
  );
}
