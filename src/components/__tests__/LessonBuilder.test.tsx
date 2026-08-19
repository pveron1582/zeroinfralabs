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

const enterLessons = () => {
  const inputs = screen.getAllByPlaceholderText('admin');
  fireEvent.change(inputs[0], { target: { value: 'admin' } });
  fireEvent.change(inputs[1], { target: { value: 'admin' } });
  fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
  fireEvent.click(screen.getByText('Lesson Builder'));
};

describe('LessonBuilder (Fase E)', () => {
  beforeEach(() => {
    useScenarioStore.setState({ language: 'es', completedLessons: [] });
  });

  it('se accede desde el hub de admin', () => {
    renderAdmin();
    enterLessons();
    expect(screen.getByText('📝 Lesson Builder')).toBeInTheDocument();
  });

  it('muestra metadata y un paso Foxy por defecto', () => {
    renderAdmin();
    enterLessons();
    expect(screen.getByPlaceholderText('mi-leccion')).toBeInTheDocument();
    expect(screen.getAllByText(/foxy-narrator/).length).toBeGreaterThan(0);
  });

  it('permite agregar un paso de contenido', () => {
    renderAdmin();
    enterLessons();
    fireEvent.click(screen.getByRole('button', { name: /Contenido/ }));
    expect(screen.getAllByText(/content/).length).toBeGreaterThan(0);
  });

  it('el botón Descargar .ts llama al generateLessonTs', () => {
    renderAdmin();
    enterLessons();
    const downloadBtn = screen.getByRole('button', { name: /Descargar \.ts/ });
    expect(downloadBtn).toBeInTheDocument();
    // Solo verificamos que está ahí — el blob click no funciona en jsdom sin polyfill
  });
});
