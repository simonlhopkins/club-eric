import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return new Response("Authorization code missing", {
      status: 400,
    });
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const host = headers().get("host");
  console.log(host);
  const redirect_uri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/spotify/callback`;

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(clientId + ":" + clientSecret).toString("base64"),
    },
    body: new URLSearchParams({
      code: code,
      redirect_uri: redirect_uri,
      grant_type: "authorization_code",
    }),
  });
  if (!response.ok) {
    return new Response("Something went wrong", {
      status: 400,
    });
  }
  const { access_token, expires_in } = await response.json();
  const params = new URLSearchParams();
  params.append("access_token", encodeURIComponent(access_token));
  params.append("expires_in", encodeURIComponent(expires_in));
  redirect(`/spotifyLogin?${params.toString()}`);
}
