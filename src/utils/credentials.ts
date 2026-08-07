// ── utils/credentials.ts ───────────────────────────────────────────
// Sistema central de usuario/password por máquina.
// Cada máquina de laboratorio define `known_passwords` (root + usuarios
// normales). Este módulo unifica esa tabla con las credenciales de
// puertos (ssh/ftp) y expone helpers para validar `su`, `ssh` y `hydra`.
// El atacante (Kali) es root por diseño y nunca tiene tabla de passwords.

import type { Machine, User } from '../types';
import { getCurrentUser, getUser } from './users';

export interface SessionInfo {
  user: User;
  password?: string;
}

const LOGIN_SHELLS = ['/bin/bash', '/bin/sh', '/bin/dash', '/bin/zsh'];

function getPortCredentials(machine: Machine): Record<string, string> {
  const table: Record<string, string> = {};
  for (const p of machine.scan_results?.ports ?? []) {
    if (p.credentials?.user && p.credentials.pass) {
      table[p.credentials.user] = p.credentials.pass;
    }
  }
  return table;
}

// Tabla unificada de passwords de la máquina: `known_passwords` de la
// definición del lab + credenciales embebidas en puertos (ssh/ftp).
export function getMachineCredentials(machine: Machine): Record<string, string> {
  return { ...(machine.known_passwords ?? {}), ...getPortCredentials(machine) };
}

// Password de un usuario concreto en la máquina (si el sistema la conoce).
export function getKnownPassword(machine: Machine, username: string): string | undefined {
  return getMachineCredentials(machine)[username];
}

// ¿El usuario tiene una shell con la que puede iniciar sesión?
export function hasLoginShell(machine: Machine, username: string): boolean {
  const user = getUser(machine, username);
  if (!user) return false;
  return user.uid === 0 || LOGIN_SHELLS.includes(user.shell);
}

// Validación central de `su` (y futuros mecanismos de login local).
// La password debe coincidir con la tabla de la máquina (known_passwords +
// credenciales de puertos). Usuarios sin password registrada (o de servicio)
// son rechazados: no hay fallback password=username.
export function validatePassword(machine: Machine, username: string, password: string): boolean {
  const known = getKnownPassword(machine, username);
  return known !== undefined && password === known;
}

// Sesión actual: el usuario con el que se está conectado a la máquina y,
// si el sistema la conoce, la password con la que se ingresó.
// La password proviene de credenciales verificadas (ssh/reverse-shell) o
// de la tabla de la máquina. El atacante (root por diseño) no tiene password.
export function getCurrentSession(machine: Machine): SessionInfo {
  const user = getCurrentUser(machine);
  let password = getKnownPassword(machine, user.username);
  if (password === undefined) {
    const verified = machine.found_credentials?.find(
      c => c.user === user.username && c.verified && !!c.pass,
    );
    password = verified?.pass;
  }
  return { user, password };
}
