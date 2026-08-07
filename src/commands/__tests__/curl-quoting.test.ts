// ── commands/__tests__/curl-quoting.test.ts ─────────────────────────
// Verifica que los payloads SQLi funcionen con distintas formas de comillas
// a través del parser real (executeCommand + splitArgs).

import { describe, it, expect } from 'vitest';
import { scenario_06 } from '../../laboratorios/laboratorio06';
import { executeCommand } from '../index';

describe('curl: payloads SQLi con distintas comillas (parser real)', () => {
  const machines = scenario_06.machines;
  const attacker = machines.find(m => m.id.includes('attacker'))!;
  const t = machines.find(m => !m.id.includes('attacker'))!;

  const fvOf = (cmd: string) => {
    const r = executeCommand(cmd, attacker, machines, 1, undefined, '/root');
    return 'foundVulnerability' in r ? r.foundVulnerability : undefined;
  };

  it('comilla simple con dobles comillas detecta', () => {
    expect(fvOf(`curl -X POST http://${t.machine_info.ip}/login -d "username='&password=x"`)?.status).toBe('detected');
  });

  it('comilla simple sin dobles comillas (unbalanced) se trata como bash: no detecta', () => {
    expect(fvOf(`curl -X POST http://${t.machine_info.ip}/login -d username='&password=x`)?.status).toBeUndefined();
  });

  it('or en minúscula con dobles comillas confirma', () => {
    expect(fvOf(`curl -X POST http://${t.machine_info.ip}/login -d "username=' or '1'='1&password=x"`)?.status).toBe('confirmed');
  });

  it('or en mayúscula con dobles comillas confirma', () => {
    expect(fvOf(`curl -X POST http://${t.machine_info.ip}/login -d "username=' OR '1'='1&password=x"`)?.status).toBe('confirmed');
  });

  it('or en minúscula sin comillas externas (unbalanced) se trata como bash: no detecta', () => {
    expect(fvOf(`curl -X POST http://${t.machine_info.ip}/login -d username=' or '1'='1&password=x`)?.status).toBeUndefined();
  });

  it('union en minúscula con dobles comillas descubre credenciales', () => {
    const r = executeCommand(`curl -X POST http://${t.machine_info.ip}/login -d "username=' union select table_name from information_schema.tables--&password=x"`, attacker, machines, 1, undefined, '/root');
    const fc = 'foundCredentials' in r ? r.foundCredentials : undefined;
    expect(fc?.service).toBe('mysql');
  });
});
