import React, { useEffect, useState } from "react";
import Player from "./Player";

const API_BASE = "http://localhost:4000";

export default function App() {
  const [tracks, setTracks] = useState([]);
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/tracks`)
      .then(r => r.json())
      .then(setTracks);
  }, []);

  const playTrack = (track) => {
    setCurrent(track);
    setQueue(prev => [track, ...prev.filter(t => t.id !== track.id)]);
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 20 }}>
      <h2>Spotify-style Demo</h2>

      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ flex: 1 }}>
          <h3>Tracks</h3>
          <ul>
            {tracks.map(t => (
              <li key={t.id} style={{ marginBottom: 10 }}>
                <strong>{t.title}</strong> — {t.artist}
                <div>
                  <button onClick={() => playTrack(t)} style={{ marginTop: 6 }}>Play</button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ width: 340 }}>
          <h3>Now Playing</h3>
          <Player track={current} baseUrl={API_BASE} />
          <h4>Queue</h4>
          <ol>
            {queue.map(q => <li key={q.id}>{q.title} — {q.artist}</li>)}
          </ol>
        </div>
      </div>
    </div>
  );
}
