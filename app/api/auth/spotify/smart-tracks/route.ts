import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";

function buildQuery(genres: string[]) {
  // 用 OR 组合 genre filter：genre:"pop" OR genre:"rock"
  // 注意：Search 的 q 语法支持 genre 过滤器（官方文档）
  const parts = genres.map((g) => `genre:"${g}"`);
  return parts.join(" OR ");
}

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("spotify_access_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Missing spotify_access_token cookie" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const genresParam = searchParams.get("genres") ?? "";
  const limit = Number(searchParams.get("limit") ?? "12");

  const genres = genresParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (genres.length === 0) {
    return NextResponse.json({ error: "Missing genres" }, { status: 400 });
  }

  // 关键：避免“永远一样”，给 search 加随机 offset
  // 这里用一个简单策略：offset 0~80（可按需调大）
  const offset = Math.floor(Math.random() * 5) * 20;

  const q = buildQuery(genres);
  const url =
    `https://api.spotify.com/v1/search` +
    `?q=${encodeURIComponent(q)}` +
    `&type=track` +
    `&limit=${Math.min(limit, 50)}` +
    `&offset=${offset}` +
    `&market=US`;

  console.log("===== [SMART TRACKS] =====");
  console.log("[genres]", genres);
  console.log("[q]", q);
  console.log("[offset]", offset);
  console.log("[url]", url);

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[SMART TRACKS] Spotify error:", text);
    return NextResponse.json({ error: `Spotify search failed: ${text}` }, { status: 500 });
  }

  const data = await res.json();
  const tracks = data?.tracks?.items ?? [];

  console.log("[tracks count]", tracks.length);
  console.log("===== [SMART TRACKS] END =====");

  return NextResponse.json({ tracks });
}
