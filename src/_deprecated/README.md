# Archivos deprecados

Archivos sin imports en producción. Movidos aquí el 2026-06-17.
Si todo pasa correctamente, se eliminarán en el próximo cleanup.

## `frameworks/metasploit/commands/`
Sub-comandos MSF individuales (`cmd_use`, `cmd_set`, `cmd_search`, etc.)
→ Reemplazados por `frameworks/metasploit/orchestrators/`

## `frameworks/metasploit/core/ModuleLoader.ts`, `SessionManager.ts`, `index.ts`
Nunca integrados; la lógica vive en `orchestrators/` directamente.

## `frameworks/metasploit/modules/`
Datos de módulos nunca conectados.

## `frameworks/metasploit/orchestrators/index.ts`
Barrel no usado; cada orquestador se importa directamente.

## `frameworks/index.ts`
Barrel raíz no usado.

## `frameworks/metasploit/index.ts`
Barrel de metasploit no usado.

## `store/index.ts`
Barrel del store no usado.
