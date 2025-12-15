import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  
  console.log("cookies:", (await cookies()).getAll());
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

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
    `https://api.spotify.com/v1/search?type=track&limit=12&q=${encodeURIComponent(
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
