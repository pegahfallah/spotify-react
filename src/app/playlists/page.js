"use client"
import Image from "next/image";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { openai } from "openai";
import Modal from "../components/modal";
import { calculateAverages, analyzePlaylistVibe } from '../utils';
import { useAuth } from '../context/AuthContext'; 

export default function PlaylistPage() {
  const [searchKey, setSearchKey] = useState("")
  const [tracks, setTracks] = useState([])
  const [trackData, setTrackData] = useState([])

  const [artists, setArtists] = useState([])
  const [trackIDs, setTrackIDs] = useState([]);
  const [moods, setMoods] = useState([null]);
  const [generatedImageUrl, setGeneratedImageUrl] = useState("");
  const [selectedPlaylist, setSelectedPlaylist] = useState("")

  const [showModal, setShowModal] = useState(false)
  const {token, playlists} = useAuth()


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
      return response.data.audio_features; 
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

    setTrackData(audioFeatures);

    if (audioFeatures && audioFeatures.length > 0) { 
      handleAnalyzeAndGenerate(audioFeatures);
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
    // await getUsersPlaylists()
  };

  const handleClickCover = async (e) => {
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


  // const image = convertImageToBase64(generatedImageUrl)
  // updateSpotifyPlaylistCover(image,selectedPlaylist.id,process.env.NEXT_PUBLIC_AUTH_ENDPOINTS  )
  const updateCoverImage = async () => {
    // const id = selectedPlaylist.id;
    // const token = process.env.NEXT_PUBLIC_AUTH_ENDPOINT;
    // try {
    //   const response = await fetch('/api/updatePlaylistCover', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       generatedImageUrl,
    //       id,
    //       token,
    //     }),
    //   });

    //   const data = await response.json();

    //   if (response.ok) {
    //     console.log('Success:', data);
    //     // Handle success, maybe set a state variable to show a success message
    //   } else {
    //     console.error('Error:', data);
    //     // Handle errors, maybe set a state variable to show an error message
    //   }
    // } catch (error) {
    //   console.error('Error:', error);
    //   // Handle the error, maybe set a state variable to show an error message
    // }
  };

const renderPlaylists = () => {
  return playlists.map(p => (
    <div onClick={(e) => {
        setSelectedPlaylist(p);
        setShowModal(true);
      }} className="p-2 rounded-md hover:shadow-custom transition duration-150 ease-in-out relative cursor-pointer" key={p.id}>
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 rounded-md opacity-0 hover:opacity-100 transition-opacity duration-300 ease-in-out">
        <span className="text-[#fefae0] text-center text-2xl">{p.name}</span>
      </div>
      {p.images.length ? (
        <img className="w-full h-full rounded-md" src={p.images[0].url} alt={p.name} />
      ) : (
        <div className="w-full h-full flex items-center justify-center rounded-md bg-gray-200">No Image</div>
      )}
    </div>
  ))
}

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 gap-y-8">
      <h1 className="text-6xl">Select a Playlist</h1>
      <p className="text-xl mb-8">Select a playlist to generate a new Playlist Cover</p>
      <div className="grid grid-cols-4 gap-8">
        {renderPlaylists()}
        <Modal isOpen={showModal} setIsOpen={setShowModal} title={selectedPlaylist.name} imageUrl={selectedPlaylist.images} showImage={generateImage != ""}>
          <button className="btn-primary" onClick={handleClickCover}><p>Generate a new playlist cover photo</p></button>
          {/* <button>Generate a new playlist Description?</button> */}
         {/* <form>
          <label>
            Name:
            <input type="text" name="name" />
          </label>
          <input type="submit" value="Submit" />
        </form> */}
           {generatedImageUrl && (
            <><img src={generatedImageUrl} alt="Generated Mood" width="100%" />
              {/* <button onClick={updateCoverImage}>Set as Spotify playlist cover</button> */}
            </>
          )} 
        </Modal>
      </div>
    </main>
  );
}