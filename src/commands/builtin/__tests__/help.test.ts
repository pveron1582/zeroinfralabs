// ── commands/builtin/__tests__/help.test.ts ───────────────────────────────
// Tests para el comando help

import { describe, it, expect } from 'vitest';
import { cmd_help } from '../help';

describe('cmd_help', () => {

  it('debe mostrar lista completa de comandos sin argumentos', () => {
    const result = cmd_help.execute([]);
    expect(result.output).toContain('Available commands:');
    expect(result.output).toContain('help');
    expect(result.output).toContain('clear');
    expect(result.output).toContain('whoami');
    expect(result.output).toContain('ifconfig');
    expect(result.output).toContain('ls');
    expect(result.output).toContain('cd');
    expect(result.output).toContain('cat');
    expect(result.output).toContain('mkdir');
    expect(result.output).toContain('rmdir');
    expect(result.output).toContain('nmap');
    expect(result.output).toContain('ssh');
    expect(result.output).toContain('msfconsole');
    expect(result.output).toContain('nc');
    expect(result.output).toContain('exit');
    expect(result.output).toContain('end');
    expect(result.output).toContain('help <command>');
    expect(result.isError).toBe(false);
  });

  it('debe mostrar ayuda específica de mkdir', () => {
    const result = cmd_help.execute(['mkdir']);
    expect(result.output).toContain('mkdir - Create directories');
    expect(result.output).toContain('Usage:');
    expect(result.output).toContain('mkdir [-p] directory...');
    expect(result.output).toContain('Options:');
    expect(result.output).toContain('-p  Create parent directories');
    expect(result.output).toContain('Examples:');
    expect(result.output).toContain('mkdir new_folder');
    expect(result.output).toContain('mkdir -p /var/www/html/new');
    expect(result.output).toContain('Description:');
    expect(result.isError).toBe(false);
  });

  it('debe mostrar ayuda específica de rmdir', () => {
    const result = cmd_help.execute(['rmdir']);
    expect(result.output).toContain('rmdir - Remove empty directories');
    expect(result.output).toContain('Usage:');
    expect(result.output).toContain('rmdir [-p] directory...');
    expect(result.output).toContain('Options:');
    expect(result.output).toContain('-p  Remove parent directories');
    expect(result.output).toContain('Examples:');
    expect(result.output).toContain('rmdir empty_folder');
    expect(result.output).toContain('rmdir -p /var/www/html/new');
    expect(result.output).toContain('Description:');
    expect(result.isError).toBe(false);
  });

  it('debe mostrar ayuda específica de ls', () => {
    const result = cmd_help.execute(['ls']);
    expect(result.output).toContain('ls - List files and directories');
    expect(result.output).toContain('Usage:');
    expect(result.output).toContain('ls [options] [directory]');
    expect(result.output).toContain('Options:');
    expect(result.output).toContain('-l  Long format');
    expect(result.output).toContain('-a  Show hidden files');
    expect(result.output).toContain('-la Combination of -l and -a');
    expect(result.output).toContain('Examples:');
    expect(result.output).toContain('ls');
    expect(result.output).toContain('ls -l /etc');
    expect(result.output).toContain('ls -la ~');
    expect(result.isError).toBe(false);
  });

  it('debe mostrar ayuda específica de cd', () => {
    const result = cmd_help.execute(['cd']);
    expect(result.output).toContain('cd - Change directory');
    expect(result.output).toContain('Usage:');
    expect(result.output).toContain('cd [directory]');
    expect(result.output).toContain('Examples:');
    expect(result.output).toContain('cd /etc');
    expect(result.output).toContain('cd ..');
    expect(result.output).toContain('cd ~');
    expect(result.output).toContain('Description:');
    expect(result.isError).toBe(false);
  });

  it('debe mostrar ayuda específica de cat', () => {
    const result = cmd_help.execute(['cat']);
    expect(result.output).toContain('cat - Display file contents');
    expect(result.output).toContain('Usage:');
    expect(result.output).toContain('cat file...');
    expect(result.output).toContain('Examples:');
    expect(result.output).toContain('cat /etc/passwd');
    expect(result.output).toContain('cat log.txt');
    expect(result.output).toContain('Description:');
    expect(result.isError).toBe(false);
  });

  it('debe mostrar error para comando no existente', () => {
    const result = cmd_help.execute(['comando_inexistente']);
    expect(result.output).toContain('No help available for command: comando_inexistente');
    expect(result.output).toContain("Type 'help' without arguments");
    expect(result.isError).toBe(true);
  });

  it('debe ser case sensitive (comandos en mayúsculas no existen)', () => {
    const result = cmd_help.execute(['MKDIR']);
    expect(result.output).toContain('No help available for command: MKDIR');
    expect(result.isError).toBe(true);
  });

  it('debe manejar comandos con espacios', () => {
    const result = cmd_help.execute(['ls', '-l']);
    expect(result.output).toContain('ls - List files and directories');
    expect(result.output).toContain('Usage:');
    expect(result.output).toContain('ls [options] [directory]');
    expect(result.output).toContain('Options:');
    expect(result.output).toContain('-l  Long format');
    expect(result.output).toContain('-a  Show hidden files');
    expect(result.output).toContain('-la Combination of -l and -a');
    expect(result.output).toContain('Examples:');
    expect(result.output).toContain('ls                                 # List current directory');
    expect(result.output).toContain('ls -l /etc                         # Long format of /etc');
    expect(result.output).toContain('ls -la ~                           # Hidden + long format in home');
    expect(result.isError).toBe(false);
  });
});
