// ── components/__tests__/AnimatedTerminal.test.tsx ──────────────────────
// Tests for the AnimatedTerminal mockup component

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnimatedTerminal } from '../AnimatedTerminal';

beforeEach(() => {
  localStorage.clear();
});

describe('AnimatedTerminal', () => {
  it('debe renderizar la barra de título del terminal', () => {
    render(
      <AnimatedTerminal
        prompt="root@kali:~$"
        command="ls"
        outputLines={['file.txt', 'folder/']}
      />
    );
    expect(screen.getByText('root@kali')).toBeInTheDocument();
  });

  it('debe mostrar el prompt correcto', () => {
    render(
      <AnimatedTerminal
        prompt="root@kali:~$"
        command="ls"
        outputLines={['file.txt']}
      />
    );
    expect(screen.getByText('root㉿kali')).toBeInTheDocument();
  });

  it('debe renderizar con color de acento personalizado', () => {
    const { container } = render(
      <AnimatedTerminal
        prompt="root@kali:~$"
        command="ls"
        outputLines={['test']}
        accentColor="#f87171"
      />
    );
    const box = container.firstChild as HTMLElement;
    expect(box).toHaveStyle({ boxShadow: expect.stringContaining('f87171') });
  });

  it('debe mostrar un título si se provee', () => {
    render(
      <AnimatedTerminal
        title="Network scan"
        prompt="root@kali:~$"
        command="nmap"
        outputLines={['test']}
      />
    );
    expect(screen.getByText('Network scan')).toBeInTheDocument();
  });
});
