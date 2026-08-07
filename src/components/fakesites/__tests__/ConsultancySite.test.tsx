// ── components/fakesites/__tests__/ConsultancySite.test.tsx ──────────
// Tests for the ConsultancySite fake site component

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConsultancySite } from '../ConsultancySite';

describe('ConsultancySite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar el logo y nombre DevConsultancy', () => {
    render(<ConsultancySite />);
    const logos = screen.getAllByText('DevConsultancy');
    expect(logos.length).toBeGreaterThanOrEqual(1);
    // DC logo badge
    const dcBadges = screen.getAllByText('DC');
    expect(dcBadges.length).toBeGreaterThanOrEqual(1);
  });

  it('debe mostrar la navegación principal', () => {
    render(<ConsultancySite />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Team')).toBeInTheDocument();
    // Contact appears both in navbar and footer, so use getAllByText
    expect(screen.getAllByText('Contact').length).toBeGreaterThanOrEqual(1);
  });

  it('debe mostrar el botón Hire Us', () => {
    render(<ConsultancySite />);
    expect(screen.getByText('Hire Us')).toBeInTheDocument();
  });

  it('debe renderizar el hero section con título y descripción', () => {
    render(<ConsultancySite />);
    expect(screen.getByText(/Premium/)).toBeInTheDocument();
    expect(screen.getByText(/Web Solutions/)).toBeInTheDocument();
    expect(screen.getByText(/transform ideas/i)).toBeInTheDocument();
  });

  it('debe mostrar los enlaces del hero (Our Services y Meet the Team)', () => {
    render(<ConsultancySite />);
    expect(screen.getByText('Our Services')).toBeInTheDocument();
    expect(screen.getByText('Meet the Team')).toBeInTheDocument();
  });

  it('debe mostrar la sección de servicios digitales', () => {
    render(<ConsultancySite />);
    expect(screen.getByText('Digital Services')).toBeInTheDocument();
    expect(screen.getByText('Web Development')).toBeInTheDocument();
    expect(screen.getByText('Hosting & Cloud')).toBeInTheDocument();
    expect(screen.getByText('Enterprise Apps')).toBeInTheDocument();
  });

  it('debe mostrar descripciones de los servicios', () => {
    render(<ConsultancySite />);
    expect(screen.getByText(/Corporate websites/i)).toBeInTheDocument();
    expect(screen.getByText(/Robust infrastructure/i)).toBeInTheDocument();
    expect(screen.getByText(/custom tools/i)).toBeInTheDocument();
  });

  it('debe mostrar la sección del equipo con título', () => {
    render(<ConsultancySite />);
    expect(screen.getByText('Our Team')).toBeInTheDocument();
    expect(screen.getByText(/Professionals passionate/i)).toBeInTheDocument();
  });

  it('debe mostrar los 4 miembros del equipo con sus datos', () => {
    render(<ConsultancySite />);
    expect(screen.getByText('Pedro Sánchez')).toBeInTheDocument();
    expect(screen.getByText('Gonzalo Ruiz')).toBeInTheDocument();
    expect(screen.getByText('Arturo Vidal')).toBeInTheDocument();
    expect(screen.getByText('Lucía Fernández')).toBeInTheDocument();
  });

  it('debe mostrar los roles de cada miembro', () => {
    render(<ConsultancySite />);
    expect(screen.getByText('Senior Web Developer')).toBeInTheDocument();
    expect(screen.getByText('Systems Administrator')).toBeInTheDocument();
    expect(screen.getByText('UX/UI Designer')).toBeInTheDocument();
    expect(screen.getByText('Project Manager')).toBeInTheDocument();
  });

  it('debe mostrar los emails de cada miembro', () => {
    render(<ConsultancySite />);
    expect(screen.getByText('psanchez@devconsultancy.com')).toBeInTheDocument();
    expect(screen.getByText('gruiz@devconsultancy.com')).toBeInTheDocument();
    expect(screen.getByText('avidal@devconsultancy.com')).toBeInTheDocument();
    expect(screen.getByText('lfernandez@devconsultancy.com')).toBeInTheDocument();
  });

  it('debe mostrar los avatares (iniciales) de cada miembro', () => {
    render(<ConsultancySite />);
    const avatarP = screen.getAllByText('P');
    const avatarG = screen.getAllByText('G');
    const avatarA = screen.getAllByText('A');
    const avatarL = screen.getAllByText('L');
    expect(avatarP.length).toBeGreaterThanOrEqual(1);
    expect(avatarG.length).toBeGreaterThanOrEqual(1);
    expect(avatarA.length).toBeGreaterThanOrEqual(1);
    expect(avatarL.length).toBeGreaterThanOrEqual(1);
  });

  it('debe mostrar el footer con links legales', () => {
    render(<ConsultancySite />);
    expect(screen.getByText('Legal Notice')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText(/© 2024 DevConsultancy/)).toBeInTheDocument();
  });

  it('debe llamar onViewTeam con los usernames al montar', () => {
    const onViewTeam = vi.fn();
    render(<ConsultancySite onViewTeam={onViewTeam} />);
    expect(onViewTeam).toHaveBeenCalledWith(['pedro', 'gonzalo', 'arturo', 'lucia']);
  });

  it('debe llamar onViewTeam solo una vez aunque se re-renderice', () => {
    const onViewTeam = vi.fn();
    const { rerender } = render(<ConsultancySite onViewTeam={onViewTeam} />);
    rerender(<ConsultancySite onViewTeam={onViewTeam} />);
    expect(onViewTeam).toHaveBeenCalledTimes(1);
  });

  it('no debe fallar si onViewTeam no está definido', () => {
    expect(() => render(<ConsultancySite />)).not.toThrow();
  });

  it('no debe fallar si onNavigate no está definido', () => {
    expect(() => render(<ConsultancySite />)).not.toThrow();
  });

  it('debe prevenir la navegación por defecto en los links', () => {
    render(<ConsultancySite />);
    const homeLink = screen.getByText('Home');
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    const prevented = !homeLink.dispatchEvent(event);
    expect(prevented).toBe(true);
  });

  it('debe tener las secciones con ids servicios y equipo', () => {
    render(<ConsultancySite />);
    expect(document.getElementById('servicios')).toBeInTheDocument();
    expect(document.getElementById('equipo')).toBeInTheDocument();
  });

  it('debe renderizar SVGs de iconos de servicios', () => {
    const { container } = render(<ConsultancySite />);
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(3);
  });

  it('debe tener la nav sticky en la parte superior', () => {
    const { container } = render(<ConsultancySite />);
    const nav = container.querySelector('nav');
    expect(nav).toBeInTheDocument();
    expect(nav?.className).toContain('sticky');
    expect(nav?.className).toContain('top-0');
  });
});
