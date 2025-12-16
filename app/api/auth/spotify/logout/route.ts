import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL("/", request.url);

  const res = NextResponse.redirect(url);

  res.cookies.set("spotify_access_token", "", {
    maxAge: 0,
    path: "/",
  });

  return res;
}
