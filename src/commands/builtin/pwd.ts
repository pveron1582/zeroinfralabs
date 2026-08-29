import type { CommandContext, CommandResponse } from '../../types';

export const cmd_pwd = {
  name: 'pwd',
  execute: (_: string[], { currentDir }: CommandContext): CommandResponse => {
    return { output: currentDir || '/' };
  }
};
