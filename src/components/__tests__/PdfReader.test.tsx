// ── components/__tests__/PdfReader.test.tsx ──────────────────────
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PdfReader } from '../PdfReader';

describe('PdfReader', () => {
  it('debe renderizar el lector con el manual embebido', () => {
    render(<PdfReader isEs />);

    expect(screen.getByText('ZeroPDF')).toBeInTheDocument();
    expect(screen.getByText('manual.pdf')).toBeInTheDocument();
    expect(screen.getByText('Página 1 de 1')).toBeInTheDocument();

    const iframe = screen.getByTestId('pdf-iframe');
    expect(iframe).toHaveAttribute('src', '/docs/manual.pdf');
  });

  it('debe mostrar el manual en inglés cuando isEs es false', () => {
    render(<PdfReader isEs={false} />);

    expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
    expect(screen.getByText('manual-en.pdf')).toBeInTheDocument();

    const iframe = screen.getByTestId('pdf-iframe');
    expect(iframe).toHaveAttribute('src', '/docs/manual-en.pdf');
  });
});
