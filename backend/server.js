import express from 'express';
import cors from 'cors';
import path from 'path';
import warframesRouter from './routes/warframes.js';
import marketRouter from './routes/market.js';
import authRouter from './routes/auth.js';
import favoritosRouter from './routes/favoritos.js';
import uploadsRouter from './routes/uploads.js';
import historialRouter from './routes/historial.js';

const app = express();
const PORT = 3001;

app.use(cors({
  origin: 'http://localhost:5173'
}));

app.use(express.json());
// process.cwd() en vez de __dirname vía import.meta.url: al empaquetar el
// backend con esbuild (bundle a CommonJS para poder compilarlo con
// bytenode), import.meta.url queda vacío. El server siempre se arranca
// desde la raíz de backend/ (local con "node server.js", y en Docker con
// WORKDIR /app), así que process.cwd() apunta al mismo lugar en los dos casos.
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/warframes', warframesRouter);
app.use('/api/market', marketRouter);
app.use('/api/favoritos', favoritosRouter);
app.use('/api/uploads', uploadsRouter);
app.use('/api/historial', historialRouter);
app.use('/api', authRouter);

app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});