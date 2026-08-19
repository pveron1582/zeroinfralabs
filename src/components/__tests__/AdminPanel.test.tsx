import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AdminPanel } from '../AdminPanel';
import { useScenarioStore } from '../../store/scenarioStore';

vi.mock('../DesktopTerminal', () => ({
  DesktopTerminal: () => <div data-testid="mock-terminal">terminal</div>,
}));

vi.mock('../MissionPanel', () => ({
  MissionPanel: ({ onOpenNetworkMap, onExit }: any) => (
    <div data-testid="mock-missions">
      <button onClick={() => onOpenNetworkMap(true)}>abrir mapa</button>
      <button onClick={onExit}>salir</button>
    </div>
  ),
}));

vi.mock('../NetworkMap', () => ({
  NetworkMap: ({ onClose }: any) => (
    <div data-testid="mock-network-map">
      <button onClick={onClose}>cerrar mapa</button>
    </div>
  ),
}));

function renderAdmin(initialPath = '/es/zildeb') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/:lang/zildeb" element={<AdminPanel />} />
        <Route path="/:lang" element={<div data-testid="home-page">home</div>} />
      </Routes>
    </MemoryRouter>
  );
}

const loginAs = (user: string, pass: string) => {
  const inputs = screen.getAllByPlaceholderText('admin');
  fireEvent.change(inputs[0], { target: { value: user } });
  fireEvent.change(inputs[1], { target: { value: pass } });
};

const loginAndGoHome = async () => {
  loginAs('admin', 'admin');
  fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
  await waitFor(() => expect(screen.getByText('ZeroInfra Admin')).toBeInTheDocument());
};

const enterSandbox = async () => {
  await loginAndGoHome();
  fireEvent.click(screen.getByText('Sandbox / Debug'));
  await waitFor(() => expect(screen.getByText('DEBUG')).toBeInTheDocument());
};

describe('AdminPanel', () => {
  beforeEach(() => {
    useScenarioStore.setState({ language: 'es' });
  });

  describe('login', () => {
    it('muestra el formulario de login al entrar', () => {
      renderAdmin();
      expect(screen.getByText('Admin Panel')).toBeInTheDocument();
      expect(screen.getAllByPlaceholderText('admin')).toHaveLength(2);
      expect(screen.getByRole('button', { name: 'Ingresar' })).toBeInTheDocument();
    });

    it('muestra error de credenciales incorrectas en español', () => {
      renderAdmin();
      loginAs('root', 'wrong');
      fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
      expect(screen.getByText('Credenciales incorrectas')).toBeInTheDocument();
    });

    it('muestra error en inglés cuando el idioma es en', () => {
      useScenarioStore.setState({ language: 'en' });
      renderAdmin('/en/zildeb');
      loginAs('root', 'wrong');
      fireEvent.click(screen.getByRole('button', { name: 'Login' }));
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });

    it('navega al inicio con el botón Volver al inicio', async () => {
      renderAdmin();
      fireEvent.click(screen.getByRole('button', { name: /Volver al inicio/ }));
      await waitFor(() => expect(screen.getByTestId('home-page')).toBeInTheDocument());
    });
  });

  describe('home', () => {
    it('muestra el hub con las 5 secciones tras el login', async () => {
      renderAdmin();
      await loginAndGoHome();

      expect(screen.getByText('Bienvenido al cuartel general')).toBeInTheDocument();
      expect(screen.getByText('Sandbox / Debug')).toBeInTheDocument();
      expect(screen.getByText('Lab Builder')).toBeInTheDocument();
      expect(screen.getByText('Lesson Builder')).toBeInTheDocument();
      expect(screen.getByText('Asistente Foxy')).toBeInTheDocument();
      expect(screen.getByText('Analíticas')).toBeInTheDocument();
    });

    it('muestra el hub en inglés cuando el idioma es en', async () => {
      useScenarioStore.setState({ language: 'en' });
      renderAdmin('/en/zildeb');
      loginAs('admin', 'admin');
      fireEvent.click(screen.getByRole('button', { name: 'Login' }));
      await waitFor(() => expect(screen.getByText('Welcome to headquarters')).toBeInTheDocument());
      expect(screen.getByText('Foxy Assistant')).toBeInTheDocument();
      expect(screen.getByText('Lesson Builder')).toBeInTheDocument();
    });

    it('las secciones no disponibles aparecen con badge Próximamente', async () => {
      renderAdmin();
      await loginAndGoHome();
      expect(screen.getAllByText('Próximamente')).toHaveLength(2); // Foxy + Analíticas
      expect(screen.getAllByText('Nuevo')).toHaveLength(2); // LabBuilder + LessonBuilder
    });

    it('muestra un reloj en el header', async () => {
      renderAdmin();
      await loginAndGoHome();
      expect(screen.getByLabelText('hora actual')).toBeInTheDocument();
    });

    it('vuelve al sitio desde el botón Salir', async () => {
      renderAdmin();
      await loginAndGoHome();
      fireEvent.click(screen.getByRole('button', { name: /Salir/ }));
      await waitFor(() => expect(screen.getByTestId('home-page')).toBeInTheDocument());
    });
  });

  describe('sandbox', () => {
    it('entra al sandbox desde la tarjeta y carga el workspace con debug ON', async () => {
      renderAdmin();
      await enterSandbox();

      expect(screen.getByTestId('mock-terminal')).toBeInTheDocument();
      expect(screen.getByTestId('mock-missions')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Debug ON/ })).toBeInTheDocument();
    });

    it('cambia de escenario y recarga el workspace', async () => {
      renderAdmin();
      await enterSandbox();

      const select = screen.getByRole('combobox') as HTMLSelectElement;
      fireEvent.change(select, { target: { value: select.options[1].value } });
      await waitFor(() => expect(screen.getByText('DEBUG')).toBeInTheDocument());
      expect(screen.queryByText('Cargando escenario...')).not.toBeInTheDocument();
    });

    it('permite apagar y encender el panel de debug', async () => {
      renderAdmin();
      await enterSandbox();

      fireEvent.click(screen.getByRole('button', { name: /Debug ON/ }));
      expect(screen.getByRole('button', { name: /Debug OFF/ })).toBeInTheDocument();
      expect(screen.queryByText('🐞 DEBUG')).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /Debug OFF/ }));
      expect(screen.getByText('🐞 DEBUG')).toBeInTheDocument();
    });

    it('alterna entre las pestañas Store, Machines y Missions', async () => {
      renderAdmin();
      await enterSandbox();

      fireEvent.click(screen.getByRole('button', { name: 'Machines' }));
      expect(screen.getAllByText(/discovery_level/).length).toBeGreaterThan(0);

      fireEvent.click(screen.getByRole('button', { name: 'Missions' }));
      expect(screen.getAllByText(/validate:/).length).toBeGreaterThan(0);

      fireEvent.click(screen.getByRole('button', { name: 'Store' }));
      expect(screen.getByText(/"view"/)).toBeInTheDocument();
    });

    it('abre y cierra el mapa de red', async () => {
      renderAdmin();
      await enterSandbox();

      fireEvent.click(screen.getByRole('button', { name: 'abrir mapa' }));
      expect(screen.getByTestId('mock-network-map')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'cerrar mapa' }));
      expect(screen.queryByTestId('mock-network-map')).not.toBeInTheDocument();
    });

    it('vuelve al hub con el botón Panel', async () => {
      renderAdmin();
      await enterSandbox();

      fireEvent.click(screen.getByRole('button', { name: /Panel/ }));
      await waitFor(() => expect(screen.getByText('Bienvenido al cuartel general')).toBeInTheDocument());
    });
  });
});
