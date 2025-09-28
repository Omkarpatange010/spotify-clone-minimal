const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const AUDIO_DIR = path.join(__dirname, 'audio');
const TRACKS_FILE = path.join(__dirname, 'tracks.json');

function loadTracks() {
  return JSON.parse(fs.readFileSync(TRACKS_FILE, 'utf8'));
}

// GET /api/tracks - list tracks
app.get('/api/tracks', (req, res) => {
  const tracks = loadTracks();
  res.json(tracks);
});

// GET /api/tracks/:id - single metadata
app.get('/api/tracks/:id', (req, res) => {
  const tracks = loadTracks();
  const t = tracks.find(x => x.id === req.params.id);
  if (!t) return res.status(404).json({error: 'not found'});
  res.json(t);
});

// GET /stream/:id - stream audio with range support
app.get('/stream/:id', (req, res) => {
  const tracks = loadTracks();
  const t = tracks.find(x => x.id === req.params.id);
  if (!t) return res.status(404).end('Track not found');

  const filePath = path.join(AUDIO_DIR, t.file);
  if (!fs.existsSync(filePath)) return res.status(404).end('File missing on server');

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'audio/mpeg'
    });
    file.pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': 'audio/mpeg'
    });
    fs.createReadStream(filePath).pipe(res);
  }
});

// Serve client build optionally (if you build client into ../client/dist)
// app.use(express.static(path.join(__dirname, '../client/dist')));

app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
