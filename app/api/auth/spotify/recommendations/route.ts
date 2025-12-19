import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function GET() {
  console.log("===== [RECOMMENDATIONS] START =====");

  // 1️⃣ Token
  const cookieStore = await cookies();
  const token = cookieStore.get("spotify_access_token")?.value;

  console.log("[Token exists?]", Boolean(token));

  if (!token) {
    console.log("[RECOMMENDATIONS] ❌ No token → abort");
    return NextResponse.json({ error: "No token" }, { status: 401 });
  }

  // 2️⃣ 拉取用户 Top Artists
  const artistRes = await fetch(
    "https://api.spotify.com/v1/me/top/artists?limit=5",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!artistRes.ok) {
    const text = await artistRes.text();
    console.log("[Top Artists] ❌ Failed:", text);
    return NextResponse.json(
      { error: "Top artists failed" },
      { status: 500 }
    );
  }

  const artistData = await artistRes.json();
  const artists = artistData.items ?? [];

  console.log("[Top Artists count]:", artists.length);
  console.log(
    "[Top Artists names]:",
    artists.map((a: any) => a.name)
  );

  // 3️⃣ 提取 genres
  let genres = artists
    .flatMap((a: any) => a.genres)
    .filter(Boolean)
    .slice(0, 2);

  console.log("[Extracted genres]:", genres);

  // 4️⃣ 冷启动判断（⭐关键）
  let mode: "personalized" | "cold-start";

  if (genres.length === 0) {
    mode = "cold-start";
    genres = ["pop", "indie"];
  } else {
    mode = "personalized";
  }

  console.log("[Recommendation mode]:", mode);
  console.log("[Final genres used]:", genres);

  // 5️⃣ Search 推荐
  const q = genres.join(" ");
  const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
    q
  )}&type=track&limit=12`;

  console.log("[Search URL]:", searchUrl);

  const searchRes = await fetch(searchUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!searchRes.ok) {
    const text = await searchRes.text();
    console.log("[Search] ❌ Failed:", text);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }

  const searchData = await searchRes.json();

  console.log(
    "[Recommended tracks count]:",
    searchData.tracks?.items?.length ?? 0
  );

  console.log("===== [RECOMMENDATIONS] END =====");

  return NextResponse.json({
    mode, // ⭐直接返回模式，前端也能用
    genres,
    tracks: searchData.tracks.items,
  });
}
