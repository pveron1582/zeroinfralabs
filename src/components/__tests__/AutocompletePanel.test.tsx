// ── components/__tests__/AutocompletePanel.test.tsx ────────────────
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { AutocompletePanel } from '../AutocompletePanel';

describe('AutocompletePanel', () => {
  it('no debe renderizar si no hay sugerencias', () => {
    const { container } = render(
      <AutocompletePanel suggestions={[]} selectedIndex={-1} onSelect={vi.fn()} termColor="#10b981" />
    );
    expect(container.firstChild).toBeNull();
  });

  it('debe renderizar sugerencias de archivos con icono de archivo', () => {
    render(
      <AutocompletePanel suggestions={['passwd', 'shadow']} selectedIndex={0} onSelect={vi.fn()} termColor="#10b981" />
    );
    expect(screen.getByText('passwd')).toBeInTheDocument();
    expect(screen.getByText('shadow')).toBeInTheDocument();
  });

  it('debe renderizar sugerencias de directorios con icono de carpeta', () => {
    render(
      <AutocompletePanel suggestions={['etc/', 'var/']} selectedIndex={-1} onSelect={vi.fn()} termColor="#10b981" />
    );
    expect(screen.getByText('etc/')).toBeInTheDocument();
    expect(screen.getByText('var/')).toBeInTheDocument();
  });

  it('debe resaltar la sugerencia seleccionada', () => {
    const { container } = render(
      <AutocompletePanel suggestions={['passwd', 'shadow']} selectedIndex={1} onSelect={vi.fn()} termColor="#10b981" />
    );
    const items = container.querySelectorAll('[class*="px-3"]');
    expect(items[1].className).toContain('bg-gray-700');
  });

  it('debe llamar onSelect al hacer click en una sugerencia', () => {
    const onSelect = vi.fn();
    render(
      <AutocompletePanel suggestions={['passwd', 'shadow']} selectedIndex={-1} onSelect={onSelect} termColor="#10b981" />
    );
    fireEvent.click(screen.getByText('passwd'));
    expect(onSelect).toHaveBeenCalledWith('passwd');
  });

  it('debe mezclar archivos y directorios correctamente', () => {
    render(
      <AutocompletePanel suggestions={['etc/', 'passwd', 'var/', 'shadow']} selectedIndex={0} onSelect={vi.fn()} termColor="#10b981" />
    );
    expect(screen.getByText('etc/')).toBeInTheDocument();
    expect(screen.getByText('passwd')).toBeInTheDocument();
    expect(screen.getByText('var/')).toBeInTheDocument();
    expect(screen.getByText('shadow')).toBeInTheDocument();
  });
});
