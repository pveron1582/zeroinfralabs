// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
import { describe, it, expect } from 'vitest';
import { cmd_history } from '../history';

const ctx = (cmdHistory: string[] = ['nmap -sV 10.0.0.1', 'ls -la', 'cat /etc/passwd']) =>
  ({ cmdHistory }) as any;

describe('cmd_history', () => {
  it('debe listar numerado', () => {
    const result = cmd_history.execute([], ctx());
    expect(result.isError).toBeFalsy();
    expect(result.output).toContain('1  nmap -sV 10.0.0.1');
    expect(result.output).toContain('3  cat /etc/passwd');
  });

  it('debe mostrar solo las últimas N', () => {
    const result = cmd_history.execute(['2'], ctx());
    expect(result.output).not.toContain('nmap');
    expect(result.output).toContain('2  ls -la');
    expect(result.output).toContain('3  cat /etc/passwd');
  });

  it('debe salir vacío sin historial', () => {
    expect(cmd_history.execute([], ctx([])).output).toBe('');
  });

  it('debe rechazar -c y argumentos no numéricos', () => {
    expect(cmd_history.execute(['-c'], ctx()).isError).toBe(true);
    expect(cmd_history.execute(['x'], ctx()).isError).toBe(true);
  });
});
