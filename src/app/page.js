"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthContext'; // Adjust the import path as needed

export default function Home() {
  const { token, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;
    let spotifyToken = token || window.localStorage.getItem("token");

    if (!spotifyToken && hash) {
      spotifyToken = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1];
      window.location.hash = "";
      login(spotifyToken); // This updates the token in both context and localStorage
    }


  if (typeof window !== "undefined" && token) {
    // Ensuring that the router operation is applied in a client-side-only real invocation.
    router.push('/playlists');
  }


  }, [login, router, token]);

  // If there's no token, render the landing component
  return (
    <main className="flex flex-col items-center justify-between space-between gap-y-20">
      <h1 className="text-8xl">
        SpotAI generates an AI image based on your playlist vibes
      </h1>
      <button className="btn-primary">
        <a href={`${process.env.NEXT_PUBLIC_AUTH_ENDPOINT}?client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_REDIRECT_URI}&response_type=${process.env.NEXT_PUBLIC_RESPONSE_TYPE}`}>Connect to Spotify</a>
      </button>  
    </main>
  );
}
