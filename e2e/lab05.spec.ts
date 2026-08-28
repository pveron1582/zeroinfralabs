// ── e2e/lab05.spec.ts ──────────────────────────────────────────────
// Lab 05 — FTP Enumeration & Privilege Escalation (10.10.20.0/24 → target .11)

import { test } from '@playwright/test';
import { navigateToLab, typeCommand, expectOutput } from './helpers';

test('Lab 05: arp-scan descubre hosts', async ({ page }) => {
  await navigateToLab(page, 'scenario-05');
  await typeCommand(page, 'arp-scan 10.10.20.0/24');
  await expectOutput(page, '10.10.20.');
});

test('Lab 05: nmap escanea puertos', async ({ page }) => {
  await navigateToLab(page, 'scenario-05');
  await typeCommand(page, 'arp-scan 10.10.20.0/24');
  await typeCommand(page, 'nmap -sV 10.10.20.11');
  await expectOutput(page, '21/tcp');
  await expectOutput(page, '22/tcp');
});

test('Lab 05: FTP anonimo descarga nota', async ({ page }) => {
  await navigateToLab(page, 'scenario-05');
  await typeCommand(page, 'arp-scan 10.10.20.0/24');
  await typeCommand(page, 'ftp 10.10.20.11');
  await typeCommand(page, 'anonymous');
  await typeCommand(page, 'pass@');
  await expectOutput(page, 'Login successful');
  await typeCommand(page, 'ls');
  await expectOutput(page, 'nota.txt');
  await typeCommand(page, 'get nota.txt');
  await expectOutput(page, 'Transfer complete');
});