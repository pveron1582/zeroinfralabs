import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LessonViewer } from '../academy/LessonViewer';
import { FoxyNarrator } from '../academy/FoxyNarrator';
import { useScenarioStore } from '../../store/scenarioStore';

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

describe('FoxyNarrator (Fase D)', () => {
  beforeEach(() => {
    useScenarioStore.setState({ language: 'es', completedLessons: [] });
  });

  it('renderiza Foxy con su badge y mensaje en español', () => {
    render(
      <FoxyNarrator
        messages={[{ es: 'Hola, soy Foxy', en: 'Hi, I am Foxy' }]}
        isEs={true}
      />
    );
    expect(screen.getByText('FOXY')).toBeInTheDocument();
    expect(screen.getByText('Hola, soy Foxy')).toBeInTheDocument();
  });

  it('con mensajes múltiples, el botón "Siguiente" rota', () => {
    render(
      <FoxyNarrator
        messages={[
          { es: 'Primer dato', en: 'First tip' },
          { es: 'Segundo dato', en: 'Second tip' },
          { es: 'Tercer dato', en: 'Third tip' },
        ]}
        isEs={true}
      />
    );
    expect(screen.getByText('Primer dato')).toBeInTheDocument();
    expect(screen.getByText('1/3')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
    expect(screen.getByText('Segundo dato')).toBeInTheDocument();
    expect(screen.getByText('2/3')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
    expect(screen.getByText('Primer dato')).toBeInTheDocument(); // vuelve al inicio
  });

  it('con un solo mensaje no muestra botón de rotación', () => {
    render(
      <FoxyNarrator
        messages={[{ es: 'Solo uno', en: 'Only one' }]}
        isEs={true}
      />
    );
    expect(screen.queryByRole('button', { name: /Siguiente/ })).not.toBeInTheDocument();
  });

  it('las lecciones del Academy empiezan con Foxy narrator', () => {
    renderLesson('/es/academy/os/linux-01');
    expect(screen.getByText('FOXY')).toBeInTheDocument();
    expect(screen.getByText(/Antes de hackear un Linux/)).toBeInTheDocument();

    // Siguiente → content
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
    expect(screen.getByText(/1991: un estudiante finlandés/)).toBeInTheDocument();
  });

  it('el paso narrator no bloquea el avance (a diferencia del quiz)', () => {
    renderLesson('/es/academy/protocolos-ii/network-06');
    expect(screen.getByText(/Cuando enchufás un cable/)).toBeInTheDocument();
    // No es quiz, así que Siguiente está habilitado desde el vamos
    const nextBtn = screen.getByRole('button', { name: /Siguiente/ });
    expect(nextBtn).not.toBeDisabled();
  });
});
