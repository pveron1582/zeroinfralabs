// ── e2e/lab02.spec.ts ──────────────────────────────────────────────
// Lab 02 — Web OSINT & SSH Compromise (10.10.10.0/24 → target .11)

import { test } from '@playwright/test';
import { navigateToLab, typeCommand, expectOutput } from './helpers';

test('Lab 02: arp-scan descubre hosts', async ({ page }) => {
  await navigateToLab(page, 'scenario-02');
  await typeCommand(page, 'arp-scan 10.10.10.0/24');
  await expectOutput(page, '10.10.10.');
});

test('Lab 02: nmap escanea el target', async ({ page }) => {
  await navigateToLab(page, 'scenario-02');
  await typeCommand(page, 'arp-scan 10.10.10.0/24');
  await typeCommand(page, 'nmap -sV 10.10.10.11');
  await expectOutput(page, '22/tcp');
  await expectOutput(page, '80/tcp');
});

test('Lab 02: hydra fuerza bruta SSH', async ({ page }) => {
  await navigateToLab(page, 'scenario-02');
  await typeCommand(page, 'arp-scan 10.10.10.0/24');
  await typeCommand(page, 'nmap -sV 10.10.10.11');
  await typeCommand(page, 'hydra -l gonzalo -P /usr/share/wordlists/rockyou.txt 10.10.10.11 ssh');
  await expectOutput(page, 'casablanca');
});