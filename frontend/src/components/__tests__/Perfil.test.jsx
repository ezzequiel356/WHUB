import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/test-utils';
import Perfil from '../Perfil';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

const USER = {
  id_usuario: 1, nombre: 'Gauss', apellido: 'Test', username: 'gauss',
  email: 'gauss@mail.com', descripcion: '', avatar: '', banner: '',
};

function mockFetchImpl({ favoritos = [], historial = [], uploadAvatar } = {}) {
  fetch.mockImplementation((url) => {
    if (url === `/api/favoritos/${USER.id_usuario}`) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(favoritos) });
    }
    if (url === `/api/historial/${USER.id_usuario}`) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(historial) });
    }
    if (url === '/api/uploads/avatar' && uploadAvatar) {
      return Promise.resolve(uploadAvatar);
    }
    // resto de endpoints /api/perfil/* usados al guardar
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

describe('Perfil', () => {
  it('sin usuario logueado, redirige a /login y no renderiza nada', () => {
    mockFetchImpl();
    const { container } = renderWithProviders(<Perfil />, { route: '/perfil' });

    expect(mockNavigate).toHaveBeenCalledWith('/login');
    expect(container).toBeEmptyDOMElement();
  });

  it('con usuario logueado, carga y muestra favoritos e historial', async () => {
    mockFetchImpl({ favoritos: [{ warframe_nombre: 'Wisp' }], historial: [] });
    renderWithProviders(<Perfil />, { route: '/perfil', user: USER });

    expect(await screen.findByText('Wisp')).toBeInTheDocument();
    expect(screen.getByText('No hay compras registradas todavía.')).toBeInTheDocument();
  });

  it('"Editar Perfil" precarga el formulario con los datos actuales', async () => {
    mockFetchImpl();
    renderWithProviders(<Perfil />, { route: '/perfil', user: USER });

    await screen.findByText('@gauss');
    fireEvent.click(screen.getByRole('button', { name: /editar perfil/i }));

    expect(screen.getByDisplayValue('Gauss')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test')).toBeInTheDocument();
    expect(screen.getByDisplayValue('gauss@mail.com')).toBeInTheDocument();
  });

  it('si se ingresa nueva contraseña sin la actual, muestra error y no llama a la API', async () => {
    mockFetchImpl();
    renderWithProviders(<Perfil />, { route: '/perfil', user: USER });

    await screen.findByText('@gauss');
    fireEvent.click(screen.getByRole('button', { name: /editar perfil/i }));

    const [, nuevaPass] = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(nuevaPass, { target: { value: 'nueva123' } });
    fireEvent.click(screen.getByRole('button', { name: /guardar perfil/i }));

    // El toast concatena un ícono + el mensaje en el mismo nodo ("✕ Ingresá…"),
    // por eso se matchea con un regex parcial en vez del texto exacto.
    expect(await screen.findByText(/Ingresá tu contraseña actual para cambiarla/)).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalledWith('/api/perfil/contrasena', expect.anything());
  });

  it('al guardar, solo llama a la API de los campos que cambiaron', async () => {
    mockFetchImpl();
    renderWithProviders(<Perfil />, { route: '/perfil', user: USER });

    await screen.findByText('@gauss');
    fireEvent.click(screen.getByRole('button', { name: /editar perfil/i }));

    fireEvent.change(screen.getByDisplayValue('Gauss'), { target: { value: 'Gaussito' } });
    fireEvent.click(screen.getByRole('button', { name: /guardar perfil/i }));

    await waitFor(() => expect(screen.getByText(/¡Perfil guardado!/)).toBeInTheDocument());

    const urlsLlamadas = fetch.mock.calls.map(([url]) => url);
    expect(urlsLlamadas).toContain('/api/perfil/nombre');
    expect(urlsLlamadas).not.toContain('/api/perfil/apellido');
    expect(urlsLlamadas).not.toContain('/api/perfil/username');
    expect(urlsLlamadas).not.toContain('/api/perfil/email');
    expect(urlsLlamadas).not.toContain('/api/perfil/descripcion');
  });

  it('subir un avatar actualiza la URL mostrada y el usuario en contexto', async () => {
    mockFetchImpl({
      uploadAvatar: { ok: true, json: () => Promise.resolve({ ok: true, url: '/uploads/avatars/avatars_1_123.png' }) },
    });
    const { container } = renderWithProviders(<Perfil />, { route: '/perfil', user: USER });

    await screen.findByText('@gauss');

    // El input de banner se declara antes que el de avatar en el JSX.
    const [, avatarInput] = container.querySelectorAll('input[type="file"]');
    const file = new File(['contenido'], 'avatar.png', { type: 'image/png' });
    await userEvent.upload(avatarInput, file);

    expect(await screen.findByText(/¡Foto de perfil actualizada!/)).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith('/api/uploads/avatar', expect.objectContaining({ method: 'POST' }));
    expect(JSON.parse(localStorage.getItem('wf_user')).avatar).toBe('/uploads/avatars/avatars_1_123.png');
  });
});
