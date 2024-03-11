"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthContext';
import Album from './components/album';
import { data } from './constants'
import Image from 'next/image';

export default function Home() {

  const { token, login, setPlaylists, playlists } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;
    let spotifyToken = token || window.localStorage.getItem("token");
    if (!spotifyToken && hash) {
      spotifyToken = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1];
      window.location.hash = "";
      login(spotifyToken);
    }

  }, [login, router, token]);


  useEffect(() => {

  async function fetchData() {
    if (typeof window !== "undefined" && token) await getUsersPlaylists()
  }
  fetchData();
}, [token]);


  const getUsersPlaylists = async (retryCount = 0) => {
    try {
      const response = await fetch("https://api.spotify.com/v1/me/playlists", {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Playlists fetched:", data.items);
        setPlaylists(data.items)
        router.push('./playlists')
        return data.items;
      } else if ((response.status === 429 || response.status === 503) && retryCount < 3) {

        const retryAfter = response.headers.get("Retry-After");
        const retryAfterMs = (retryAfter ? parseInt(retryAfter, 10) : 10) * 1000; 

        console.log(`Rate limit exceeded. Retrying after ${retryAfterMs / 1000} seconds...`);

        await new Promise(resolve => setTimeout(resolve, retryAfterMs));

        return (retryCount + 1);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching playlists:", error);
      return []; 
    }
  };

  return (
    <main >
      <div className="h-[100vh] w-[100vw] flex flex-col items-center justify-center gap-10 overflow-hidden">
        <div className='flex flex-col items-center justify-end align-center gap-y-8 h-full w-full'>
          <h1 className="text-6xl">
            SpotAI
          </h1>
          <p className="text-xl">
            Generate a playlist cover based on your Spotify playlist vibes
          </p>
          <button className="btn-primary">
            <a href={`${process.env.NEXT_PUBLIC_AUTH_ENDPOINT}?client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_REDIRECT_URI}&response_type=${process.env.NEXT_PUBLIC_RESPONSE_TYPE}`}>Connect to Spotify</a>
          </button>
          <div className='flex gap-x-8 mt-12'>
            <Image
              width={180}
              height={80}
              priority
              src='/powered-by-openai.svg'
              alt="Powered by OpenAI"
            />
            <Image
              width={150}
              height={80}
              priority
              src='/spotify_logo.png'
              alt="Spotify Logo"
            />
          </div>
          <div className='relative flex overflow-x-hidden w-full'>
            <div className="py-12 animate-marquee whitespace-nowrap ">
              <Album urls={['https://media.npr.org/assets/img/2019/12/05/tyler-the-creator-igor_custom-967b87cf7029273e8d6975883b44a31a1d43a26e-s1100-c50.jpg', 'https://media.architecturaldigest.com/photos/5890e88033bd1de9129eab0a/1:1/w_870,h_870,c_limit/Artist-Designed%20Album%20Covers%202.jpg', 'https://www.sleek-mag.com/wp-content/uploads/2016/08/AlbumCovers_Blonde-1200x1200.jpg', 'https://www.highsnobiety.com/static-assets/dato/1682339833-best-album-covers-time-04.jpg', 'https://i.scdn.co/image/ab67616d0000b2734c79d5ec52a6d0302f3add25',]} />
            </div>
            <div className="absolute top-0 py-12 animate-marquee2 whitespace-nowrap">
              <Album urls={['https://media.npr.org/assets/img/2019/12/05/tyler-the-creator-igor_custom-967b87cf7029273e8d6975883b44a31a1d43a26e-s1100-c50.jpg', 'https://media.architecturaldigest.com/photos/5890e88033bd1de9129eab0a/1:1/w_870,h_870,c_limit/Artist-Designed%20Album%20Covers%202.jpg', 'https://www.sleek-mag.com/wp-content/uploads/2016/08/AlbumCovers_Blonde-1200x1200.jpg', 'https://www.highsnobiety.com/static-assets/dato/1682339833-best-album-covers-time-04.jpg', 'https://i.scdn.co/image/ab67616d0000b2734c79d5ec52a6d0302f3add25',]} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
