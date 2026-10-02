// ── components/__tests__/academy-legacy-routes.test.tsx ────────────
// URLs legacy de la Academy: las que ya no existen porque los ids
// cambiaron en el rework de rutas (2026-10) pero que siguen llegando por
// bookmarks y SEO viejo. Acá se cubre el RENDER de las redirecciones;
// el contrato de los alias está en `academy/__tests__/legacy-ids.test.ts`.
//
// Se sacaron de Academy.test.tsx (366 líneas ya) para no agrandarla más.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useScenarioStore } from '../../store/scenarioStore';
import { renderAcademy } from './academyRender';

vi.mock('../landing/SiteHeader', () => ({
  SiteHeader: () => <header data-testid="site-header">header</header>,
}));

vi.mock('../landing/MarketingFooter', () => ({
  MarketingFooter: () => <footer data-testid="footer">footer</footer>,
}));

describe('Academy — URLs legacy', () => {
  beforeEach(() => {
    useScenarioStore.setState({ language: 'es', completedLessons: [] });
  });

  it('redirige la URL legacy /academy/os a /academy/linux', () => {
    renderAcademy('/es/academy/os');
    expect(screen.getByRole('heading', { name: 'Linux' })).toBeInTheDocument();
    expect(screen.getByText('Por qué Linux: historia, software libre y dónde vive')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Windows/ })).not.toBeInTheDocument();
  });

  it('redirige la URL legacy /academy/os/module/<sub> a /academy/<sub>', () => {
    renderAcademy('/es/academy/os/module/windows');
    expect(screen.getByRole('heading', { name: 'Windows' })).toBeInTheDocument();
    expect(screen.getByText('Historia de Windows: orígenes, versiones y el modelo privativo')).toBeInTheDocument();
  });

  it('redirige la URL legacy /academy/redes a /academy/fundaments', () => {
    renderAcademy('/es/academy/redes');
    expect(screen.getByText('¿Qué es una red? Tipos: LAN, MAN, WAN y VPN')).toBeInTheDocument();
  });

  it('redirige la URL legacy /academy/ciberseguridad a /academy/ciber', () => {
    renderAcademy('/es/academy/ciberseguridad');
    expect(screen.getByText('La triada CID con ejemplos reales')).toBeInTheDocument();
  });

  it('redirige la URL legacy /academy/hacking a /academy/pentesting', () => {
    renderAcademy('/es/academy/hacking');
    expect(screen.getByText('Las 5 fases: el método, no el caos')).toBeInTheDocument();
  });

  it('redirige la URL legacy /academy/hacking-web a /academy/hackingweb', () => {
    renderAcademy('/es/academy/hacking-web');
    expect(screen.getByText('Protocolos en hacking web: HTTP, HTTPS y más')).toBeInTheDocument();
  });

  it('redirige la URL legacy /academy/protocolos a /academy/networksI', () => {
    renderAcademy('/es/academy/protocolos');
    expect(screen.getByText('Protocolos por capa: los imprescindibles')).toBeInTheDocument();
  });

  it('redirige la URL legacy /academy/protocolos-ii a /academy/networksII', () => {
    renderAcademy('/es/academy/protocolos-ii');
    expect(screen.getByText('DHCP: el servicio que reparte las direcciones IP')).toBeInTheDocument();
    expect(screen.queryByText('Protocolos por capa: los imprescindibles')).not.toBeInTheDocument();
  });

  it('redirige la URL legacy /academy/os/linux-01 a /academy/linux/linux-01', () => {
    renderAcademy('/es/academy/os/linux-01');
    expect(screen.getByText(/Antes de hackear un Linux/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Regresar/ })).toHaveAttribute('href', '/es/academy/linux');
  });

  it('redirige la URL legacy de una lección renombrada (protocolos-ii/network-04 → networksII/networksII-05)', () => {
    renderAcademy('/es/academy/protocolos-ii/network-04');
    // Si el redirect fallara caeríamos al home, que no tiene "Regresar"
    expect(screen.getByRole('link', { name: /Regresar/ })).toHaveAttribute('href', '/es/academy/networksII');
  });

  it('redirige la URL legacy de una lección de Redes I (protocolos/proto-07 → networksI/networksI-04)', () => {
    renderAcademy('/es/academy/protocolos/proto-07');
    expect(screen.getByRole('link', { name: /Regresar/ })).toHaveAttribute('href', '/es/academy/networksI');
  });

  it('redirige la URL legacy de una lección de Pentesting (hacking/network-05 → pentesting/pentesting-05)', () => {
    renderAcademy('/es/academy/hacking/network-05');
    expect(screen.getByRole('link', { name: /Regresar/ })).toHaveAttribute('href', '/es/academy/pentesting');
  });

  it('redirige la URL legacy de una lección de Hacking Web (hacking-web/proto-02 → hackingweb/hackingweb-01)', () => {
    renderAcademy('/es/academy/hacking-web/proto-02');
    expect(screen.getByRole('link', { name: /Regresar/ })).toHaveAttribute('href', '/es/academy/hackingweb');
  });
});
