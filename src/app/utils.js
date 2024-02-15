// utils.js

export const calculateAverages = (tracks) => {
    if (!Array.isArray(tracks)) {
    console.error("calculateAverages was called with a non-array argument", tracks);
    return {}; // Return an empty object or some default value indicating failure
    }
  
  let totals = {
    danceability: 0,
    duration_ms: 0,
    energy: 0,
    instrumentalness: 0,
    key: 0,
    liveness: 0,
    loudness: 0,
    mode: 0,
    speechiness: 0,
    tempo: 0,
    time_signature: 0,
    valence: 0,
  };

  tracks.forEach((track) => {
    totals.danceability += track.danceability ?? 0;
    totals.duration_ms += track.duration_ms ?? 0;
    totals.energy += track.energy ?? 0;
    totals.instrumentalness += track.instrumentalness ?? 0;
    totals.key += track.key ?? 0;
    totals.liveness += track.liveness ?? 0;
    totals.loudness += track.loudness ?? 0;
    totals.mode += track.mode ?? 0;
    totals.speechiness += track.speechiness ?? 0;
    totals.tempo += track.tempo ?? 0;
    totals.time_signature += track.time_signature ?? 0;
    totals.valence += track.valence ?? 0;
  });

  let averages = {
    danceability: totals.danceability / tracks.length,
    duration_ms: totals.duration_ms / tracks.length,
    energy: totals.energy / tracks.length,
    instrumentalness: totals.instrumentalness / tracks.length,
    key: totals.key / tracks.length,
    liveness: totals.liveness / tracks.length,
    loudness: totals.loudness / tracks.length,
    mode: totals.mode / tracks.length,
    speechiness: totals.speechiness / tracks.length,
    tempo: totals.tempo / tracks.length,
    time_signature: totals.time_signature / tracks.length,
    valence: totals.valence / tracks.length,
  };

  return averages;
};

export const analyzePlaylistVibe = (tracksAllData) => {
  const averages = calculateAverages(tracksAllData);
  let moodDescription = "";

  if (averages.valence > 0.7 && averages.energy > 0.6) {
    moodDescription = "Joyful & Energetic";
  } else if (averages.valence < 0.3 && averages.energy < 0.4) {
    moodDescription = "Sad & Slow";
  } else if (averages.valence > 0.5 && averages.energy < 0.5 && averages.danceability > 0.6) {
    moodDescription = "Groovy & Chill";
  } else if (averages.valence < 0.4 && averages.energy > 0.6 && averages.danceability < 0.5) {
    moodDescription = "Dark & Intense";
  } else if (averages.acousticness > 0.5 && averages.valence > 0.5) {
    moodDescription = "Acoustic & Uplifting";
  } else if (averages.tempo < 100 && averages.energy < 0.5) {
    moodDescription = "Laid-back & Mellow";
  } else if (averages.tempo > 120 && averages.valence > 0.5 && averages.danceability > 0.7) {
    moodDescription = "Euphoric & Danceable";
  } else if (averages.instrumentalness > 0.5) {
    moodDescription = "Instrumental & Ambient";
  } else {
    moodDescription = "Eclectic & Diverse";
  }

  return moodDescription
};


