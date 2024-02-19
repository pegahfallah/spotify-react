"use client"
import Image from "next/image";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { openai } from "openai";
import Modal from "./modal";
import { calculateAverages, analyzePlaylistVibe } from './utils';

export default function Home() {
  const [searchKey, setSearchKey] = useState("")
  const [playlists, setPlaylists] = useState([])
  const [tracks, setTracks] = useState([])
  const [trackData, setTrackData] = useState([])

  const [artists, setArtists] = useState([])
  const [trackIDs, setTrackIDs] = useState([]);
  const [moods, setMoods] = useState([null]);
  const [generatedImageUrl, setGeneratedImageUrl] = useState("");
  const [selectedPlaylist, setSelectedPlaylist] = useState("")

  const [showModal, setShowModal] = useState(false)
  
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
      return data.items;
    } else if ((response.status === 429 || response.status === 503) && retryCount < 3) {
      // Check for Retry-After header
      const retryAfter = response.headers.get("Retry-After");
      const retryAfterMs = (retryAfter ? parseInt(retryAfter, 10) : 10) * 1000; // Default to 10 seconds if not provided

      console.log(`Rate limit exceeded. Retrying after ${retryAfterMs / 1000} seconds...`);

      // Wait for the time specified in Retry-After before retrying
      await new Promise(resolve => setTimeout(resolve, retryAfterMs));

      // Retry the request
      return
      (retryCount + 1);
    } else {
      // Handle other errors or maximum retry attempts reached
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error fetching playlists:", error);
    return []; // Return an empty array in case of an error or max retries reached
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
    setTracks(trackIds)
    return trackIds
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

const getTrackFeatures = async () => {
  if (playlists.length === 0) {
    console.log('No playlists found or an error occurred.');
    return;
  }
  console.log(selectedPlaylist.id)
  const trackIds = await getPlaylistTracks(selectedPlaylist.id);
  if (!trackIds) {
    console.log('No tracks found or an error occurred.');
    return;
  }

  const audioFeatures = await getTracksAudioFeatures(trackIds);
  if (!audioFeatures) {
    console.log('No audio features found or an error occurred.');
    return;
  }
  // Make sure trackData is set with the fetched audio features
  setTrackData(audioFeatures);

  // Wait for trackData to be updated before analyzing and generating the image
  // This is done by moving the handleAnalyzeAndGenerate call here
  if(audioFeatures && audioFeatures.length > 0) { // Ensure audioFeatures is not empty
    handleAnalyzeAndGenerate(audioFeatures); // Pass audioFeatures directly
  } else {
    console.log('Audio features are empty or invalid.');
  }
};


  
  const generateImage = async (moodDescription) => {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/images/generations',
        {
          prompt: `generate an image with this mood: ${moodDescription}. ART only.`,
          n: 1,
          size: "1024x1024",
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const imageUrl = response.data.data[0].url;
      setGeneratedImageUrl(imageUrl);
    } catch (error) {
      console.error("Error generating image:", error);
    }
  };

  
  const handleSubmit = async (e) => {
    await getUsersPlaylists()
  };

  const handleClickCover = async (e)  => {
     await getTrackFeatures()
  }
  
const handleAnalyzeAndGenerate = (audioFeatures) => {
  console.log(audioFeatures)
  if (audioFeatures) {
    const moodDescription = analyzePlaylistVibe(audioFeatures);

    generateImage(moodDescription);
  }
  else {
    console.log('error in handleAnalyze')
  }
};
    const renderPlaylists = () => {
      return playlists.map(p => (
        <div onClick={(e) => {
          setSelectedPlaylist(p)
        setShowModal(true)
        }} className="p-2 rounded-md hover:shadow-custom transition duration-150 ease-out hover:ease-in" key={p.id}>
          {p.images.length ? <img width={"100%"} src={p.images[0].url} alt="" /> : <div>No Image</div>}
          {/* {p.name} */}
        </div>
      ))
    }
  
    
const updatePlaylistCover = async () => {
  const imageURL = generatedImageUrl;
  const playlistId = selectedPlaylist.id;
  const spotifyToken = process.env.NEXT_PUBLIC_AUTH_ENDPOINT;

  try {
    const response = await fetch('/api/updatePlaylistCover', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageURL,
        playlistId,
        spotifyToken,
      }),
    });

    if (response.ok) {
      console.log('Playlist cover updated successfully');
    } else {
      console.error('Failed to update playlist cover');
    }
  } catch (error) {
    console.error('Error updating playlist cover:', error);
  }
};


  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <button className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
        <a href={`${process.env.NEXT_PUBLIC_AUTH_ENDPOINT}?client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_REDIRECT_URI}&response_type=${process.env.NEXT_PUBLIC_RESPONSE_TYPE}`}>Login to Spotify</a>
      </button>
      
        <button className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" type={"submit"} onClick={handleSubmit}>Search</button>
      <div className="grid grid-cols-3 gap-10">
        {renderPlaylists()}
        <Modal isOpen={showModal} setIsOpen={setShowModal} title={selectedPlaylist.name}>

          <button onClick={handleClickCover}>Generate a new playlist cover photo?</button>
          <button>Generate a new playlist Description?</button>
          {generatedImageUrl && (
            <><img src={generatedImageUrl} alt="Generated Mood" width="100%" />
              <button onClick={updatePlaylistCover}>Set as Spotify playlist cover</button>
            </>
          )} 
      </Modal>
        </div>
      
    </main>
  );
}