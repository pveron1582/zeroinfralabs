// ── e2e/lab08.spec.ts ──────────────────────────────────────────────
// Lab 08 — Webmail RCE → xrdp → Escalada (192.168.60.0/24 → target .11)
// Lab oculto (no aparece en el grid), alcanzable por URL directa: este
// spec es también la prueba de que esa ruta directa sigue cargando el lab.

import { test } from '@playwright/test';
import { navigateToLab, typeCommand, expectOutput } from './helpers';

test('Lab 08: arp-scan descubre hosts', async ({ page }) => {
  await navigateToLab(page, 'scenario-08');
  await typeCommand(page, 'arp-scan 192.168.60.0/24');
  await expectOutput(page, '192.168.60.');
});

test('Lab 08: nmap encuentra el webmail en 443', async ({ page }) => {
  await navigateToLab(page, 'scenario-08');
  await typeCommand(page, 'arp-scan 192.168.60.0/24');
  await typeCommand(page, 'nmap -sV 192.168.60.11');
  await expectOutput(page, '443/tcp');
  await expectOutput(page, 'https');
});

test('Lab 08: msfconsole escanea la versión de SquirrelMail', async ({ page }) => {
  await navigateToLab(page, 'scenario-08');
  await typeCommand(page, 'arp-scan 192.168.60.0/24');
  await typeCommand(page, 'msfconsole');
  await expectOutput(page, 'msf6');
  await typeCommand(page, 'use auxiliary/scanner/http/squirrelmail_version');
  await typeCommand(page, 'set RHOSTS 192.168.60.11');
  await typeCommand(page, 'run');
  await expectOutput(page, 'SquirrelMail 1.4.22');
});
