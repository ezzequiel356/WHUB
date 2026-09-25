import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, act } from '@testing-library/react';
import { renderWithProviders } from '../../test/test-utils';
import NavUserSearch from '../NavUserSearch';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

beforeEach(() => {
  mockNavigate.mockClear();
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

// Con fake timers activos, el propio polling interno de findBy*/waitFor
// (basado en setTimeout) también queda congelado. Por eso el avance del
// debounce se envuelve en act() -para que React aplique el nuevo estado de
// forma síncrona- y las aserciones posteriores usan getBy* en vez de findBy*.
async function avanzarDebounce(ms = 300) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

describe('NavUserSearch', () => {
  it('no busca con menos de 3 caracteres', () => {
    vi.useFakeTimers();
    renderWithProviders(<NavUserSearch />);

    fireEvent.change(screen.getByPlaceholderText('Buscar usuario...'), { target: { value: 'an' } });
    vi.advanceTimersByTime(500);

    expect(fetch).not.toHaveBeenCalled();
  });

  it('busca con debounce de 300ms a partir de 3 caracteres y muestra resultados', async () => {
    vi.useFakeTimers();
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ id_usuario: 1, username: 'ana', nombre: 'Ana', apellido: 'Gomez' }]),
    });
    renderWithProviders(<NavUserSearch />);

    fireEvent.change(screen.getByPlaceholderText('Buscar usuario...'), { target: { value: 'ana' } });
    expect(fetch).not.toHaveBeenCalled(); // todavía no pasaron los 300ms

    await avanzarDebounce();

    expect(fetch).toHaveBeenCalledWith('/api/usuarios/buscar?q=ana');
    expect(screen.getByText('@ana')).toBeInTheDocument();
  });

  it('clickear un resultado navega al perfil y limpia la búsqueda', async () => {
    vi.useFakeTimers();
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ id_usuario: 1, username: 'ana', nombre: 'Ana', apellido: 'Gomez' }]),
    });
    renderWithProviders(<NavUserSearch />);

    fireEvent.change(screen.getByPlaceholderText('Buscar usuario...'), { target: { value: 'ana' } });
    await avanzarDebounce();
    fireEvent.click(screen.getByText('@ana'));

    expect(mockNavigate).toHaveBeenCalledWith('/perfil/ana');
    expect(screen.getByPlaceholderText('Buscar usuario...')).toHaveValue('');
  });

  it('cierra el dropdown al hacer click afuera', async () => {
    vi.useFakeTimers();
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ id_usuario: 1, username: 'ana', nombre: 'Ana', apellido: 'Gomez' }]),
    });
    renderWithProviders(<NavUserSearch />);

    fireEvent.change(screen.getByPlaceholderText('Buscar usuario...'), { target: { value: 'ana' } });
    await avanzarDebounce();
    expect(screen.getByText('@ana')).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    expect(screen.queryByText('@ana')).not.toBeInTheDocument();
  });
});
