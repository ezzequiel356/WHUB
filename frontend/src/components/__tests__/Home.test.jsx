import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../test/test-utils';
import Home from '../Home';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

beforeEach(() => {
  mockNavigate.mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Home - sin sesión', () => {
  it('muestra los botones de auth y navega con el origen correcto', () => {
    renderWithProviders(<Home />, { route: '/' });

    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    expect(mockNavigate).toHaveBeenCalledWith('/login', { state: { from: '/' } });

    fireEvent.click(screen.getByRole('button', { name: 'Registrarse' }));
    expect(mockNavigate).toHaveBeenCalledWith('/registro', { state: { from: '/' } });
  });

  it('no muestra el menú de perfil', () => {
    renderWithProviders(<Home />, { route: '/' });

    expect(screen.queryByText('Cerrar sesión')).not.toBeInTheDocument();
  });
});

describe('Home - con sesión', () => {
  const USER = { id_usuario: 1, username: 'gauss' };

  it('muestra el username y cierra sesión al hacer click', () => {
    renderWithProviders(<Home />, { route: '/', user: USER });

    expect(screen.getByText('gauss')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cerrar sesión'));

    expect(localStorage.getItem('wf_user')).toBeNull();
  });

  it('no muestra los botones de iniciar sesión / registrarse', () => {
    renderWithProviders(<Home />, { route: '/', user: USER });

    expect(screen.queryByRole('button', { name: 'Iniciar sesión' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Registrarse' })).not.toBeInTheDocument();
  });
});

describe('Home - hero y menú mobile', () => {
  it('"Explorar Warframes" navega a /catalogo', () => {
    renderWithProviders(<Home />, { route: '/' });

    fireEvent.click(screen.getByRole('button', { name: 'Explorar Warframes' }));

    expect(mockNavigate).toHaveBeenCalledWith('/catalogo');
  });

  it('el botón hamburguesa abre y cierra el menú mobile', () => {
    const { container } = renderWithProviders(<Home />, { route: '/' });

    const hamburger = container.querySelector('.hamburger');
    const mobileMenu = container.querySelector('.mobile-menu');
    expect(hamburger).not.toHaveClass('open');
    expect(mobileMenu).not.toHaveClass('mobile-menu--open');

    fireEvent.click(hamburger);
    expect(hamburger).toHaveClass('open');
    expect(mobileMenu).toHaveClass('mobile-menu--open');

    fireEvent.click(hamburger);
    expect(hamburger).not.toHaveClass('open');
    expect(mobileMenu).not.toHaveClass('mobile-menu--open');
  });
});
