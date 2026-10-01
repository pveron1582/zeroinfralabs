// ── utils/filesChanged.ts ───────────────────────────────────────────
// Convención `filesChanged` de CommandResponse: es el SNAPSHOT COMPLETO del
// árbol de archivos de la máquina, NO una lista de cambios. El store lo
// aplica con `setMachineFiles()` que REEMPLAZA `machine.files` entero, así
// que un snapshot mal formado corrompe el FS simulado:
//
//  - Un delta (sólo los archivos nuevos) BORRA el resto del árbol. Bug real
//    de wget (2026-10-01): 6 archivos → 1 tras `wget http://10.10.10.11/`.
//  - Concatenar los snapshots de los segmentos de un pipeline DUPLICA el
//    árbol. Bug real de runPipeline: `echo hola > a.txt | tee b.txt` daba
//    6 paths únicos aplicados como 11 entradas.
//  - Un path es único por definición del modelo (addFileToMachine hace
//    upsert por path); el store deduplica como última línea de defensa.
//
// MODELO: hay dos familias de comandos. Los que MUTAN `machine.files` y
// declaran el snapshot para notificar (cp, mv, rm, echo, tee…), y los que
// sólo DECLARAN (dpkg agregando binarios, hashcat -o, el consolidado de
// cron vía sleep) — el executor materializa su declaración sobre el árbol
// in-place tras cada comando (`upsertFiles`), así la redirección, la
// validación de misiones y los segmentos de un pipeline ven los cambios en
// vez de perderlos. Ningún declarante-sin-mutar borra paths: borrar exige
// mutación in-place.
//
// Reglas estáticas en `src/commands/__tests__/files-changed-contract.test.ts`.

import type { FileEntry, Machine } from '../types';

/**
 * Upsert por path donde `changes` gana: es la materialización de una
 * declaración sobre el árbol actual (wget -O pisando un archivo existente,
 * hashcat reescribiendo su output, dpkg agregando binarios). No muta ninguna
 * de las dos entradas y nunca duplica paths.
 */
export function upsertFiles(
  base: FileEntry[] | undefined,
  changes: FileEntry[]
): FileEntry[] {
  const merged = new Map<string, FileEntry>();
  for (const f of base ?? []) merged.set(f.path, f);
  for (const f of changes) merged.set(f.path, f);
  return [...merged.values()];
}

/**
 * Materializa la declaración `filesChanged` de un comando sobre el árbol
 * in-place. Es lo que hace que la redirección, la validación de misiones y
 * los segmentos de un pipeline vean los cambios de los comandos que SÓLO
 * declaran (dpkg, hashcat -o, el consolidado de cron vía sleep) en vez de
 * perderlos. Idempotente para los que ya mutan machine.files, y no cambia la
 * respuesta: el snapshot declarado sigue siendo el que aplica el store.
 */
export function materializeDeclared(machine: Pick<Machine, 'files'>, declared?: FileEntry[]): void {
  if (!declared || declared.length === 0) return;
  machine.files = upsertFiles(machine.files, declared);
}

/**
 * Snapshot con paths únicos (gana la última entrada, que es la más nueva).
 * Devuelve el MISMO array si no había repetidos: en el camino normal el
 * store no copia el árbol entero para nada.
 */
export function uniqueFiles(files: FileEntry[]): FileEntry[] {
  const seen = new Map<string, FileEntry>();
  let duplicated = false;
  for (const f of files) {
    if (seen.has(f.path)) duplicated = true;
    seen.set(f.path, f);
  }
  return duplicated ? [...seen.values()] : files;
}
