import { test, expect } from '@playwright/test';
import { usuarioDePrueba, registrar, login } from './helpers.js';

test('agregar un favorito desde el catálogo y quitarlo desde el perfil', async ({ page, request }) => {
  const usuario = usuarioDePrueba();
  await registrar(request, usuario);
  await login(page, usuario);
  await expect(page).toHaveURL('/');

  await page.goto('/catalogo');
  await page.getByPlaceholder('Buscar warframe...').fill('Wisp');

  const favBtn = page.getByTitle('Agregar a favoritos');
  await expect(favBtn).toHaveCount(1);
  await favBtn.click();
  await expect(page.getByTitle('Quitar de favoritos')).toBeVisible();

  await page.goto('/perfil');
  const favItem = page.locator('.pf-fav-item', { hasText: 'Wisp' });
  await expect(favItem).toBeVisible();

  await favItem.getByTitle('Quitar favorito').click();
  await expect(page.getByText('No tenés favoritos todavía.')).toBeVisible();
});
