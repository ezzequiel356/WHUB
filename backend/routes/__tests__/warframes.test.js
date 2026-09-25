import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import { readFile, readdir } from 'fs/promises';
import warframesRouter from '../warframes.js';

vi.mock('fs/promises');

function buildApp() {
  const app = express();
  app.use('/api/warframes', warframesRouter);
  return app;
}

const wisp = {
  id: 'wisp', nombre: 'Wisp', rol: ['Soporte'],
  tienePrime: true,
  imagenes: { perfil: '/wisp.png', prime: '/wisp-prime.png' },
  info: { progenitor: '' }
};

const vacio = { id: 'vacio', nombre: '', rol: [], tienePrime: false, imagenes: {}, info: {} };

const ash = {
  id: 'ash', nombre: 'Ash', rol: ['Sigilo'],
  tienePrime: true,
  imagenes: { perfil: '/ash.png', prime: '/ash-prime.png' },
  info: { progenitor: '' }
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe('GET /api/warframes', () => {
  it('devuelve 200 con el resumen de cada warframe, ordenado alfabéticamente', async () => {
    readdir.mockResolvedValue(['wisp.json', 'ash.json']);
    readFile.mockImplementation((path) => {
      if (path.includes('wisp')) return Promise.resolve(JSON.stringify(wisp));
      if (path.includes('ash')) return Promise.resolve(JSON.stringify(ash));
    });

    const res = await request(buildApp()).get('/api/warframes');

    expect(res.status).toBe(200);
    expect(res.body.map(w => w.nombre)).toEqual(['Ash', 'Wisp']);
  });

  it('filtra los JSON sin nombre (fichas vacías/incompletas)', async () => {
    readdir.mockResolvedValue(['wisp.json', 'vacio.json']);
    readFile.mockImplementation((path) => {
      if (path.includes('wisp')) return Promise.resolve(JSON.stringify(wisp));
      if (path.includes('vacio')) return Promise.resolve(JSON.stringify(vacio));
    });

    const res = await request(buildApp()).get('/api/warframes');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].nombre).toBe('Wisp');
  });

  it('ignora archivos que no son .json en la carpeta de datos', async () => {
    readdir.mockResolvedValue(['wisp.json', 'README.md']);
    readFile.mockResolvedValue(JSON.stringify(wisp));

    const res = await request(buildApp()).get('/api/warframes');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('devuelve 500 si falla la lectura del directorio', async () => {
    readdir.mockRejectedValue(new Error('disco no disponible'));

    const res = await request(buildApp()).get('/api/warframes');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Error interno' });
  });
});

describe('GET /api/warframes/:nombre', () => {
  it('devuelve 200 con la ficha completa si el warframe existe', async () => {
    readFile.mockResolvedValue(JSON.stringify(wisp));

    const res = await request(buildApp()).get('/api/warframes/wisp');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(wisp);
  });

  it('devuelve 404 con mensaje claro si el warframe no existe', async () => {
    readFile.mockRejectedValue(new Error('ENOENT'));

    const res = await request(buildApp()).get('/api/warframes/inexistente');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Warframe "inexistente" no encontrado' });
  });
});
