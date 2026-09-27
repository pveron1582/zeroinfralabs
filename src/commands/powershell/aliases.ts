// ── commands/powershell/aliases.ts ────────────────────────────────
// Alias de cmdlets PowerShell (PLAN_WINDOWS W2): resolución case-insensitive
// en el dispatcher (session.ts). Documentados en Get-Help.

export const PS_ALIASES: Record<string, string> = {
  // filesystem
  gci: 'Get-ChildItem',
  ls: 'Get-ChildItem',
  dir: 'Get-ChildItem',
  cat: 'Get-Content',
  gc: 'Get-Content',
  type: 'Get-Content',
  sc: 'Set-Content',
  rm: 'Remove-Item',
  del: 'Remove-Item',
  ri: 'Remove-Item',
  cp: 'Copy-Item',
  copy: 'Copy-Item',
  cpi: 'Copy-Item',
  ni: 'New-Item',
  mkdir: 'New-Item',
  md: 'New-Item',
  rp: 'Resolve-Path',
  // ubicación: en cmd.exe `cd` es comando propio; en PowerShell es alias
  cd: 'Set-Location',
  sl: 'Set-Location',
  chdir: 'Set-Location',
  pwd: 'Get-Location',
  gl: 'Get-Location',
  // process
  ps: 'Get-Process',
  gps: 'Get-Process',
  spps: 'Stop-Process',
  kill: 'Stop-Process',
  // service
  gsv: 'Get-Service',
  sasv: 'Start-Service',
  spsv: 'Stop-Service',
  // network
  nettcp: 'Get-NetTCPConnection',
  ipconfig: 'Get-NetIPConfiguration',
  tnc: 'Test-NetConnection',
  testconnection: 'Test-NetConnection',
  iwr: 'Invoke-WebRequest',
  curl: 'Invoke-WebRequest',
  // system
  help: 'Get-Help',
  cls: 'Clear-Host',
  clear: 'Clear-Host',
  // session (no cmdlet — manejado en executePsLine)
  exit: 'exit',
  quit: 'exit',
};

/** Resuelve nombre de cmdlet o alias → nombre canónico. Case-insensitive. */
export function resolvePsCommand(name: string): string {
  const lower = name.toLowerCase();
  const alias = PS_ALIASES[lower];
  return alias ?? name;
}
