"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const linkClass = (path: string) =>
    `px-3 py-2 rounded-md text-sm ${
      pathname === path
        ? "bg-white/10 text-white"
        : "text-white/70 hover:text-white"
    }`;

  return (
    <header className="h-14 bg-[#0b1020]/80 backdrop-blur border-b border-white/10 flex items-center px-6">
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
    </header>
  );
}
