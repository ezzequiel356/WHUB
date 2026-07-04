import express from 'express';
import pool from '../db.js';

const router = express.Router();

// POST /api/login
router.post('/login', async (req, res) => {
  const { username, contraseña } = req.body;
  try {
    const [rows] = await pool.query('CALL sp_login(?, ?)', [username, contraseña]);
    const usuario = rows[0][0];
    if (!usuario) return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
    res.json({ usuario });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
  }
});

// POST /api/register
router.post('/register', async (req, res) => {
  const { nombre, apellido, username, email, contraseña } = req.body;
  try {
    await pool.query('CALL sp_registrar_usuario(?, ?, ?, ?, ?)', [nombre, apellido, username, email, contraseña]);
    res.json({ ok: true });
  } catch (err) {
    console.error('Error en registro:', err);
    const msg = err.message?.includes('username') ? 'Ese username ya está en uso.'
              : err.message?.includes('email')    ? 'Ese email ya está registrado.'
              : 'Error al registrarse.';
    res.status(400).json({ error: msg });
  }
});

// POST /api/perfil/username
router.post('/perfil/username', async (req, res) => {
  const { id_usuario, username } = req.body;
  try {
    await pool.query('CALL sp_cambiar_username(?, ?)', [id_usuario, username]);
    res.json({ ok: true });
  } catch (err) {
    const msg = err.message?.includes('ya está en uso') ? 'Ese username ya está en uso.' : 'Error al cambiar el username.';
    res.status(400).json({ error: msg });
  }
});

// POST /api/perfil/nombre
router.post('/perfil/nombre', async (req, res) => {
  const { id_usuario, nombre } = req.body;
  try {
    await pool.query('CALL sp_cambiar_nombre(?, ?)', [id_usuario, nombre]);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: 'Error al cambiar el nombre.' });
  }
});

// POST /api/perfil/apellido
router.post('/perfil/apellido', async (req, res) => {
  const { id_usuario, apellido } = req.body;
  try {
    await pool.query('CALL sp_cambiar_apellido(?, ?)', [id_usuario, apellido]);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: 'Error al cambiar el apellido.' });
  }
});

// POST /api/perfil/email
router.post('/perfil/email', async (req, res) => {
  const { id_usuario, email } = req.body;
  try {
    await pool.query('CALL sp_cambiar_email(?, ?)', [id_usuario, email]);
    res.json({ ok: true });
  } catch (err) {
    const msg = err.message?.includes('ya está en uso') ? 'Ese email ya está en uso.' : 'Error al cambiar el email.';
    res.status(400).json({ error: msg });
  }
});

// POST /api/perfil/descripcion
router.post('/perfil/descripcion', async (req, res) => {
  const { id_usuario, descripcion } = req.body;
  try {
    await pool.query('CALL sp_cambiar_descripcion(?, ?)', [id_usuario, descripcion]);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: 'Error al cambiar la descripción.' });
  }
});

// POST /api/perfil/contrasena
router.post('/perfil/contrasena', async (req, res) => {
  const { id_usuario, contrasena_actual, contrasena_nueva } = req.body;
  try {
    await pool.query('CALL sp_cambiar_contraseña(?, ?, ?)', [id_usuario, contrasena_actual, contrasena_nueva]);
    res.json({ ok: true });
  } catch (err) {
    const msg = err.message?.includes('incorrecta') ? 'La contraseña actual es incorrecta.' : 'Error al cambiar la contraseña.';
    res.status(400).json({ error: msg });
  }
});

// GET /api/usuarios/buscar?q=...
router.get('/usuarios/buscar', async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 3) return res.json([]);
  try {
    const [rows] = await pool.query('CALL sp_buscar_usuario(?)', [q]);
    res.json(rows[0]);
  } catch (err) {
    console.error('Error buscando usuario:', err);
    res.status(500).json({ error: 'Error al buscar usuarios.' });
  }
});

// GET /api/usuarios/:username
router.get('/usuarios/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT u.id_usuario, u.nombre, u.apellido, u.username, p.avatar, p.banner, p.descripcion FROM usuarios u INNER JOIN perfil p ON u.perfil_id_perfil = p.id_perfil WHERE u.username = ?',
      [username]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Usuario no encontrado.' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error obteniendo usuario:', err);
    res.status(500).json({ error: 'Error al obtener el usuario.' });
  }
});

export default router;
