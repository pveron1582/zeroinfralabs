// ── e2e/lab04.spec.ts ──────────────────────────────────────────────
// Lab 04 — LFI to RCE (192.168.20.0/24 → target .11)

import { test } from '@playwright/test';
import { navigateToLab, typeCommand, expectOutput } from './helpers';

test('Lab 04: arp-scan descubre hosts', async ({ page }) => {
  await navigateToLab(page, 'scenario-04');
  await typeCommand(page, 'arp-scan 192.168.20.0/24');
  await expectOutput(page, '192.168.20.');
});

test('Lab 04: nmap escanea Apache y OpenSSH', async ({ page }) => {
  await navigateToLab(page, 'scenario-04');
  await typeCommand(page, 'arp-scan 192.168.20.0/24');
  await typeCommand(page, 'nmap -sV 192.168.20.11');
  await expectOutput(page, '80/tcp');
  await expectOutput(page, '22/tcp');
});

test('Lab 04: nc inicia listener', async ({ page }) => {
  await navigateToLab(page, 'scenario-04');
  await typeCommand(page, 'nc -nlvp 4444');
  await expectOutput(page, 'listening on');
});