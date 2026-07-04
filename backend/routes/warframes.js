import express from 'express';
import { readFile, readdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const router = express.Router();
const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '../data/warframes');

// GET /api/warframes — resumen de todos los warframes
router.get('/', async (req, res) => {
  try {
    const files = await readdir(DATA_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    const warframes = await Promise.all(
      jsonFiles.map(async (file) => {
        const raw = await readFile(join(DATA_DIR, file), 'utf-8');
        const data = JSON.parse(raw);
        return {
          id:         data.id,
          nombre:     data.nombre,
          rol:        data.rol,
          progenitor: data.info.progenitor,
          tienePrime: data.tienePrime,
          imagen:     data.imagenes.perfil,
          imagenPrime: data.imagenes.prime || ''
        };
      })
    );

    // Filtrar JSONs vacíos (sin nombre) y ordenar alfabéticamente
    const completos = warframes.filter(w => w.nombre && w.nombre.trim() !== '');
    completos.sort((a, b) => a.nombre.localeCompare(b.nombre));
    res.json(completos);

  } catch (err) {
    console.error('Error leyendo warframes:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// GET /api/warframes/:nombre — detalle completo
router.get('/:nombre', async (req, res) => {
  const { nombre } = req.params;
  const filePath = join(DATA_DIR, `${nombre.toLowerCase()}.json`);

  try {
    const raw = await readFile(filePath, 'utf-8');
    const data = JSON.parse(raw);
    res.json(data);
  } catch (err) {
    res.status(404).json({ error: `Warframe "${nombre}" no encontrado` });
  }
});

export default router;