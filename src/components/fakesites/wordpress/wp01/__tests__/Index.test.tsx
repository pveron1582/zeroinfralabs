// ── components/fakesites/wordpress/wp01/__tests__/Index.test.tsx ──
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { WPIndex } from '../Index';

describe('WPIndex', () => {
  const defaultProps = {
    ip: '192.168.1.11',
    onNavigate: vi.fn(),
  };

  it('debe renderizar el header con logo y nombre', () => {
    render(<WPIndex {...defaultProps} />);
    
    expect(screen.getByText(/My WordPress Blog/i)).toBeInTheDocument();
  });

  it('debe mostrar navegación con Inicio y Admin', () => {
    render(<WPIndex {...defaultProps} />);
    
    expect(screen.getByText(/Inicio/i)).toBeInTheDocument();
    expect(screen.getByText(/Admin/i)).toBeInTheDocument();
  });

  it('debe mostrar título de bienvenida', () => {
    render(<WPIndex {...defaultProps} />);
    
    expect(screen.getByText(/Bienvenidos a Mi Blog/i)).toBeInTheDocument();
  });

  it('debe mostrar información del servidor', () => {
    render(<WPIndex {...defaultProps} />);
    
    expect(screen.getByText(/WordPress 6.0/i)).toBeInTheDocument();
    expect(screen.getByText(/Apache/i)).toBeInTheDocument();
    expect(screen.getByText(/192.168.1.11:80/i)).toBeInTheDocument();
  });

  it('debe mostrar artículos del blog', () => {
    render(<WPIndex {...defaultProps} />);
    
    // Verificar que los 3 artículos están presentes (Claude 4 aparece en título y contenido)
    expect(screen.getAllByText(/Claude 4/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Ciberseguridad e IA/i)).toBeInTheDocument();
    expect(screen.getByText(/vulnerabilidad crítica reportada en WordPress/i)).toBeInTheDocument();
  });

  it('debe mostrar sección Meta con enlace a Acceder', () => {
    render(<WPIndex {...defaultProps} />);
    
    expect(screen.getByText(/Meta/i)).toBeInTheDocument();
    expect(screen.getByText(/Acceder/i)).toBeInTheDocument();
  });

  it('debe llamar onNavigate al hacer clic en Admin', () => {
    render(<WPIndex {...defaultProps} />);
    
    const adminButton = screen.getByText(/Admin/i);
    fireEvent.click(adminButton);
    
    expect(defaultProps.onNavigate).toHaveBeenCalledWith('http://192.168.1.11/wp-admin');
  });

  it('debe llamar onNavigate al hacer clic en Acceder', () => {
    render(<WPIndex {...defaultProps} />);
    
    const accederButton = screen.getByText(/Acceder/i);
    fireEvent.click(accederButton);
    
    expect(defaultProps.onNavigate).toHaveBeenCalledWith('http://192.168.1.11/wp-admin');
  });

  it('debe mostrar fechas de publicación', () => {
    render(<WPIndex {...defaultProps} />);
    
    // Puede haber múltiples fechas (una por artículo)
    expect(screen.getAllByText(/Publicado el/i).length).toBeGreaterThan(0);
  });

  it('debe mostrar contenido de los artículos', () => {
    render(<WPIndex {...defaultProps} />);
    
    // Verificar que hay contenido en los artículos
    expect(screen.getByText(/Anthropic ha lanzado Claude 4/i)).toBeInTheDocument();
    expect(screen.getByText(/integración de inteligencia artificial en ciberseguridad/i)).toBeInTheDocument();
    expect(screen.getByText(/ejecución remota de código/i)).toBeInTheDocument();
  });
});