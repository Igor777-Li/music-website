import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  console.log("SPOTIFY CALLBACK HIT");

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { error: "Missing code" },
      { status: 400 }
    );
  }

  // 1️⃣ 用 code 换 token
  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString("base64"),
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
    }),
  });

  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    console.error("Token exchange failed:", text);
    return NextResponse.json(
      { error: "Token exchange failed" },
      { status: 500 }
    );
  }

  const tokenData = await tokenRes.json();

  // 2️⃣ 构造 redirect response
  const res = NextResponse.redirect(
    `${process.env.APP_BASE_URL}/`
  );

  // 3️⃣ 写 cookie（🔥关键）
  res.cookies.set("spotify_access_token", tokenData.access_token, {
    httpOnly: true,
    path: "/",
    maxAge: tokenData.expires_in, // 秒
  });

  return res;
}
