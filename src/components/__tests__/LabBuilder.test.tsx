import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AdminPanel } from '../AdminPanel';
import { useScenarioStore } from '../../store/scenarioStore';

vi.mock('../DesktopTerminal', () => ({
  DesktopTerminal: () => <div data-testid="mock-terminal">terminal</div>,
}));

vi.mock('../MissionPanel', () => ({
  MissionPanel: () => <div data-testid="mock-missions">missions</div>,
}));

vi.mock('../NetworkMap', () => ({
  NetworkMap: () => <div data-testid="mock-network-map">network map</div>,
}));

function renderAdmin(initialPath = '/es/zildeb') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/:lang/zildeb" element={<AdminPanel />} />
      </Routes>
    </MemoryRouter>
  );
}

const enterBuilder = () => {
  const inputs = screen.getAllByPlaceholderText('admin');
  fireEvent.change(inputs[0], { target: { value: 'admin' } });
  fireEvent.change(inputs[1], { target: { value: 'admin' } });
  fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
  fireEvent.click(screen.getByText('Lab Builder'));
};

describe('LabBuilder', () => {
  beforeEach(() => {
    useScenarioStore.setState({ language: 'es' });
  });

  it('se accede desde el hub y muestra el paso Básico', () => {
    renderAdmin();
    enterBuilder();

    expect(screen.getByText('🧩 Lab Builder')).toBeInTheDocument();
    expect(screen.getByText('Datos básicos')).toBeInTheDocument();
    expect(screen.getByText('Paso 1 de 5')).toBeInTheDocument();
  });

  it('el indicador muestra los 5 pasos', () => {
    renderAdmin();
    enterBuilder();

    expect(screen.getByText('Básico')).toBeInTheDocument();
    expect(screen.getByText('Máquina')).toBeInTheDocument();
    expect(screen.getByText('Piezas')).toBeInTheDocument();
    expect(screen.getByText('Misiones')).toBeInTheDocument();
    expect(screen.getByText('Revisar')).toBeInTheDocument();
  });

  it('no deja avanzar del paso básico sin nombre', () => {
    renderAdmin();
    enterBuilder();

    const nextBtn = screen.getByRole('button', { name: /Siguiente/ });
    expect(nextBtn).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText('Mi primer lab'), { target: { value: 'Lab Test' } });
    fireEvent.change(screen.getByPlaceholderText('My first lab'), { target: { value: 'Test Lab' } });
    expect(nextBtn).not.toBeDisabled();
  });

  it('navega hasta el paso Piezas y muestra los servicios por defecto', () => {
    renderAdmin();
    enterBuilder();

    fireEvent.change(screen.getByPlaceholderText('Mi primer lab'), { target: { value: 'Lab Test' } });
    fireEvent.change(screen.getByPlaceholderText('My first lab'), { target: { value: 'Test Lab' } });
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ })); // → máquina
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ })); // → piezas

    expect(screen.getByText('Piezas del lab')).toBeInTheDocument();
    expect(screen.getByText('SSH')).toBeInTheDocument();
    expect(screen.getByText('HTTP')).toBeInTheDocument();
    expect(screen.getAllByText('WordPress').length).toBeGreaterThan(0);
    expect(screen.getByText('Sudo mal configurado')).toBeInTheDocument();
  });

  it('permite agregar una credencial en el paso Piezas', () => {
    renderAdmin();
    enterBuilder();

    fireEvent.change(screen.getByPlaceholderText('Mi primer lab'), { target: { value: 'x' } });
    fireEvent.change(screen.getByPlaceholderText('My first lab'), { target: { value: 'x' } });
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));

    fireEvent.click(screen.getByRole('button', { name: /Agregar credencial/ }));
    expect(screen.getByPlaceholderText('usuario')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('contraseña')).toBeInTheDocument();
  });

  it('permite agregar misiones con criterio de validación', () => {
    renderAdmin();
    enterBuilder();

    // saltar al paso misiones via indicador
    fireEvent.click(screen.getByText('Misiones'));

    expect(screen.getByText(/Todavía no hay misiones/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Agregar misión/ }));
    expect(screen.getByText('Misión 1')).toBeInTheDocument();
    expect(screen.getByText(/Escanear puertos/)).toBeInTheDocument();
  });

  it('muestra el resumen en el último paso', () => {
    renderAdmin();
    enterBuilder();
    fireEvent.click(screen.getByText('Revisar'));

    expect(screen.getByText('Revisión')).toBeInTheDocument();
    expect(screen.getByText(/Esto es solo la interfaz/)).toBeInTheDocument();
  });

  it('abre la vista previa JSON con los datos del lab', () => {
    renderAdmin();
    enterBuilder();

    fireEvent.change(screen.getByPlaceholderText('Mi primer lab'), { target: { value: 'Mi Lab' } });
    fireEvent.click(screen.getByRole('button', { name: /Vista previa JSON/ }));

    expect(screen.getByText('Vista previa del lab (JSON)')).toBeInTheDocument();
    expect(screen.getByText(/"nameEs": "Mi Lab"/)).toBeInTheDocument();
    expect(screen.getByText(/"ssh"/)).toBeInTheDocument(); // puerto default habilitado
  });

  it('vuelve al hub desde el builder', () => {
    renderAdmin();
    enterBuilder();
    fireEvent.click(screen.getByRole('button', { name: /Volver al Panel/ }));
    expect(screen.getByText('Bienvenido al cuartel general')).toBeInTheDocument();
  });
});
