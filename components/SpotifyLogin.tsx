"use client";

const scope = "user-read-private user-read-email";
const authUrl = new URL("https://accounts.spotify.com/authorize");
const redirectUri = "http://localhost:3000/api/spotify/callback";
const CLIENT_ID = "7a812fd9f79149c3be442fa8471ae310";

const SpotifyLogin = () => {
  const handleLogin = () => {
    const clientId = CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/spotify/callback`;
    const scope = "user-read-private user-read-email user-top-read";
    const responseType = "code";
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=${responseType}`;

    window.location.href = authUrl;
  };
  return (
    <>
      <p>{CLIENT_ID}</p>
      <button
        onClick={() => {
          handleLogin();
        }}
      >
        login to spotify
      </button>
    </>
  );
};

export default SpotifyLogin;
