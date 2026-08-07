// ── commands/builtin/groups.ts ──────────────────────────────────────
// Comando groups: Muestra los grupos del usuario actual o de otro usuario

import type { CommandContext, CommandResponse } from '../../types';
import { getCurrentUser, getUsers, getGroups } from '../../utils/users';

export const cmd_groups = {
  name: 'groups',
  execute: (args: string[], { machine }: CommandContext): CommandResponse => {
    const users = getUsers(machine);
    const allGroups = getGroups(machine);

    let targetUser = getCurrentUser(machine);
    let targetName = targetUser.username;

    if (args.length > 0) {
      targetName = args[0];
      const found = users.find(u => u.username === targetName);
      if (!found) {
        return { output: `groups: '${targetName}': no such user`, isError: true };
      }
      targetUser = found;
    }

    const userGroups = allGroups.filter(g =>
      g.members.includes(targetUser.username) || g.gid === targetUser.gid
    );

    return {
      output: `${targetName} : ${userGroups.map(g => g.name).join(' ')}`
    };
  }
};