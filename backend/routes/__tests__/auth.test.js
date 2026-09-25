import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import pool from '../../db.js';
import authRouter from '../auth.js';

vi.mock('../../db.js', () => ({ default: { query: vi.fn() } }));

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api', authRouter);
  return app;
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('POST /api/login', () => {
  it('devuelve 200 con el usuario si sp_login encuentra credenciales válidas', async () => {
    pool.query.mockResolvedValue([[[{ id_usuario: 1, username: 'gauss' }]]]);

    const res = await request(buildApp())
      .post('/api/login')
      .send({ username: 'gauss', contraseña: '1234' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ usuario: { id_usuario: 1, username: 'gauss' } });
  });

  it('devuelve 401 si sp_login no encuentra ningún usuario', async () => {
    pool.query.mockResolvedValue([[[]]]);

    const res = await request(buildApp())
      .post('/api/login')
      .send({ username: 'gauss', contraseña: 'mala' });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Usuario o contraseña incorrectos.' });
  });

  it('devuelve 401 (no 500) si la consulta a la base de datos falla', async () => {
    pool.query.mockRejectedValue(new Error('connection refused'));

    const res = await request(buildApp())
      .post('/api/login')
      .send({ username: 'gauss', contraseña: '1234' });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Usuario o contraseña incorrectos.' });
  });
});

describe('POST /api/register', () => {
  it('devuelve 200 ok:true si el registro es exitoso', async () => {
    pool.query.mockResolvedValue([{}]);

    const res = await request(buildApp())
      .post('/api/register')
      .send({ nombre: 'Ana', apellido: 'Gomez', username: 'ana', email: 'ana@mail.com', contraseña: '1234' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('devuelve 400 con mensaje de username duplicado', async () => {
    pool.query.mockRejectedValue(new Error("Duplicate entry 'ana' for key 'username'"));

    const res = await request(buildApp())
      .post('/api/register')
      .send({ username: 'ana' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Ese username ya está en uso.' });
  });

  it('devuelve 400 con mensaje de email duplicado', async () => {
    pool.query.mockRejectedValue(new Error("Duplicate entry 'ana@mail.com' for key 'email'"));

    const res = await request(buildApp())
      .post('/api/register')
      .send({ email: 'ana@mail.com' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Ese email ya está registrado.' });
  });
});

describe('POST /api/perfil/contrasena', () => {
  it('devuelve 400 con mensaje específico si la contraseña actual es incorrecta', async () => {
    pool.query.mockRejectedValue(new Error('La contraseña actual es incorrecta.'));

    const res = await request(buildApp())
      .post('/api/perfil/contrasena')
      .send({ id_usuario: 1, contrasena_actual: 'mala', contrasena_nueva: 'nueva' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'La contraseña actual es incorrecta.' });
  });

  it('devuelve 200 ok:true si el cambio es exitoso', async () => {
    pool.query.mockResolvedValue([{}]);

    const res = await request(buildApp())
      .post('/api/perfil/contrasena')
      .send({ id_usuario: 1, contrasena_actual: 'buena', contrasena_nueva: 'nueva' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});

describe('GET /api/usuarios/buscar', () => {
  it('devuelve [] sin consultar la base si el término tiene menos de 3 caracteres', async () => {
    const res = await request(buildApp()).get('/api/usuarios/buscar?q=an');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it('devuelve los resultados de sp_buscar_usuario con 3+ caracteres', async () => {
    pool.query.mockResolvedValue([[[{ username: 'ana' }, { username: 'anabel' }]]]);

    const res = await request(buildApp()).get('/api/usuarios/buscar?q=ana');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ username: 'ana' }, { username: 'anabel' }]);
  });

  it('devuelve 500 si falla la búsqueda', async () => {
    pool.query.mockRejectedValue(new Error('db error'));

    const res = await request(buildApp()).get('/api/usuarios/buscar?q=ana');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Error al buscar usuarios.' });
  });
});

describe('GET /api/usuarios/:username', () => {
  it('devuelve 200 con los datos del usuario si existe', async () => {
    pool.query.mockResolvedValue([[{ id_usuario: 1, username: 'gauss' }]]);

    const res = await request(buildApp()).get('/api/usuarios/gauss');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id_usuario: 1, username: 'gauss' });
  });

  it('devuelve 404 si el usuario no existe', async () => {
    pool.query.mockResolvedValue([[]]);

    const res = await request(buildApp()).get('/api/usuarios/no-existe');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Usuario no encontrado.' });
  });
});
