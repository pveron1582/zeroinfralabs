import type { CommandContext, CommandResponse } from '../../types';
import { getCurrentUser, getUsers } from '../../utils/users';

export const cmd_su = {
  name: 'su',
  description: 'Switch user',
  execute: (args: string[], { machine }: CommandContext): CommandResponse => {
    const loginFlags = ['-', '-i', '-l', '--login'];
    let targetUser = 'root';
    if (args.length > 0 && !loginFlags.includes(args[0])) {
      targetUser = args[0];
    } else if (args.length > 1 && loginFlags.includes(args[0])) {
      targetUser = args[1];
    }

    if (targetUser.startsWith('-')) {
      return { output: `su: invalid option -- '${targetUser.slice(1)}'`, isError: true };
    }

    const currentUser = getCurrentUser(machine);
    if (currentUser.username === targetUser) {
      return { output: `su: already ${targetUser}`, isError: false };
    }

    const users = getUsers(machine);
    const exists = users.find(u => u.username === targetUser);
    if (!exists) {
      return { output: `su: user ${targetUser} does not exist`, isError: true };
    }

    // `su` pide la password del usuario DESTINO cuando el invocante NO es root
    // (ej: kali → root). El terminal lee `requiresPassword` y muestra una línea
    // estilo "user@host's password: "; el CommandRunner valida contra
    // known_passwords y recién entonces cambia el usuario (su_user).
    // Root, en cambio, tiene autoridad: cambia a cualquier usuario de menor
    // privilegio SIN password (root → kali). El CommandRunner aplica el switch
    // al instante vía `suUserApplied` (setSuUser + pushIdentity).
    if (currentUser.uid !== 0) {
      return { output: ``, isError: false, requiresPassword: true, suTarget: targetUser };
    }
    return { output: ``, isError: false, suUserApplied: targetUser };
  },
};
