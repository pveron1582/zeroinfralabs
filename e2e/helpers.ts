// ── e2e/helpers.ts ──────────────────────────────────────────────────
// Helpers compartidos para los E2E smoke tests de los laboratorios.

import { type Page, expect } from '@playwright/test';

/**
 * Espera a que el input de la terminal esté listo. El app carga en modo
 * desktop donde no hay terminal abierta por defecto: si no aparece el input,
 * abre una terminal con el botón "Nueva Terminal" de la top bar.
 */
export async function waitForTerminal(page: Page) {
  const input = page.locator('input[aria-label="Terminal command input"]');
  await page.waitForTimeout(2000); // esperar al loader de máquina (~6.5s parcial)
  if ((await input.count()) === 0) {
    await page.locator('button[title="Nueva Terminal"]').first().click();
  }
  await input.first().waitFor({ state: 'visible', timeout: 60_000 });
}

/** Escribe un comando en la terminal y presiona Enter. */
export async function typeCommand(page: Page, cmd: string) {
  const input = page.locator('input[aria-label="Terminal command input"]').first();
  await input.click();
  await input.fill(cmd);
  await input.press('Enter');
  // Esperar a que el output se renderice (streaming, delays)
  await page.waitForTimeout(2000);
}

/** Espera a que el texto aparezca en el área de output de la terminal. */
export async function expectOutput(page: Page, text: string) {
  const log = page.locator('[role="log"]').first();
  await expect(log).toContainText(text, { timeout: 15_000 });
}

/** Navega a un escenario y espera la terminal. */
export async function navigateToLab(page: Page, scenarioId: string, lang = 'es') {
  await page.goto(`/${lang}/scenario/${scenarioId}`);
  await waitForTerminal(page);
}