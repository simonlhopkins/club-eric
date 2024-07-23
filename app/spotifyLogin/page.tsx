"use client";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const Page = () => {
  // use
  const searchParams = useSearchParams();
  const accessToken = searchParams.get("access_token");
  const [username, setUsername] = useState<string | null>(null);
  useEffect(() => {
    if (accessToken != null) {
      window.localStorage.setItem("spotifyAccessToken", accessToken);
    }
    let mounted = true;
    const getUsername = async () => {
      const response = await fetch(
        "https://api.spotify.com/v1/me/top/artists",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      ).then(async (res) => await res.json());
      if (mounted) {
        const data = response.items.map((item: any) => item.name);
        setUsername(JSON.stringify(data));
      }
    };

    getUsername();
    return () => {
      mounted = false;
    };
  }, [accessToken]);
  return (
    <>
      <p>{accessToken}</p>
      {username && <p>{username}</p>}
    </>
  );
};

export default Page;
