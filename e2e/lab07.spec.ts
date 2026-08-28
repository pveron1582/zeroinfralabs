// ── e2e/lab07.spec.ts ──────────────────────────────────────────────
// Lab 07 — Burp Suite: Web Application Pentesting (192.168.50.0/24 → target .11)

import { test } from '@playwright/test';
import { navigateToLab, typeCommand, expectOutput } from './helpers';

test('Lab 07: arp-scan descubre hosts', async ({ page }) => {
  await navigateToLab(page, 'scenario-07');
  await typeCommand(page, 'arp-scan 192.168.50.0/24');
  await expectOutput(page, '192.168.50.');
});

test('Lab 07: nmap escanea Apache', async ({ page }) => {
  await navigateToLab(page, 'scenario-07');
  await typeCommand(page, 'arp-scan 192.168.50.0/24');
  await typeCommand(page, 'nmap -sV 192.168.50.11');
  await expectOutput(page, '80/tcp');
  await expectOutput(page, 'http');
});