import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LessonViewer } from '../academy/LessonViewer';
import { useScenarioStore } from '../../store/scenarioStore';

vi.mock('../Terminal', () => ({
  Terminal: (props: any) => (
    <div data-testid="mock-terminal-inner">
      terminal-{props.scenarioId || 'unknown'}
    </div>
  ),
}));

vi.mock('../landing/SiteHeader', () => ({
  SiteHeader: () => <header data-testid="site-header">header</header>,
}));

function renderLesson(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/:lang/academy/:pathId/:lessonId" element={<LessonViewer />} />
      </Routes>
    </MemoryRouter>
  );
}

const goToExerciseInLinux02 = () => {
  renderLesson('/es/academy/os/linux-02');
  // narrator, content, video, content, terminal, terminal, content, **exercise**, quiz
  for (let i = 0; i < 7; i++) {
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
  }
};

describe('LabMiniTerminal inline en practical-exercise', () => {
  beforeEach(() => {
    useScenarioStore.setState({ language: 'es', completedLessons: [] });
  });

  it('la terminal aparece automáticamente debajo del banner del ejercicio', () => {
    goToExerciseInLinux02();
    // Banner del ejercicio + burbuja Foxy tendrán el mismo texto; chequear ambos
    expect(screen.getAllByText(/EJERCICIO PRÁCTICO/).length).toBeGreaterThan(0);
    expect(screen.getByTestId('mock-terminal-inner')).toBeInTheDocument();
    expect(screen.getByText(/terminal-scenario-01/)).toBeInTheDocument();
  });

  it('muestra el footer "Terminal real del lab"', () => {
    goToExerciseInLinux02();
    expect(screen.getByText(/los comandos funcionan/)).toBeInTheDocument();
  });

  it('la terminal desaparece al avanzar al siguiente paso', () => {
    goToExerciseInLinux02();
    expect(screen.getByTestId('mock-terminal-inner')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
    expect(screen.queryByTestId('mock-terminal-inner')).not.toBeInTheDocument();
  });

  it('el banner menciona Foxy abajo a la derecha', () => {
    goToExerciseInLinux02();
    expect(screen.getByText(/Foxy está abajo a la derecha/)).toBeInTheDocument();
  });

  it('Foxy flotante está disponible (cara)', () => {
    goToExerciseInLinux02();
    // La cara de Foxy visible como botón flotante
    expect(screen.getByRole('button', { name: /Abrir ayuda de Foxy/ })).toBeInTheDocument();

    // Click abre burbuja con pista
    fireEvent.click(screen.getByRole('button', { name: /Abrir ayuda de Foxy/ }));
    expect(screen.getByRole('button', { name: /Pedir pista a Foxy/ })).toBeInTheDocument();

    // Pedir pista muestra el hint
    fireEvent.click(screen.getByRole('button', { name: /Pedir pista a Foxy/ }));
    expect(screen.getByText(/Empezá con: pwd/)).toBeInTheDocument();
  });
});
