import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET /api/historial/:id_usuario
router.get('/:id_usuario', async (req, res) => {
  const { id_usuario } = req.params;
  try {
    const [rows] = await pool.query('CALL sp_obtener_compras(?)', [id_usuario]);
    res.json(rows[0]);
  } catch (err) {
    console.error('Error obteniendo historial:', err);
    res.status(500).json({ error: 'Error al obtener historial.' });
  }
});

// POST /api/historial
router.post('/', async (req, res) => {
  const { id_usuario, item_nombre, item_url_nombre, vendedor, precio_platinum, estado_vendedor } = req.body;
  try {
    const [rows] = await pool.query(
      'CALL sp_guardar_compra(?, ?, ?, ?, ?, ?)',
      [id_usuario, item_nombre, item_url_nombre, vendedor, precio_platinum, estado_vendedor]
    );
    res.json({ ok: true, id_compra: rows[0][0].id_compra });
  } catch (err) {
    console.error('Error guardando compra:', err);
    res.status(500).json({ error: 'Error al guardar compra.' });
  }
});

// DELETE /api/historial
router.delete('/', async (req, res) => {
  const { id_compra, id_usuario } = req.body;
  try {
    await pool.query('CALL sp_eliminar_compra(?, ?)', [id_compra, id_usuario]);
    res.json({ ok: true });
  } catch (err) {
    console.error('Error eliminando compra:', err);
    res.status(500).json({ error: 'Error al eliminar compra.' });
  }
});

export default router;
