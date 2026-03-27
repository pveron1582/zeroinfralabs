import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { WPLogin } from '../Login';
import { WPUploads } from '../Uploads';
import { WPConfigBak } from '../ConfigBak';

describe('WordPress Lab (wp01) - Componentes Vulnerables', () => {
  
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('WPLogin', () => {
    const mockCreds = { user: 'admin', pass: 'P@ssw0rd123!' };
    
    it('debe mostrar error con credenciales incorrectas', async () => {
      render(<WPLogin ip="1.1.1.1" credentials={mockCreds} onNavigate={vi.fn()} onLoginSuccess={vi.fn()} />);
      
      fireEvent.change(screen.getByLabelText(/Usuario/i), { target: { value: 'hacker' } });
      fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: '12345' } });
      
      fireEvent.click(screen.getByRole('button', { name: /Acceder/i }));
      
      // act() asegura que los efectos secundarios del timer se procesen
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.getByText((content) => content.includes('incorrectos'))).toBeInTheDocument();
    });

    it('debe llamar a onLoginSuccess con las credenciales correctas', async () => {
      const onLoginSuccess = vi.fn();
      render(<WPLogin ip="1.1.1.1" credentials={mockCreds} onNavigate={vi.fn()} onLoginSuccess={onLoginSuccess} />);
      
      fireEvent.change(screen.getByLabelText(/Usuario/i), { target: { value: 'admin' } });
      fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: 'P@ssw0rd123!' } });
      
      fireEvent.click(screen.getByRole('button', { name: /Acceder/i }));
      
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(onLoginSuccess).toHaveBeenCalledWith(5);
    });
  });

  describe('WPUploads & Information Leakage', () => {
    it('WPUploads debe emitir onCredentialsFound al clickear el backup', () => {
      const onCredentialsFound = vi.fn();
      render(<WPUploads ip="1.1.1.1" onNavigate={vi.fn()} onCredentialsFound={onCredentialsFound} />);
      
      const backupFile = screen.getByText(/config.bak/i);
      fireEvent.click(backupFile);
      
      expect(onCredentialsFound).toHaveBeenCalledTimes(1);
      expect(onCredentialsFound).toHaveBeenCalledWith('admin', 'P@ssw0rd123!', '/uploads/config.bak', 'wp-admin');
    });

    it('WPConfigBak debe mostrar solo credenciales WP-Admin', () => {
      render(<WPConfigBak ip="10.0.0.15" onNavigate={vi.fn()} />);
      expect(screen.getByText((c) => c.includes('WP_ADMIN_PASS'))).toBeInTheDocument();
      expect(screen.getByText((c) => c.includes('P@ssw0rd123!'))).toBeInTheDocument();
      // No debe tener credenciales SSH ni DB
      expect(screen.queryByText((c) => c.includes('SSH_PASS'))).not.toBeInTheDocument();
      expect(screen.queryByText((c) => c.includes('DB_PASS'))).not.toBeInTheDocument();
    });
  });
});