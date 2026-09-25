import { test, expect } from '@playwright/test';
import { usuarioDePrueba, registrar, login } from './helpers.js';

test('login completo: credenciales correctas navegan al home logueado', async ({ page, request }) => {
  const usuario = usuarioDePrueba();
  await registrar(request, usuario);

  await login(page, usuario);

  await expect(page).toHaveURL('/');
  await page.locator('.profile-wrapper').hover();
  await expect(page.locator('.profile-dropdown').getByText(usuario.username)).toBeVisible();
});

test('login con contraseña incorrecta muestra el error del backend y no navega', async ({ page, request }) => {
  const usuario = usuarioDePrueba();
  await registrar(request, usuario);

  await page.goto('/login');
  const panel = page.locator('.wf-panel--login');
  await panel.getByPlaceholder('tu_username').fill(usuario.username);
  await panel.getByPlaceholder('••••••••').fill('claveIncorrecta');
  await panel.getByRole('button', { name: 'ACCEDER' }).click();

  await expect(panel.getByText('Usuario o contraseña incorrectos.')).toBeVisible();
  await expect(page).toHaveURL('/login');
});
