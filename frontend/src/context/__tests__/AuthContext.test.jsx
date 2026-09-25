import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';

function Probe() {
  const { user, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="user">{user ? user.username : 'anon'}</span>
      <button onClick={() => login({ id_usuario: 1, username: 'gauss' })}>login</button>
      <button onClick={logout}>logout</button>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe('AuthProvider', () => {
  it('arranca sin usuario si no hay nada guardado en localStorage', () => {
    render(<AuthProvider><Probe /></AuthProvider>);

    expect(screen.getByTestId('user')).toHaveTextContent('anon');
  });

  it('login() guarda el usuario en localStorage y lo expone via useAuth', () => {
    render(<AuthProvider><Probe /></AuthProvider>);

    fireEvent.click(screen.getByText('login'));

    expect(screen.getByTestId('user')).toHaveTextContent('gauss');
    expect(JSON.parse(localStorage.getItem('wf_user'))).toEqual({ id_usuario: 1, username: 'gauss' });
  });

  it('logout() borra el usuario de localStorage y del estado', () => {
    render(<AuthProvider><Probe /></AuthProvider>);

    fireEvent.click(screen.getByText('login'));
    fireEvent.click(screen.getByText('logout'));

    expect(screen.getByTestId('user')).toHaveTextContent('anon');
    expect(localStorage.getItem('wf_user')).toBeNull();
  });

  it('si ya había un usuario guardado, arranca con la sesión ya iniciada', () => {
    localStorage.setItem('wf_user', JSON.stringify({ id_usuario: 2, username: 'wisp' }));

    render(<AuthProvider><Probe /></AuthProvider>);

    expect(screen.getByTestId('user')).toHaveTextContent('wisp');
  });
});
