// ── commands/powershell/__tests__/parser.test.ts ──────────────────
// Parser de líneas PowerShell (PLAN_WINDOWS W2).

import { describe, it, expect } from 'vitest';
import { parsePsLine, getParam, pathArg } from '../parser';

describe('parsePsLine', () => {
  it('debe parsear Verb-Noun simple', () => {
    const inv = parsePsLine('Get-ChildItem');
    expect(inv).not.toBeNull();
    expect(inv!.name).toBe('Get-ChildItem');
    expect(inv!.positionals).toEqual([]);
    expect(inv!.params).toEqual({});
  });

  it('debe parsear -Param value', () => {
    const inv = parsePsLine('Get-Content -Path C:\\flag.txt');
    expect(inv!.rawName).toBe('Get-Content');
    expect(inv!.params.Path).toBe('C:\\flag.txt');
    expect(pathArg(inv!)).toBe('C:\\flag.txt');
  });

  it('debe parsear -Param:value inline', () => {
    const inv = parsePsLine('Get-Content -Path:C:/flag.txt');
    expect(inv!.params.Path).toBe('C:/flag.txt');
  });

  it('debe parsear switches booleanos', () => {
    const inv = parsePsLine('Remove-Item -Path C:/tmp -Recurse');
    expect(inv!.params.Recurse).toBe(true);
    expect(pathArg(inv!)).toBe('C:/tmp');
  });

  it('debe parsear posicionales', () => {
    const inv = parsePsLine('Copy-Item C:/a.txt C:/b.txt');
    expect(inv!.positionals).toEqual(['C:/a.txt', 'C:/b.txt']);
    expect(pathArg(inv!)).toBe('C:/a.txt');
  });

  it('debe devolver null para línea vacía', () => {
    expect(parsePsLine('')).toBeNull();
    expect(parsePsLine('   ')).toBeNull();
  });

  it('getParam debe ser case-insensitive', () => {
    const inv = parsePsLine('Get-Service -Name sshd');
    expect(getParam(inv!, 'Name')).toBe('sshd');
    expect(getParam(inv!, 'name')).toBe('sshd');
    expect(getParam(inv!, 'NAME')).toBe('sshd');
  });

  it('debe respetar comillas con espacios', () => {
    const inv = parsePsLine('Get-Content -Path "C:/Program Files/flag.txt"');
    expect(inv!.params.Path).toBe('C:/Program Files/flag.txt');
  });
});
