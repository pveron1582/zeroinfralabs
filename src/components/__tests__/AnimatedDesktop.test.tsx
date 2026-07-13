// ── components/__tests__/AnimatedDesktop.test.tsx ─────────────────

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AnimatedDesktop } from '../AnimatedDesktop';

describe('AnimatedDesktop', () => {
  it('debe renderizar el escritorio Kali con barra superior', async () => {
    render(<AnimatedDesktop />);
    await waitFor(() => {
      expect(screen.getByText('Applications')).toBeInTheDocument();
      expect(screen.getByText('Terminal')).toBeInTheDocument();
      expect(screen.getByText('Chrome')).toBeInTheDocument();
    });
  });

  it('debe mostrar etiquetas en español', async () => {
    render(<AnimatedDesktop isEs />);
    await waitFor(() => {
      expect(screen.getByText('Aplicaciones')).toBeInTheDocument();
    });
  });
});
