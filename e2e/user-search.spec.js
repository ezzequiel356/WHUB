import { test, expect } from '@playwright/test';
import { usuarioDePrueba, registrar, login } from './helpers.js';

test('buscar un usuario desde el perfil y ver su perfil ajeno', async ({ page, request }) => {
  const buscador = usuarioDePrueba();
  const buscado = usuarioDePrueba();
  await registrar(request, buscador);
  await registrar(request, buscado);

  await login(page, buscador);
  await expect(page).toHaveURL('/');

  await page.goto('/perfil');
  await page.getByPlaceholder('Buscar usuario...').fill(buscado.username);
  await page.getByText(`@${buscado.username}`).click();

  await expect(page).toHaveURL(`/perfil/${buscado.username}`);
  await expect(page.locator('.pf-info__username')).toHaveText(`@${buscado.username}`);
});
