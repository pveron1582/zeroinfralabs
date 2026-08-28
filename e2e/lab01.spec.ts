// ── e2e/lab01.spec.ts ──────────────────────────────────────────────
// Lab 01 — WordPress Vulnerable Lab (192.168.1.0/24 → target .11)
// Happy path: arp-scan → nmap → gobuster

import { test } from '@playwright/test';
import { navigateToLab, typeCommand, expectOutput } from './helpers';

test('Lab 01: arp-scan descubre hosts', async ({ page }) => {
  await navigateToLab(page, 'scenario-01');
  await typeCommand(page, 'arp-scan 192.168.1.0/24');
  await expectOutput(page, '192.168.1.');
});

test('Lab 01: nmap escanea puertos del target', async ({ page }) => {
  await navigateToLab(page, 'scenario-01');
  await typeCommand(page, 'arp-scan 192.168.1.0/24');
  await typeCommand(page, 'nmap -sV 192.168.1.11');
  await expectOutput(page, '80/tcp');
  await expectOutput(page, '22/tcp');
});