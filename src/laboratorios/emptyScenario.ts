// ── laboratorios/emptyScenario.ts ─────────────────────────────────
// Escenario vacío: el estado de partida del workspace cuando todavía no se
// eligió un lab. Existe para que el STORE no dependa de los labs (P1 3.3):
// el slice se crea con un workspace en blanco y el lab entra por
// selectScenario(id), que resuelve contra el registro.
//
// Es una hoja: solo importa tipos.

import type { Scenario } from '../types';

export function emptyScenario(): Scenario {
  return {
    id: 'empty',
    name: 'Sin escenario',
    description: 'Ningún laboratorio seleccionado',
    difficulty: 'n/a',
    category: 'none',
    network_range: '',
    initialMachineId: '',
    machines: [],
    missions: [],
  };
}
