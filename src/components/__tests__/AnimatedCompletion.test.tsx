// ── components/__tests__/AnimatedCompletion.test.tsx ──────────────────────
// Tests for the AnimatedCompletion mockup component

import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnimatedCompletion } from '../AnimatedCompletion';

beforeEach(() => {
  localStorage.clear();
});

describe('AnimatedCompletion', () => {
  it('debe mostrar el título LAB COMPLETED', () => {
    render(<AnimatedCompletion />);
    expect(screen.getByText('LAB COMPLETED')).toBeInTheDocument();
  });

  it('debe mostrar el trofeo', () => {
    const { container } = render(<AnimatedCompletion />);
    expect(container.textContent).toContain('🏆');
  });

  it('debe mostrar el nombre del lab', () => {
    render(<AnimatedCompletion labName="Custom Lab" />);
    expect(screen.getByText('Custom Lab')).toBeInTheDocument();
  });

  it('debe mostrar el progreso de misiones', () => {
    render(<AnimatedCompletion missionsCompleted={8} totalMissions={8} />);
    expect(screen.getByText('8/8 missions')).toBeInTheDocument();
  });

  it('debe mostrar la flag oculta', () => {
    const { container } = render(<AnimatedCompletion />);
    expect(container.textContent).toContain('ZIL{');
    expect(container.textContent).toContain('***************');
  });

  it('debe usar progreso personalizado', () => {
    render(<AnimatedCompletion missionsCompleted={5} totalMissions={8} />);
    expect(screen.getByText('5/8 missions')).toBeInTheDocument();
  });
});
