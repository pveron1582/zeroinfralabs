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

  it('debe mostrar navegación con Home y Admin', () => {
    render(<WPIndex {...defaultProps} />);
    
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/Admin/i)).toBeInTheDocument();
  });

  it('debe mostrar título de bienvenida', () => {
    render(<WPIndex {...defaultProps} />);
    
    expect(screen.getByText(/Welcome to My Blog/i)).toBeInTheDocument();
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
    expect(screen.getByText(/Cybersecurity and AI/i)).toBeInTheDocument();
    expect(screen.getByText(/critical vulnerability reported in WordPress/i)).toBeInTheDocument();
  });

  it('debe mostrar sección Meta con enlace a Log In', () => {
    render(<WPIndex {...defaultProps} />);
    
    expect(screen.getByText(/Meta/i)).toBeInTheDocument();
    expect(screen.getByText(/Log In/i)).toBeInTheDocument();
  });

  it('debe llamar onNavigate al hacer clic en Admin', () => {
    render(<WPIndex {...defaultProps} />);
    
    const adminButton = screen.getByText(/Admin/i);
    fireEvent.click(adminButton);
    
    expect(defaultProps.onNavigate).toHaveBeenCalledWith('http://192.168.1.11/wp-admin');
  });

  it('debe llamar onNavigate al hacer clic en Log In', () => {
    render(<WPIndex {...defaultProps} />);
    
    const loginButton = screen.getByText(/Log In/i);
    fireEvent.click(loginButton);
    
    expect(defaultProps.onNavigate).toHaveBeenCalledWith('http://192.168.1.11/wp-admin');
  });

  it('debe mostrar fechas de publicación', () => {
    render(<WPIndex {...defaultProps} />);
    
    // Puede haber múltiples fechas (una por artículo)
    expect(screen.getAllByText(/Published on/i).length).toBeGreaterThan(0);
  });

  it('debe mostrar contenido de los artículos', () => {
    render(<WPIndex {...defaultProps} />);
    
    // Verificar que hay contenido en los artículos
    expect(screen.getByText(/Anthropic has launched Claude 4/i)).toBeInTheDocument();
    expect(screen.getByText(/integration of artificial intelligence in cybersecurity/i)).toBeInTheDocument();
    expect(screen.getByText(/remote code execution/i)).toBeInTheDocument();
  });
});