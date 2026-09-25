import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';

// Envuelve un componente con MemoryRouter + AuthProvider reales, evitando
// repetir este boilerplate en cada archivo de test.
//
// - route: URL inicial dentro del MemoryRouter.
// - path:  si el componente usa useParams (ej. "/perfil/:username"), hay que
//          pasarlo para que MemoryRouter resuelva los params correctamente.
// - user:  si se pasa, se precarga en localStorage antes de renderizar, así
//          AuthContext arranca con la sesión ya iniciada (o sin user si se omite).
export function renderWithProviders(ui, { route = '/', path, user = null } = {}) {
  if (user) {
    localStorage.setItem('wf_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('wf_user');
  }

  const content = path ? (
    <Routes>
      <Route path={path} element={ui} />
    </Routes>
  ) : ui;

  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>{content}</AuthProvider>
    </MemoryRouter>
  );
}
