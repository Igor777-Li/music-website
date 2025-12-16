import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("spotify_access_token")?.value;

  if (!token) {
    return NextResponse.json(
      { error: "NOT_AUTHENTICATED" },
      { status: 401 }
    );
  }

  const res = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "SPOTIFY_AUTH_FAILED" },
      { status: 401 }
    );
  }

  const data = await res.json();

  return NextResponse.json({
    email: data.email,
    displayName: data.display_name,
  });
}
