"use client"
import Image from "next/image";
import { useEffect, useState } from 'react';
import axios from 'axios';

const CLIENT_ID = "dd89b542c3cb4ac2ab1f564b086f5847"
const REDIRECT_URI = "http://localhost:3000"
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
const RESPONSE_TYPE = "token"

export default function Home() {
  const [searchKey, setSearchKey] = useState("")
  const [playlists, setPlaylists] = useState([])
  const [tracks, setTracks] = useState([])
  const [artists, setArtists] = useState([])
  const [trackIDs, setTrackIDs] = useState([]);


  const [token, setToken] = useState("")
  useEffect(() => {
    const hash = window.location.hash
    let token = window.localStorage.getItem("token")

    if (!token && hash) {
      token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]

      window.location.hash = ""
      window.localStorage.setItem("token", token)
    }

    setToken(token)
  }, [])

  const logout = () => {
    setToken("")
    window.localStorage.removeItem("token")
  }

  //GET PLAYLISTS

const getUsersPlaylists = async () => {
  try {
    const { data } = await axios.get("https://api.spotify.com/v1/me/playlists", {
      headers: {
        Authorization: `Bearer ${token}`
      },
    });
    setPlaylists(data.items); // Assuming `data.items` is the correct path
    return data.items; // Return playlists for immediate use
  } catch (error) {
    console.error("Error fetching playlists:", error);
    return []; // Return an empty array in case of an error
  }
};

  
  
//GET PLAYLIST TRACKS
  const getPlaylistTracks = async (playlistId) => {
  try {
    const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
    });
    const trackIds = response.data.items.map(item => item.track.id).join(',');
    return trackIds;
  } catch (error) {
    console.error("Error fetching playlist tracks:", error);
  }
};

const getTracksAudioFeatures = async (trackIds) => {
  try {
    const response = await axios.get(`https://api.spotify.com/v1/audio-features?ids=${trackIds}`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
    });
    return response.data.audio_features; // This contains the vibe data
  } catch (error) {
    console.error("Error fetching tracks' audio features:", error);
  }
};
// Updated analyzePlaylistVibe to use returned playlists data directly
const analyzePlaylistVibe = async () => {
  const fetchedPlaylists = await getUsersPlaylists(); // Get playlists and wait for them
  if (fetchedPlaylists.length === 0) {
    console.log('No playlists found or an error occurred.');
    return;
  }

  // Use the first playlist's ID directly from the fetched data
  const trackIds = await getPlaylistTracks(fetchedPlaylists[0].id);
  if (!trackIds) {
    console.log('No tracks found or an error occurred.');
    return;
  }

  const audioFeatures = await getTracksAudioFeatures(trackIds);
  if (!audioFeatures) {
    console.log('No audio features found or an error occurred.');
    return;
  }
    
  console.log(audioFeatures);
  // Now, audioFeatures contains the vibe data for each track
  // You can analyze it as needed to determine the vibe of the playlist
};
  
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await analyzePlaylistVibe()

  };
    const renderPlaylists = () => {
      return playlists.map(p => (
        <div key={p.id}>
          {p.images.length ? <img width={"100%"} src={p.images[0].url} alt="" /> : <div>No Image</div>}
          {p.name}
        </div>
      ))
    }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <button className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
        <a href={`${process.env.NEXT_PUBLIC_AUTH_ENDPOINT}?client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_REDIRECT_URI}&response_type=${process.env.NEXT_PUBLIC_RESPONSE_TYPE}`}>Login to Spotify</a>
      </button>
      
        <button className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" type={"submit"} onClick={handleSubmit}>Search</button>
      {renderPlaylists()}

      {console.log(playlists)}
      {console.log(tracks)}
    
    </main>
  );
}
