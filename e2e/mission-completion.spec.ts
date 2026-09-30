// ── e2e/mission-completion.spec.ts ─────────────────────────────────
// Smoke de misión completada (P0 de 3.6): el camino completo del alumno.
//
// Los 7 specs de labs solo verificaban texto en el output de la terminal;
// NADA comprobaba que la validación llegara a la UI. Este spec cierra ese
// hueco de punta a punta:
//
//   comando → CommandResponse con metadatos → LabValidator →
//   completeMission (store) → MissionPanel (progreso) → StepCarousel
//   (auto-avance a la siguiente misión)
//
// Incluye control negativo: un comando que no satisface ningún criterio
// tiene que dejar el progreso en 0 — si no, la validación sería vacía y el
// test pasaría con cualquier cosa.

import { test, expect } from '@playwright/test';
import { navigateToLab, typeCommand } from './helpers';

test('Lab 01: el comando correcto completa la misión y el panel lo refleja', async ({ page }) => {
  await navigateToLab(page, 'scenario-01');

  const panel = page.locator('[data-tour="mission-panel"]');

  // Estado inicial: 8 misiones, ninguna completada.
  await expect(panel).toContainText('0/8 completed');

  // Control negativo: `ls` no satisface discoveredHosts ni scanResults.
  await typeCommand(page, 'ls');
  await expect(panel).toContainText('0/8 completed');

  // Misión 1 — discoveredHosts (minHosts: 1).
  await typeCommand(page, 'arp-scan 192.168.1.0/24');
  await expect(panel).toContainText('1/8 completed');

  // El carrusel auto-avanza a la misión 2 con su título.
  await expect(panel).toContainText('Paso 2 de 8');
  await expect(panel).toContainText('Escaneo de puertos');

  // Misión 2 — scanResults con el puerto 80 abierto.
  await typeCommand(page, 'nmap -sV 192.168.1.11');
  await expect(panel).toContainText('2/8 completed');
  await expect(panel).toContainText('Paso 3 de 8');

  // La misión 1 completada queda MARCADA (título verde) al volver con la
  // flecha del carrusel: el número de progreso y la tarjeta tienen que
  // decir lo mismo. Flecha izquierda = polyline "15 18 9 12 15 6".
  const prevArrow = 'button:has(svg polyline[points="15 18 9 12 15 6"])';
  await panel.locator(prevArrow).click();
  await panel.locator(prevArrow).click();
  await expect(panel.locator('h4', { hasText: 'Reconocimiento de red' })).toHaveClass(/text-emerald-400/);
});

test('Lab 01: un escaneo que no abre el puerto requerido NO completa la misión', async ({ page }) => {
  await navigateToLab(page, 'scenario-01');

  const panel = page.locator('[data-tour="mission-panel"]');
  await expect(panel).toContainText('0/8 completed');

  await typeCommand(page, 'arp-scan 192.168.1.0/24');
  await expect(panel).toContainText('1/8 completed');

  // `nmap` sin puerto 80 no cumple el criterio de la misión 2: el progreso
  // no puede avanzar solo porque se haya corrido el comando.
  await typeCommand(page, 'nmap -p 9999 192.168.1.11');
  await expect(panel).toContainText('1/8 completed');
  await expect(panel).toContainText('Paso 2 de 8');
});
