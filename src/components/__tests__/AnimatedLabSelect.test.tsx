// ── components/__tests__/AnimatedLabSelect.test.tsx ──────────────────────
// Tests for the AnimatedLabSelect mockup component

import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnimatedLabSelect } from '../AnimatedLabSelect';

beforeEach(() => {
  localStorage.clear();
});

describe('AnimatedLabSelect', () => {
  it('debe renderizar el header con título', () => {
    render(<AnimatedLabSelect />);
    expect(screen.getByText('ZI Labs — Choose a Lab')).toBeInTheDocument();
  });

  it('debe mostrar las tarjetas de labs', () => {
    render(<AnimatedLabSelect />);
    expect(screen.getByText('WordPress Vulnerable Lab')).toBeInTheDocument();
  });

  it('debe mostrar el botón START', () => {
    render(<AnimatedLabSelect />);
    expect(screen.getAllByText('START').length).toBeGreaterThanOrEqual(1);
  });

  it('debe mostrar los números hexadecimales de los labs', () => {
    render(<AnimatedLabSelect />);
    expect(screen.getByText('0x01')).toBeInTheDocument();
    expect(screen.getByText('0x02')).toBeInTheDocument();
    expect(screen.getByText('0x03')).toBeInTheDocument();
  });

  it('debe mostrar las dificultades', () => {
    render(<AnimatedLabSelect />);
    expect(screen.getAllByText('Easy').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Medium').length).toBeGreaterThanOrEqual(1);
  });

  it('debe mostrar el conteo de misiones', () => {
    render(<AnimatedLabSelect />);
    expect(screen.getByText('8 missions')).toBeInTheDocument();
  });
});
