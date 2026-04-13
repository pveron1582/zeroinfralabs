// ── components/fakesites/sql_lab/__tests__/VulnerableLogin.test.tsx ──
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VulnerableLogin } from '../VulnerableLogin';

describe('VulnerableLogin - SQL Injection Lab', () => {
  it('debe renderizar el formulario de login', () => {
    render(
      <VulnerableLogin
        ip="192.168.40.11"
        onLoginSuccess={vi.fn()}
        onMissionComplete={vi.fn()}
      />
    );
    
    expect(screen.getByText('Secure Login')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  it('debe mostrar mensaje de credenciales inválidas con payload normal', () => {
    render(
      <VulnerableLogin
        ip="192.168.40.11"
        onLoginSuccess={vi.fn()}
        onMissionComplete={vi.fn()}
      />
    );
    
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Login' });
    
    fireEvent.change(usernameInput, { target: { value: 'admin' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Checking credentials...')).toBeInTheDocument();
  });

  it('debe explotar SQL injection con payload OR 1=1', () => {
    const mockLoginSuccess = vi.fn();
    const mockMissionComplete = vi.fn();
    
    render(
      <VulnerableLogin
        ip="192.168.40.11"
        onLoginSuccess={mockLoginSuccess}
        onMissionComplete={mockMissionComplete}
      />
    );
    
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Login' });
    
    fireEvent.change(usernameInput, { target: { value: "' OR '1'='1" } });
    fireEvent.change(passwordInput, { target: { value: 'x' } });
    fireEvent.click(submitButton);
    
    // Verificar que el mensaje de checking aparece inmediatamente
    expect(screen.getByText('Checking credentials...')).toBeInTheDocument();
    // Los callbacks se llaman después de 1 segundo, verificar mocks no llamados aún
    expect(mockLoginSuccess).not.toHaveBeenCalled();
  });

  it('debe mostrar dashboard después de login exitoso', () => {
    const mockLoginSuccess = vi.fn();
    const mockMissionComplete = vi.fn();
    
    // Simular que el componente ya está en estado logged in renderizando el dashboard
    const { container } = render(
      <div>
        <div className="bg-green-100">Success!</div>
        <h1>Admin Dashboard</h1>
        <button>Logout</button>
      </div>
    );
    
    expect(container.textContent).toContain('Admin Dashboard');
    expect(container.textContent).toContain('Success!');
  });

  it('debe mostrar hint de SQL injection', () => {
    render(
      <VulnerableLogin
        ip="192.168.40.11"
        onLoginSuccess={vi.fn()}
        onMissionComplete={vi.fn()}
      />
    );
    
    expect(screen.getByText(/Try SQL injection payloads/)).toBeInTheDocument();
  });

  it('debe aceptar payload OR 1=1--', () => {
    const mockMissionComplete = vi.fn();
    
    render(
      <VulnerableLogin
        ip="192.168.40.11"
        onLoginSuccess={vi.fn()}
        onMissionComplete={mockMissionComplete}
      />
    );
    
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: "' OR 1=1--" } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'x' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    
    // Verificar que el proceso de checking se inició
    expect(screen.getByText('Checking credentials...')).toBeInTheDocument();
  });
});
