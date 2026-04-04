// ── laboratorios/attackers/index.ts ────────────────────────────────
// Registry centralizado de máquinas atacantes
// Cada tipo de máquina atacante se registra acá

export { createKaliMachine, createKaliFilesystem, resetKaliCounter } from './kali';
export type { KaliMachineOptions } from './kali';
export { ROCKYOU_CONTENT, COMMON_TXT_CONTENT, PASSWORDS_LIST_CONTENT } from './kali';

// Future attackers:
// export { createParrotMachine } from './parrot';
// export { createArchMachine } from './arch';
