import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test/test-utils';
import Catalogo from '../Catalogo';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

const WARFRAMES = [
  { id: 'wisp', nombre: 'Wisp', rol: ['Soporte'], progenitor: 'Calor', tienePrime: true, imagen: '/wisp.png', imagenPrime: '/wisp-prime.png' },
  { id: 'ash', nombre: 'Ash', rol: ['Sigilo'], progenitor: 'Radiación', tienePrime: false, imagen: '/ash.png', imagenPrime: '' },
];

function mockFetchImpl({ warframesOk = true, warframes = WARFRAMES, favoritos = [] } = {}) {
  fetch.mockImplementation((url) => {
    if (url === '/api/warframes') {
      if (!warframesOk) return Promise.reject(new Error('network error'));
      return Promise.resolve({ ok: true, json: () => Promise.resolve(warframes) });
    }
    if (url.startsWith('/api/favoritos/')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(favoritos) });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) });
  });
}

beforeEach(() => {
  mockNavigate.mockClear();
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Catalogo', () => {
  it('muestra "Cargando..." y luego el listado de warframes', async () => {
    mockFetchImpl();
    renderWithProviders(<Catalogo />, { route: '/catalogo' });

    expect(screen.getByText('Cargando warframes...')).toBeInTheDocument();
    expect(await screen.findByText('WISP')).toBeInTheDocument();
    expect(screen.getByText('ASH')).toBeInTheDocument();
  });

  it('si falla la carga de warframes no se cuelga: corta el loading y muestra el estado vacío', async () => {
    mockFetchImpl({ warframesOk: false });
    renderWithProviders(<Catalogo />, { route: '/catalogo' });

    expect(await screen.findByText('No se encontraron warframes')).toBeInTheDocument();
  });

  it('con usuario logueado, pide y marca los favoritos existentes', async () => {
    mockFetchImpl({ favoritos: [{ warframe_nombre: 'Wisp' }] });
    renderWithProviders(<Catalogo />, {
      route: '/catalogo',
      user: { id_usuario: 1, username: 'gauss' },
    });

    await screen.findByText('WISP');
    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/favoritos/1'));
    expect(screen.getByTitle('Quitar de favoritos')).toBeInTheDocument();
    expect(screen.getByTitle('Agregar a favoritos')).toBeInTheDocument();
  });

  it('sin sesión, clickear el corazón abre el popup de login en vez de llamar a la API', async () => {
    mockFetchImpl();
    renderWithProviders(<Catalogo />, { route: '/catalogo' });

    await screen.findByText('WISP');
    const llamadasAntes = fetch.mock.calls.length;
    fireEvent.click(screen.getAllByTitle('Agregar a favoritos')[0]);

    expect(await screen.findByText('Inicia sesión para usar esta función')).toBeInTheDocument();
    expect(fetch.mock.calls.length).toBe(llamadasAntes);
  });

  it('el buscador filtra la lista localmente sin llamar a la API', async () => {
    mockFetchImpl();
    renderWithProviders(<Catalogo />, { route: '/catalogo' });

    await screen.findByText('WISP');
    const llamadasAntes = fetch.mock.calls.length;
    fireEvent.change(screen.getByPlaceholderText('Buscar warframe...'), { target: { value: 'wisp' } });

    expect(screen.getByText('WISP')).toBeInTheDocument();
    expect(screen.queryByText('ASH')).not.toBeInTheDocument();
    expect(fetch.mock.calls.length).toBe(llamadasAntes);
  });
});
