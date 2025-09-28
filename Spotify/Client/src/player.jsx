import React, { useEffect, useRef, useState } from "react";

export default function Player({ track, baseUrl }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (track && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = `${baseUrl}/stream/${track.id}`;
      audioRef.current.load();
      audioRef.current.play().then(() => setPlaying(true)).catch(()=>setPlaying(false));
    } else if (!track && audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
    }
  }, [track]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setPos(a.currentTime);
    const onDur = () => setDuration(a.duration);
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('loadedmetadata', onDur);
    return () => {
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('loadedmetadata', onDur);
    };
  }, []);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play();
      setPlaying(true);
    }
  };

  const seek = (v) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = v;
    setPos(v);
  };

  const setVol = (v) => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = v;
  };

  return (
    <div>
      <audio ref={audioRef} />
      {track ? (
        <div>
          <div><strong>{track.title}</strong> — {track.artist}</div>
          <div style={{ marginTop: 8 }}>
            <button onClick={toggle}>{playing ? 'Pause' : 'Play'}</button>
            <span style={{ marginLeft: 10 }}>{Math.floor(pos)}s / {isNaN(duration)? '--' : Math.floor(duration) + 's'}</span>
          </div>

          <div style={{ marginTop: 6 }}>
            <input type="range" min="0" max={duration || 0} value={pos} onChange={(e) => seek(Number(e.target.value))} />
          </div>

          <div style={{ marginTop: 6 }}>
            Volume: <input type="range" min="0" max="1" step="0.01" defaultValue="1" onChange={(e)=>setVol(Number(e.target.value))} />
          </div>
        </div>
      ) : (
        <div>No track selected</div>
      )}
    </div>
  );
}
