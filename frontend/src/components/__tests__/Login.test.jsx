import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fireEvent, within, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test/test-utils';
import Login from '../Login';

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
});

// Login y Register están SIEMPRE los dos en el DOM (el panel "activo" es
// solo un tema visual con CSS), así que hay que escopear las queries a un
// panel puntual para no chocar con placeholders/botones duplicados.
function getLoginPanel(container) {
  return within(container.querySelector('.wf-panel--login'));
}

function getRegisterPanel(container) {
  return within(container.querySelector('.wf-panel--register'));
}

describe('Login - inicio de sesión', () => {
  it('no llama a la API si los campos están vacíos', async () => {
    const { container } = renderWithProviders(<Login />, { route: '/login' });
    const panel = getLoginPanel(container);

    fireEvent.click(panel.getByRole('button', { name: /acceder/i }));

    expect(await panel.findByText('Completá todos los campos.')).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('muestra el error del backend si las credenciales son incorrectas', async () => {
    fetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Usuario o contraseña incorrectos.' }),
    });
    const { container } = renderWithProviders(<Login />, { route: '/login' });
    const panel = getLoginPanel(container);

    fireEvent.change(panel.getByPlaceholderText('tu_username'), { target: { value: 'gauss' } });
    fireEvent.change(panel.getByPlaceholderText('••••••••'), { target: { value: 'mala' } });
    fireEvent.click(panel.getByRole('button', { name: /acceder/i }));

    expect(await panel.findByText('Usuario o contraseña incorrectos.')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('loguea y navega si las credenciales son correctas', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ usuario: { id_usuario: 1, username: 'gauss' } }),
    });
    const { container } = renderWithProviders(<Login />, { route: '/login' });
    const panel = getLoginPanel(container);

    fireEvent.change(panel.getByPlaceholderText('tu_username'), { target: { value: 'gauss' } });
    fireEvent.change(panel.getByPlaceholderText('••••••••'), { target: { value: '1234' } });
    fireEvent.click(panel.getByRole('button', { name: /acceder/i }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true }));
    expect(JSON.parse(localStorage.getItem('wf_user'))).toEqual({ id_usuario: 1, username: 'gauss' });
  });

  it('muestra error de conexión si el fetch falla', async () => {
    fetch.mockRejectedValue(new Error('network error'));
    const { container } = renderWithProviders(<Login />, { route: '/login' });
    const panel = getLoginPanel(container);

    fireEvent.change(panel.getByPlaceholderText('tu_username'), { target: { value: 'gauss' } });
    fireEvent.change(panel.getByPlaceholderText('••••••••'), { target: { value: '1234' } });
    fireEvent.click(panel.getByRole('button', { name: /acceder/i }));

    expect(await panel.findByText('No se pudo conectar con el servidor.')).toBeInTheDocument();
  });
});

describe('Login - registro', () => {
  it('no llama a la API si falta algún campo', async () => {
    const { container } = renderWithProviders(<Login />, { route: '/registro' });
    const panel = getRegisterPanel(container);

    fireEvent.change(panel.getByPlaceholderText('tu_username'), { target: { value: 'ana' } });
    fireEvent.click(panel.getByRole('button', { name: /registrarse/i }));

    expect(await panel.findByText('Completá todos los campos.')).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('muestra "Ese username ya está en uso." si el backend lo rechaza', async () => {
    fetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Ese username ya está en uso.' }),
    });
    const { container } = renderWithProviders(<Login />, { route: '/registro' });
    const panel = getRegisterPanel(container);

    fireEvent.change(panel.getByPlaceholderText('Nombre'), { target: { value: 'Ana' } });
    fireEvent.change(panel.getByPlaceholderText('Apellido'), { target: { value: 'Gomez' } });
    fireEvent.change(panel.getByPlaceholderText('tu_username'), { target: { value: 'ana' } });
    fireEvent.change(panel.getByPlaceholderText('tu@email.com'), { target: { value: 'ana@mail.com' } });
    fireEvent.change(panel.getByPlaceholderText('••••••••'), { target: { value: '1234' } });
    fireEvent.click(panel.getByRole('button', { name: /registrarse/i }));

    expect(await panel.findByText('Ese username ya está en uso.')).toBeInTheDocument();
  });

  it('vuelve al panel de login si el registro es exitoso', async () => {
    fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ ok: true }) });
    const { container } = renderWithProviders(<Login />, { route: '/registro' });
    const panel = getRegisterPanel(container);

    fireEvent.change(panel.getByPlaceholderText('Nombre'), { target: { value: 'Ana' } });
    fireEvent.change(panel.getByPlaceholderText('Apellido'), { target: { value: 'Gomez' } });
    fireEvent.change(panel.getByPlaceholderText('tu_username'), { target: { value: 'ana' } });
    fireEvent.change(panel.getByPlaceholderText('tu@email.com'), { target: { value: 'ana@mail.com' } });
    fireEvent.change(panel.getByPlaceholderText('••••••••'), { target: { value: '1234' } });
    fireEvent.click(panel.getByRole('button', { name: /registrarse/i }));

    await waitFor(() => {
      expect(container.querySelector('.wf-card')).not.toHaveClass('wf-card--register');
    });
  });
});
