import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import pool from '../../db.js';
import favoritosRouter from '../favoritos.js';

vi.mock('../../db.js', () => ({ default: { query: vi.fn() } }));

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/favoritos', favoritosRouter);
  return app;
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('GET /api/favoritos/:id_usuario', () => {
  it('devuelve 200 con la lista de favoritos del usuario', async () => {
    pool.query.mockResolvedValue([[[{ warframe_nombre: 'Wisp' }, { warframe_nombre: 'Ash' }]]]);

    const res = await request(buildApp()).get('/api/favoritos/1');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ warframe_nombre: 'Wisp' }, { warframe_nombre: 'Ash' }]);
  });

  it('devuelve 500 si falla sp_obtener_favoritos', async () => {
    pool.query.mockRejectedValue(new Error('db error'));

    const res = await request(buildApp()).get('/api/favoritos/1');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Error al obtener favoritos.' });
  });
});

describe('POST /api/favoritos', () => {
  it('devuelve 200 ok:true al agregar un favorito', async () => {
    pool.query.mockResolvedValue([{}]);

    const res = await request(buildApp())
      .post('/api/favoritos')
      .send({ id_usuario: 1, warframe_nombre: 'Wisp' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(pool.query).toHaveBeenCalledWith('CALL sp_agregar_favorito(?, ?)', [1, 'Wisp']);
  });

  it('devuelve 400 si sp_agregar_favorito falla (ej: ya estaba en favoritos)', async () => {
    pool.query.mockRejectedValue(new Error('duplicate'));

    const res = await request(buildApp())
      .post('/api/favoritos')
      .send({ id_usuario: 1, warframe_nombre: 'Wisp' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Error al agregar favorito.' });
  });
});

describe('DELETE /api/favoritos', () => {
  it('devuelve 200 ok:true al eliminar un favorito', async () => {
    pool.query.mockResolvedValue([{}]);

    const res = await request(buildApp())
      .delete('/api/favoritos')
      .send({ id_usuario: 1, warframe_nombre: 'Wisp' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('devuelve 400 si sp_eliminar_favorito falla', async () => {
    pool.query.mockRejectedValue(new Error('no existe'));

    const res = await request(buildApp())
      .delete('/api/favoritos')
      .send({ id_usuario: 1, warframe_nombre: 'Wisp' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Error al eliminar favorito.' });
  });
});
