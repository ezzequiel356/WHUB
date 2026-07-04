import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET /api/favoritos/:id_usuario
router.get('/:id_usuario', async (req, res) => {
  const { id_usuario } = req.params;
  try {
    const [rows] = await pool.query('CALL sp_obtener_favoritos(?)', [id_usuario]);
    res.json(rows[0]);
  } catch (err) {
    console.error('Error obteniendo favoritos:', err);
    res.status(500).json({ error: 'Error al obtener favoritos.' });
  }
});

// POST /api/favoritos
router.post('/', async (req, res) => {
  const { id_usuario, warframe_nombre } = req.body;
  try {
    await pool.query('CALL sp_agregar_favorito(?, ?)', [id_usuario, warframe_nombre]);
    res.json({ ok: true });
  } catch (err) {
    console.error('Error agregando favorito:', err);
    res.status(400).json({ error: 'Error al agregar favorito.' });
  }
});

// DELETE /api/favoritos
router.delete('/', async (req, res) => {
  const { id_usuario, warframe_nombre } = req.body;
  try {
    await pool.query('CALL sp_eliminar_favorito(?, ?)', [id_usuario, warframe_nombre]);
    res.json({ ok: true });
  } catch (err) {
    console.error('Error eliminando favorito:', err);
    res.status(400).json({ error: 'Error al eliminar favorito.' });
  }
});

export default router;
