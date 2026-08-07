// ── commands/builtin/id.ts ──────────────────────────────────────────
// Comando id: Muestra uid, gid y grupos del usuario actual

import type { CommandContext, CommandResponse } from '../../types';
import { getCurrentUser, getUsers, getGroups } from '../../utils/users';

export const cmd_id = {
  name: 'id',
  execute: (args: string[], { machine }: CommandContext): CommandResponse => {
    const users = getUsers(machine);
    const groups = getGroups(machine);

    if (args.length > 0) {
      // id <username> — mostrar info de otro usuario
      const targetUser = users.find(u => u.username === args[0]);
      if (!targetUser) {
        return { output: `id: '${args[0]}': no such user`, isError: true };
      }
      const userGroups = groups.filter(g =>
        g.members.includes(targetUser.username) || g.gid === targetUser.gid
      );
      const groupNames = userGroups.map(g => `${g.name}(${g.gid})`).join(' ');
      return {
        output: `uid=${targetUser.uid}(${targetUser.username}) gid=${targetUser.gid}(${userGroups.find(g => g.gid === targetUser.gid)?.name || targetUser.gid}) groups=${groupNames}`
      };
    }

    // id — mostrar info del usuario actual
    const currentUser = getCurrentUser(machine);
    const userGroups = groups.filter(g =>
      g.members.includes(currentUser.username) || g.gid === currentUser.gid
    );
    const groupNames = userGroups.map(g => `${g.name}(${g.gid})`).join(' ');

    return {
      output: `uid=${currentUser.uid}(${currentUser.username}) gid=${currentUser.gid}(${userGroups.find(g => g.gid === currentUser.gid)?.name || currentUser.gid}) groups=${groupNames}`
    };
  }
};