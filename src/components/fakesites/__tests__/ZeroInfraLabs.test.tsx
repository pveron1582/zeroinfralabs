// ── components/fakesites/__tests__/ZeroInfraLabs.test.tsx ──────────
// Tests for the ZeroInfraLabs fake site component

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ZeroInfraLabs } from '../ZeroInfraLabs';

describe('ZeroInfraLabs', () => {
  it('debe renderizar el título principal', () => {
    render(<ZeroInfraLabs />);
    expect(screen.getByText('ZeroInfra Labs')).toBeInTheDocument();
  });

  it('debe mostrar la URL del sitio', () => {
    render(<ZeroInfraLabs />);
    expect(screen.getByText('zeroinfralabs.vercel.app')).toBeInTheDocument();
  });

  it('debe mostrar el subtítulo en español', () => {
    render(<ZeroInfraLabs />);
    expect(screen.getByText('La infraestructura que no existe, funciona mejor.')).toBeInTheDocument();
  });

  it('debe mostrar la cita irónica', () => {
    render(<ZeroInfraLabs />);
    expect(screen.getByText(/zero infrastructure.*zero problems/i)).toBeInTheDocument();
  });

  it('debe mostrar las 3 tarjetas de servicios ficticios', () => {
    render(<ZeroInfraLabs />);
    expect(screen.getByText('Cloud Null')).toBeInTheDocument();
    expect(screen.getByText('Seguridad Imaginaria')).toBeInTheDocument();
    expect(screen.getByText('Deploy Instantáneo')).toBeInTheDocument();
  });

  it('debe mostrar las descripciones de cada servicio', () => {
    render(<ZeroInfraLabs />);
    expect(screen.getByText(/servidores que no existen/i)).toBeInTheDocument();
    expect(screen.getByText(/no hay infraestructura, no hay brechas/i)).toBeInTheDocument();
    expect(screen.getByText(/git push a \/dev\/null/i)).toBeInTheDocument();
  });

  it('debe mostrar los emojis de los servicios', () => {
    render(<ZeroInfraLabs />);
    expect(screen.getByText('☁️')).toBeInTheDocument();
    expect(screen.getByText('🔒')).toBeInTheDocument();
    expect(screen.getByText('🚀')).toBeInTheDocument();
  });

  it('debe mostrar la sección de labs simulados', () => {
    render(<ZeroInfraLabs />);
    expect(screen.getByText('Nuestros Labs (simulados)')).toBeInTheDocument();
  });

  it('debe mostrar las etiquetas de labs', () => {
    render(<ZeroInfraLabs />);
    expect(screen.getByText('Web OSINT')).toBeInTheDocument();
    expect(screen.getByText('SSH Brute Force')).toBeInTheDocument();
    expect(screen.getByText('WordPress')).toBeInTheDocument();
    expect(screen.getByText('LFI')).toBeInTheDocument();
    expect(screen.getByText('SQL Injection')).toBeInTheDocument();
    expect(screen.getByText('PrivEsc')).toBeInTheDocument();
  });

  it('debe mostrar el footer con disclaimer', () => {
    render(<ZeroInfraLabs />);
    expect(screen.getByText(/Hecho con.*por el equipo de ZeroInfra/)).toBeInTheDocument();
    expect(screen.getByText(/Esta página es puramente ficticia/i)).toBeInTheDocument();
  });

  it('debe tener el emoji ⚡ junto a la URL', () => {
    render(<ZeroInfraLabs />);
    expect(screen.getByText('⚡')).toBeInTheDocument();
  });

  it('debe renderizar con fondo degradado oscuro', () => {
    const { container } = render(<ZeroInfraLabs />);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain('bg-gradient-to-br');
    expect(root.className).toContain('from-gray-900');
  });

  it('debe tener 6 etiquetas de labs en formato pill', () => {
    const { container } = render(<ZeroInfraLabs />);
    const pills = container.querySelectorAll('.rounded-full.text-sm.font-mono');
    expect(pills.length).toBe(6);
  });

  it('debe tener las tarjetas con bordes hover personalizados', () => {
    const { container } = render(<ZeroInfraLabs />);
    const cards = container.querySelectorAll('.rounded-xl.p-6.border');
    expect(cards.length).toBe(3);
  });

  it('debe renderizar el título con gradiente de texto', () => {
    render(<ZeroInfraLabs />);
    const title = screen.getByText('ZeroInfra Labs');
    expect(title.className).toContain('bg-gradient-to-r');
    expect(title.className).toContain('bg-clip-text');
    expect(title.className).toContain('text-transparent');
  });
});
