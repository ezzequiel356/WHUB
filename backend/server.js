import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import warframesRouter from './routes/warframes.js';
import marketRouter from './routes/market.js';
import authRouter from './routes/auth.js';
import favoritosRouter from './routes/favoritos.js';
import uploadsRouter from './routes/uploads.js';
import historialRouter from './routes/historial.js';

const app = express();
const PORT = 3001;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors({
  origin: 'http://localhost:5173'
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/warframes', warframesRouter);
app.use('/api/market', marketRouter);
app.use('/api/favoritos', favoritosRouter);
app.use('/api/uploads', uploadsRouter);
app.use('/api/historial', historialRouter);
app.use('/api', authRouter);

app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});