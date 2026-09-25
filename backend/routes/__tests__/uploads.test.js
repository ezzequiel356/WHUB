import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import path from 'path';
import { fileURLToPath } from 'url';
import { mkdir, readdir, unlink } from 'fs/promises';
import pool from '../../db.js';
import uploadsRouter from '../uploads.js';

vi.mock('../../db.js', () => ({ default: { query: vi.fn() } }));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

// PNG de 1x1 válido: multer/el fileFilter solo miran el mimetype declarado
// por el cliente, no el contenido, así que un buffer mínimo alcanza.
const PNG_BUFFER = Buffer.from(
  '89504e470d0a1a0a0000000d49484452000000010000000108020000009077' +
  '3de40000000a49444154789c6300010000050001a5f645400000000049454e' +
  '44ae426082',
  'hex'
);

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/uploads', uploadsRouter);
  return app;
}

// Multer escribe en la carpeta real backend/uploads/<carpeta>. Como el
// nombre de archivo incluye Date.now(), no lo conocemos de antemano: en vez
// de rastrear cada archivo creado, barremos las carpetas de test buscando
// por prefijo (id_usuario de prueba) y borramos lo que haya quedado.
const TEST_USER_IDS = ['42', '7'];

async function limpiarArchivosDeTest() {
  for (const carpeta of ['avatars', 'banners']) {
    const dir = path.join(UPLOADS_DIR, carpeta);
    const archivos = await readdir(dir).catch(() => []);
    const propios = archivos.filter((f) =>
      TEST_USER_IDS.some((id) => f.startsWith(`${carpeta}_${id}_`))
    );
    await Promise.all(propios.map((f) => unlink(path.join(dir, f)).catch(() => {})));
  }
}

// backend/uploads/ está en .gitignore (los archivos subidos no son código),
// así que en un checkout nuevo (como el workspace de Jenkins) esas carpetas
// no existen todavía. Multer no las crea solo, hay que asegurarlas acá.
beforeAll(async () => {
  await mkdir(path.join(UPLOADS_DIR, 'avatars'), { recursive: true });
  await mkdir(path.join(UPLOADS_DIR, 'banners'), { recursive: true });
});

beforeEach(() => {
  vi.resetAllMocks();
});

afterEach(limpiarArchivosDeTest);

describe('POST /api/uploads/avatar', () => {
  it('guarda la imagen en disco y actualiza el avatar del usuario', async () => {
    pool.query.mockResolvedValue([{}]);

    const res = await request(buildApp())
      .post('/api/uploads/avatar')
      .field('id_usuario', '42')
      .attach('imagen', PNG_BUFFER, { filename: 'avatar.png', contentType: 'image/png' });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.url).toMatch(/^\/uploads\/avatars\/avatars_42_\d+\.png$/);
    expect(pool.query).toHaveBeenCalledWith('CALL sp_cambiar_avatar(?, ?)', ['42', res.body.url]);
  });

  it('devuelve 400 si no se adjunta ningún archivo', async () => {
    const res = await request(buildApp())
      .post('/api/uploads/avatar')
      .field('id_usuario', '42');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'No se recibió ninguna imagen.' });
    expect(pool.query).not.toHaveBeenCalled();
  });

  it('rechaza archivos que no son imágenes', async () => {
    const res = await request(buildApp())
      .post('/api/uploads/avatar')
      .field('id_usuario', '42')
      .attach('imagen', Buffer.from('no soy una imagen'), { filename: 'archivo.txt', contentType: 'text/plain' });

    // El fileFilter de multer corta la subida con un error, pero uploads.js
    // no tiene un middleware de manejo de errores propio: el error cae en
    // el handler por defecto de Express (500 genérico, sin JSON estructurado).
    // Ver nota aparte sobre este hallazgo.
    expect(res.status).toBe(500);
  });

  it('devuelve 500 si sp_cambiar_avatar falla', async () => {
    pool.query.mockRejectedValue(new Error('db error'));

    const res = await request(buildApp())
      .post('/api/uploads/avatar')
      .field('id_usuario', '42')
      .attach('imagen', PNG_BUFFER, { filename: 'avatar.png', contentType: 'image/png' });

    // Este archivo sí se llega a escribir en disco (multer corre antes del
    // pool.query que falla); lo limpia limpiarArchivosDeTest() en afterEach.
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Error al guardar el avatar.' });
  });
});

describe('POST /api/uploads/banner', () => {
  it('guarda la imagen en disco y actualiza el banner del usuario', async () => {
    pool.query.mockResolvedValue([{}]);

    const res = await request(buildApp())
      .post('/api/uploads/banner')
      .field('id_usuario', '7')
      .attach('imagen', PNG_BUFFER, { filename: 'banner.png', contentType: 'image/png' });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.url).toMatch(/^\/uploads\/banners\/banners_7_\d+\.png$/);
  });

  it('devuelve 400 si no se adjunta ningún archivo', async () => {
    const res = await request(buildApp())
      .post('/api/uploads/banner')
      .field('id_usuario', '7');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'No se recibió ninguna imagen.' });
    expect(pool.query).not.toHaveBeenCalled();
  });
});
