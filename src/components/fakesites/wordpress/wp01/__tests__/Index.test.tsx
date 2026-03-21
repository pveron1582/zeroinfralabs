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
    
    expect(screen.getByText(/Hello World!/i)).toBeInTheDocument();
    expect(screen.getByText(/Sample Post/i)).toBeInTheDocument();
    expect(screen.getByText(/Another Entry/i)).toBeInTheDocument();
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

  it('debe mostrar contenido Lorem ipsum', () => {
    render(<WPIndex {...defaultProps} />);
    
    // Puede haber múltiples Lorem ipsum (uno por artículo)
    expect(screen.getAllByText(/Lorem ipsum/i).length).toBeGreaterThan(0);
  });
});