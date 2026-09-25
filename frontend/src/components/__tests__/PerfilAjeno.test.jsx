import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test/test-utils';
import PerfilAjeno from '../PerfilAjeno';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

const PERFIL_WISP = {
  id_usuario: 5, nombre: 'Wisp', apellido: 'User', username: 'wisp-user',
  descripcion: '', avatar: '', banner: '',
};

beforeEach(() => {
  mockNavigate.mockClear();
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('PerfilAjeno', () => {
  it('muestra los datos del usuario si existe', async () => {
    fetch.mockImplementation((url) => {
      if (url === '/api/usuarios/wisp-user') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(PERFIL_WISP) });
      }
      if (url === '/api/favoritos/5') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    renderWithProviders(<PerfilAjeno />, { route: '/perfil/wisp-user', path: '/perfil/:username' });

    expect(screen.getByText('Cargando perfil...')).toBeInTheDocument();
    expect(await screen.findByText('@wisp-user')).toBeInTheDocument();
    expect(screen.getByText('Este usuario no tiene favoritos todavía.')).toBeInTheDocument();
  });

  it('muestra "Usuario no encontrado." si la API devuelve error', async () => {
    fetch.mockResolvedValue({ ok: false, json: () => Promise.resolve({ error: 'no existe' }) });

    renderWithProviders(<PerfilAjeno />, { route: '/perfil/no-existe', path: '/perfil/:username' });

    expect(await screen.findByText('Usuario no encontrado.')).toBeInTheDocument();
  });

  it('muestra los favoritos del usuario cuando tiene', async () => {
    fetch.mockImplementation((url) => {
      if (url === '/api/usuarios/wisp-user') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(PERFIL_WISP) });
      }
      if (url === '/api/favoritos/5') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([{ warframe_nombre: 'Ash' }]) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    renderWithProviders(<PerfilAjeno />, { route: '/perfil/wisp-user', path: '/perfil/:username' });

    expect(await screen.findByText('Ash')).toBeInTheDocument();
  });
});
