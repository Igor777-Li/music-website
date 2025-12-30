import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  
  console.log("cookies:", (await cookies()).getAll());
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const limitParam = Number(searchParams.get("limit") ?? "12");
  const offsetParam = Number(searchParams.get("offset") ?? "0");
  const limit = Number.isNaN(limitParam)
    ? 12
    : Math.min(Math.max(limitParam, 1), 50);
  const offset = Number.isNaN(offsetParam) || offsetParam < 0 ? 0 : offsetParam;

  if (!q) {
    return NextResponse.json(
      { error: "Missing query param q" },
      { status: 400 }
    );
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("spotify_access_token")?.value;

  if (!token) {
    return NextResponse.json(
      { error: "Not logged in" },
      { status: 401 }
    );
  }

  const spotifyRes = await fetch(
    `https://api.spotify.com/v1/search?type=track&limit=${limit}&offset=${offset}&q=${encodeURIComponent(
      q
    )}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!spotifyRes.ok) {
    return NextResponse.json(
      { error: "Spotify search failed" },
      { status: spotifyRes.status }
    );
  }

  const data = await spotifyRes.json();
  return NextResponse.json(data);
}
