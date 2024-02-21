import { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';

export default function Landing() {
const [token, setToken] = useState("")
const { login } = useAuth();

useEffect(() => {
    const hash = window.location.hash
    let spotifyToken = window.localStorage.getItem("token")

    if (!spotifyToken && hash) {
      spotifyToken = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]

      window.location.hash = ""
      window.localStorage.setItem("token", spotifyToken)
    }
    setToken(spotifyToken)
    if (spotifyToken) {
     login(spotifyToken); // This should update the context's token
    }
  }, [])


  const logout = () => {
    setToken("")
    window.localStorage.removeItem("token")
  }
  
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