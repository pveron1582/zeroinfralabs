// ── components/__tests__/AnimatedBrowser.test.tsx ──────────────────────
// Tests for the AnimatedBrowser mockup component

import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AnimatedBrowser } from '../AnimatedBrowser';

beforeEach(() => {
  localStorage.clear();
});

describe('AnimatedBrowser', () => {
  it('debe renderizar la barra de Firefox', () => {
    render(<AnimatedBrowser />);
    expect(screen.getByText('Firefox ESR')).toBeInTheDocument();
  });

  it('debe mostrar la URL por defecto', () => {
    render(<AnimatedBrowser />);
    expect(screen.getByText('http://192.168.1.11/wp-login.php')).toBeInTheDocument();
  });

  it('debe mostrar el form de login inicialmente', () => {
    render(<AnimatedBrowser />);
    expect(screen.getByText(/Username/)).toBeInTheDocument();
    expect(screen.getByText(/Password/)).toBeInTheDocument();
  });

  it('debe mostrar el icono de WordPress', () => {
    const { container } = render(<AnimatedBrowser />);
    expect(container.textContent).toContain('W');
  });
});
