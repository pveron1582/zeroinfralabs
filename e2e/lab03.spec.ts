// ── e2e/lab03.spec.ts ──────────────────────────────────────────────
// Lab 03 — EternalBlue MS17-010 (172.16.0.0/24 → target .11)

import { test } from '@playwright/test';
import { navigateToLab, typeCommand, expectOutput } from './helpers';

test('Lab 03: arp-scan descubre hosts', async ({ page }) => {
  await navigateToLab(page, 'scenario-03');
  await typeCommand(page, 'arp-scan 172.16.0.0/24');
  await expectOutput(page, '172.16.0.');
});

test('Lab 03: nmap encuentra SMB (445)', async ({ page }) => {
  await navigateToLab(page, 'scenario-03');
  await typeCommand(page, 'arp-scan 172.16.0.0/24');
  await typeCommand(page, 'nmap -sV 172.16.0.11');
  await expectOutput(page, '445/tcp');
});

test('Lab 03: msfconsole verifica vulnerabilidad MS17-010', async ({ page }) => {
  await navigateToLab(page, 'scenario-03');
  await typeCommand(page, 'arp-scan 172.16.0.0/24');
  await typeCommand(page, 'msfconsole');
  await expectOutput(page, 'msf6');
  await typeCommand(page, 'use auxiliary/scanner/smb/smb_ms17_010');
  await typeCommand(page, 'set RHOSTS 172.16.0.11');
  await typeCommand(page, 'run');
  await expectOutput(page, 'VULNERABLE');
});