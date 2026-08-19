import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChunkErrorBoundary } from '../ChunkErrorBoundary';

function Boom({ shouldThrow }: { shouldThrow?: boolean }) {
  if (shouldThrow) throw new Error('Failed to fetch dynamically imported module');
  return <div>contenido ok</div>;
}

describe('ChunkErrorBoundary', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('debe renderizar sus children cuando no hay error', () => {
    render(<ChunkErrorBoundary><Boom /></ChunkErrorBoundary>);
    expect(screen.getByText('contenido ok')).toBeInTheDocument();
  });

  it('debe limpiar el flag de recarga al montar sin error', () => {
    sessionStorage.setItem('zilabs-chunk-reload', '1');
    render(<ChunkErrorBoundary><Boom /></ChunkErrorBoundary>);
    expect(sessionStorage.getItem('zilabs-chunk-reload')).toBeNull();
  });

  it('debe recargar automaticamente al primer error de chunk', () => {
    const reloadSpy = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload: reloadSpy },
      writable: true,
    });

    render(<ChunkErrorBoundary><Boom shouldThrow /></ChunkErrorBoundary>);

    expect(reloadSpy).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem('zilabs-chunk-reload')).toBe('1');
  });

  it('debe mostrar aviso manual si el error persiste tras el reload', () => {
    const reloadSpy = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload: reloadSpy },
      writable: true,
    });
    // Simula que ya se recargo una vez y el error persiste
    sessionStorage.setItem('zilabs-chunk-reload', '1');

    render(<ChunkErrorBoundary><Boom shouldThrow /></ChunkErrorBoundary>);

    expect(reloadSpy).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /recargar|reload/i })).toBeInTheDocument();
    expect(sessionStorage.getItem('zilabs-chunk-reload')).toBeNull();
  });

  it('debe recargar al hacer clic en el boton Recargar', () => {
    const reloadSpy = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload: reloadSpy },
      writable: true,
    });
    sessionStorage.setItem('zilabs-chunk-reload', '1');

    render(<ChunkErrorBoundary><Boom shouldThrow /></ChunkErrorBoundary>);
    fireEvent.click(screen.getByRole('button', { name: /recargar|reload/i }));

    expect(reloadSpy).toHaveBeenCalledTimes(1);
  });
});
