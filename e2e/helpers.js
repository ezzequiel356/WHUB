// Prefijo "e2e_" para poder identificar (y limpiar en el teardown) los
// usuarios que crea la suite, sin tocar datos reales de la base.
export function usuarioDePrueba() {
  const id = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  return {
    nombre: 'E2E',
    apellido: 'Test',
    username: `e2e_${id}`,
    email: `e2e_${id}@test.com`,
    contraseña: 'clave1234',
  };
}

export async function registrar(request, usuario) {
  const res = await request.post('/api/register', { data: usuario });
  if (!res.ok()) {
    throw new Error(`No se pudo registrar el usuario de prueba: ${res.status()} ${await res.text()}`);
  }
}

export async function login(page, usuario) {
  await page.goto('/login');
  const panel = page.locator('.wf-panel--login');
  await panel.getByPlaceholder('tu_username').fill(usuario.username);
  await panel.getByPlaceholder('••••••••').fill(usuario.contraseña);
  await panel.getByRole('button', { name: 'ACCEDER' }).click();
}
