import { NextResponse } from "next/server";

console.log("SPOTIFY LOGIN ROUTE HIT");

export const runtime = "nodejs";

export async function GET() {
  const clientId = process.env.SPOTIFY_CLIENT_ID!;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI!;
  const scopes = process.env.SPOTIFY_SCOPES!;

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: scopes,
  });

  const url = `https://accounts.spotify.com/authorize?${params.toString()}`;

  return NextResponse.redirect(url);
}
