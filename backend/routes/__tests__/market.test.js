import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import fetch from 'node-fetch';
import marketRouter from '../market.js';

vi.mock('node-fetch', () => ({ default: vi.fn() }));

function buildApp() {
  const app = express();
  app.use('/api/market', marketRouter);
  return app;
}

function fakeResponse(ok, body) {
  return { ok, json: () => Promise.resolve(body) };
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('GET /api/market/:item', () => {
  it('prioriza al vendedor ingame por sobre otros estados', async () => {
    fetch.mockResolvedValue(fakeResponse(true, {
      data: {
        sell: [
          { platinum: 20, user: { ingameName: 'Ausente', status: 'offline' } },
          { platinum: 25, user: { ingameName: 'Jugando', status: 'ingame' } }
        ]
      }
    }));

    const res = await request(buildApp()).get('/api/market/wisp_prime_set');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ precio: 25, vendedor: 'Jugando', estado: 'ingame' });
  });

  it('si nadie está ingame, toma la primera oferta disponible', async () => {
    fetch.mockResolvedValue(fakeResponse(true, {
      data: {
        sell: [{ platinum: 20, user: { ingameName: 'Ausente', status: 'offline' } }]
      }
    }));

    const res = await request(buildApp()).get('/api/market/wisp_prime_set');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ precio: 20, vendedor: 'Ausente', estado: 'offline' });
  });

  it('devuelve precio y vendedor null si warframe.market responde con error', async () => {
    fetch.mockResolvedValue(fakeResponse(false, {}));

    const res = await request(buildApp()).get('/api/market/item_inexistente');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ precio: null, vendedor: null });
  });

  it('devuelve precio y vendedor null si no hay ventas activas', async () => {
    fetch.mockResolvedValue(fakeResponse(true, { data: { sell: [] } }));

    const res = await request(buildApp()).get('/api/market/item_sin_ventas');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ precio: null, vendedor: null });
  });

  it('devuelve 500 si falla la consulta a warframe.market', async () => {
    fetch.mockRejectedValue(new Error('network error'));

    const res = await request(buildApp()).get('/api/market/wisp_prime_set');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Error interno al consultar warframe.market' });
  });
});
