"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthContext'; 

export default function Home() {
 
  const { token, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;
    let spotifyToken = token || window.localStorage.getItem("token");

    if (!spotifyToken && hash) {
      spotifyToken = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1];
      window.location.hash = "";
      login(spotifyToken); 
    }


  if (typeof window !== "undefined" && token) {
    router.push('/playlists');
  }


  }, [login, router, token]);

  return (
    <main >
      <div className="h-[100vh] flex flex-col items-center justify-center align-center">
      <h1 className="text-3xl">
         generate a new playlist cover based on your Spotify playlist vibes
      </h1>
      <button className="btn-primary">
        <a href={`${process.env.NEXT_PUBLIC_AUTH_ENDPOINT}?client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_REDIRECT_URI}&response_type=${process.env.NEXT_PUBLIC_RESPONSE_TYPE}`}>Connect to Spotify</a>
        </button>  
        </div>
    </main>
  );
}
