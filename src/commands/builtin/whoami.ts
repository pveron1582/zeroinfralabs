import type { CommandContext, CommandResponse } from '../../types';
import { getCurrentUser } from '../../utils/users';

export const cmd_whoami = {
  name: 'whoami',
  execute: (_: string[], { machine }: CommandContext): CommandResponse => {
    const user = getCurrentUser(machine);
    return { output: user.username };
  }
};
