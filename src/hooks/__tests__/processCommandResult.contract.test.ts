// ── hooks/__tests__/processCommandResult.contract.test.ts ──────────
// El contrato de CommandResponse es la columna vertebral del proyecto
// (AGENTS.md: "los campos de metadata en CommandResponse SON el contrato").
// Antes, processCommandResult era una cadena de 20 `if ('x' in result)`:
// agregar un campo al contrato era un no-op silencioso — se olvidaba el
// handler y nadie se enteraba hasta que una misión no validaba.
//
// Acá hay dos redes:
//  1. tsc: el tipo de `handlers` es un mapeo EXHAUSTIVO del contrato, así
//     que un campo nuevo sin handler no compila (esto no lo prueba un test).
//  2. este test: congela el conjunto de claves, para que un campo nuevo
//     quede con un handler vacío sin decidir y alguien tenga que mirarlo.

import { describe, it, expect } from 'vitest';
import { handlers } from '../processCommandResult';

/**
 * Claves de la tabla EN ORDEN DE EJECUCIÓN (no alfabético): el orden es
 * semántico, así que un reordenamiento tiene que romper este test a propósito.
 */
const CLAVES = Object.keys(handlers);

describe('processCommandResult — contrato de handlers', () => {
  it('tiene un handler para cada campo del contrato, y ni uno de más', () => {
    // Si agregás un campo a CmdResponseBase o a una variante, tsc te obliga a
    // escribir el handler. Esta lista es la segunda red: cuando el handler es
    // `() => {}` por decisión, queda escrito acá y es visible en el diff.
    expect(CLAVES).toEqual([
      // ── con efecto real (orden de ejecución) ──
      'completedMissionId',    // misión completada
      'filesChanged',          // al store ANTES de validar
      'createdFiles',          // loot al atacante
      'blockingCommand',       // nc -l / msfconsole / tails
      'desktopAction',         // mstsc / xrdp
      'foundCredentials',      // + verificación cruzada con newMachineId
      'failedUser',
      'sudoPrivileges',
      'identityExit',          // exit de un su
      'newMachineId',          // exploit → víctima
      'sshLoginUser',          // home del usuario conectado
      'sshSessionClosed',      // cierra sesión → /root/
      'privescCompleted',      // sudo su / sudo vim
      'suUserApplied',         // su sin password (root authority)
      'requiresPassword',      // su / sudo -i esperando password
      'possibleUsers',
      'pythonPendingInput',    // python3 esperando input()
      'foundVulnerability',
      'nanoFile',              // editor abierto
      // ── metadata que consumen otros (handler vacío A PROPÓSITO) ──
      'output',                // lo pinta el Terminal
      'isError',               // color de la línea
      'streamingLineDelays',   // useRunCommand
      'privescAttempted',      // LabValidator
      'privescTool',           // LabValidator
      'privescViaSudo',        // LabValidator
      'fileRead',              // LabValidator
      'downloadedFile',        // useDownloadedFile
      'scanResults',           // LabValidator + NetworkMap
      'foundDirectories',      // LabValidator
      'discoveredHosts',       // NetworkMap
      'discoveredPorts',       // NetworkMap
      'networkScanned',        // NetworkMap
      'sshSession',            // ShellManager
      'ftpSession',            // useFtpSession
      'rdpSession',            // useRunCommand
      'uidChecked',            // LabValidator
      'currentUser',           // LabValidator
      'isSystem',              // LabValidator
      'exitTerminal',          // useRunCommand
      'suTarget',              // se consume con requiresPassword
      'sudoEscalation',        // se consume con requiresPassword
      'sudoCwd',               // se consume con requiresPassword
      'msfStateUpdate',        // commands/executor
      'psStateUpdate',         // commands/executor
      'browserAction',         // fakebrowser/browserMission
      'httpRequest',           // BurpSuite
      'httpResponse',          // BurpSuite
      'clearScreen',           // useRunCommand (petición de UI, P0.4)
      'exitToLanding',         // useRunCommand (petición de UI, P0.4)
      'type',                  // discriminante de la unión de variantes
    ]);
  });

  it('no hay claves duplicadas ni handlers undefined', () => {
    expect(new Set(CLAVES).size).toBe(CLAVES.length);
    for (const [campo, fn] of Object.entries(handlers)) {
      expect(typeof fn, campo).toBe('function');
    }
  });

  it('el pseudo-paso de validación de misiones existe (filesChanged) y está en la tabla', () => {
    // La validación no es un campo, pero se inyecta después de `filesChanged`
    // porque el validador puede leer el filesystem ya actualizado. Si se
    // renombra ese handler, el dispatcher lo vuelve a inyectar al final, pero
    // este test obliga a revisar el punto de inyección.
    expect(CLAVES).toContain('filesChanged');
  });
});
