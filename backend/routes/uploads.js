import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../db.js';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const makeStorage = (carpeta) => multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, `../uploads/${carpeta}`));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${carpeta}_${req.body.id_usuario}_${Date.now()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) return cb(new Error('Solo se permiten imágenes.'));
  cb(null, true);
};

const uploadAvatar = multer({ storage: makeStorage('avatars'), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter });
const uploadBanner = multer({ storage: makeStorage('banners'), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter });

// POST /api/uploads/avatar
router.post('/avatar', uploadAvatar.single('imagen'), async (req, res) => {
  const { id_usuario } = req.body;
  const url = `/uploads/avatars/${req.file.filename}`;
  try {
    await pool.query('CALL sp_cambiar_avatar(?, ?)', [id_usuario, url]);
    res.json({ ok: true, url });
  } catch (err) {
    console.error('Error guardando avatar:', err);
    res.status(500).json({ error: 'Error al guardar el avatar.' });
  }
});

// POST /api/uploads/banner
router.post('/banner', uploadBanner.single('imagen'), async (req, res) => {
  const { id_usuario } = req.body;
  const url = `/uploads/banners/${req.file.filename}`;
  try {
    await pool.query('CALL sp_cambiar_banner(?, ?)', [id_usuario, url]);
    res.json({ ok: true, url });
  } catch (err) {
    console.error('Error guardando banner:', err);
    res.status(500).json({ error: 'Error al guardar el banner.' });
  }
});

export default router;
