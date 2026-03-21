// ── components/fakesites/wordpress/wp01/__tests__/Dashboard.test.tsx ──
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { WPDashboard } from '../Dashboard';

describe('WPDashboard', () => {
  const defaultProps = {
    ip: '192.168.1.11',
    onNavigate: vi.fn(),
  };

  it('debe renderizar el dashboard de WordPress', () => {
    render(<WPDashboard {...defaultProps} />);
    
    expect(screen.getByText(/Mi Blog/i)).toBeInTheDocument();
    expect(screen.getByText(/WordPress 6.0/i)).toBeInTheDocument();
  });

  it('debe mostrar mensaje de acceso concedido', () => {
    render(<WPDashboard {...defaultProps} />);
    
    expect(screen.getByText(/Acceso concedido/i)).toBeInTheDocument();
    expect(screen.getByText(/comprometido el panel/i)).toBeInTheDocument();
  });

  it('debe mostrar menú lateral con opciones', () => {
    render(<WPDashboard {...defaultProps} />);
    
    // Verificar que existen los elementos del menú (puede haber múltiples)
    expect(screen.getAllByText(/Escritorio/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Entradas/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Páginas/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Comentarios/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Apariencia/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Plugins/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Usuarios/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Ajustes/i).length).toBeGreaterThan(0);
  });

  it('debe mostrar estadísticas del dashboard', () => {
    render(<WPDashboard {...defaultProps} />);
    
    // Verificar que existen los números de estadísticas
    expect(screen.getAllByText(/^3$/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^2$/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^12$/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^1$/).length).toBeGreaterThan(0);
  });

  it('debe mostrar flag de usuario comprometido', () => {
    render(<WPDashboard {...defaultProps} />);
    
    expect(screen.getByText(/THM/)).toBeInTheDocument();
    expect(screen.getByText(/WP_ADMIN_COMPROMISED/i)).toBeInTheDocument();
  });

  it('debe mostrar indicador de usuario admin', () => {
    render(<WPDashboard {...defaultProps} />);
    
    // Puede haber múltiples elementos con "admin"
    expect(screen.getAllByText(/admin/i).length).toBeGreaterThan(0);
  });

  it('debe llamar onNavigate al hacer clic en Ver sitio', () => {
    render(<WPDashboard {...defaultProps} />);
    
    const verSitioButton = screen.getByText(/Ver sitio/i);
    fireEvent.click(verSitioButton);
    
    expect(defaultProps.onNavigate).toHaveBeenCalledWith('http://192.168.1.11/');
  });

  it('debe mostrar título Escritorio', () => {
    render(<WPDashboard {...defaultProps} />);
    
    // Puede haber múltiples elementos con "Escritorio"
    expect(screen.getAllByText(/Escritorio/i).length).toBeGreaterThan(0);
  });
});