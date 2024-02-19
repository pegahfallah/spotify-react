// pages/api/updatePlaylistCover.js
import axios from 'axios';
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { imageUrl, playlistId, spotifyToken } = req.body;

      // Fetch the image
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = await imageResponse.buffer();
      const base64Image = imageBuffer.toString('base64');

      // Spotify API endpoint to update playlist cover
      const spotifyEndpoint = `https://api.spotify.com/v1/playlists/${playlistId}/images`;

      // Make the PUT request to Spotify
      const spotifyResponse = await axios.put(spotifyEndpoint, Buffer.from(base64Image, 'base64'), {
        headers: {
          'Authorization': `Bearer ${spotifyToken}`,
          'Content-Type': 'image/jpeg',
        },
        responseType: 'arraybuffer', // Important for handling binary data
      });

      if (spotifyResponse.status === 202) {
        return res.status(200).json({ message: 'Playlist cover updated successfully' });
      } else {
        return res.status(spotifyResponse.status).json({ message: 'Failed to update playlist cover' });
      }
    } catch (error) {
      console.error('Error updating playlist cover:', error);
      return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  } else {
    // Handle any non-POST requests
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
