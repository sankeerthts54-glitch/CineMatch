import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import recommendHandler from './api/recommend.js';
import autocompleteHandler from './api/autocomplete.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 7860;

app.use(cors());
app.use(express.json());

// Mount the serverless API router
app.get('/api/autocomplete', (req, res) => autocompleteHandler(req, res));
app.post('/api/recommend', (req, res) => recommendHandler(req, res));

// Serve frontend in production (for local testing without Vercel CLI)
app.use(express.static(path.join(__dirname, 'dist')));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Local Development Server running on port ${PORT}`);
});
