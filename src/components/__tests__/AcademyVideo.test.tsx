import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LessonViewer } from '../academy/LessonViewer';
import { AcademyVideo } from '../academy/AcademyVideo';
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

describe('AcademyVideo (paso tipo video)', () => {
  beforeEach(() => {
    useScenarioStore.setState({ language: 'es', completedLessons: [] });
  });

  it('renderiza el video con src correcta y duración', () => {
    render(
      <AcademyVideo
        src="/videos/test.mp4"
        durationSec={20}
        caption="Test caption EN"
        captionEs="Caption de prueba"
        isEs={true}
      />
    );
    // El elemento <video> tiene el src correcto
    const video = document.querySelector('video');
    expect(video).toHaveAttribute('src', '/videos/test.mp4');
    expect(screen.getByText(/20s/)).toBeInTheDocument();
    expect(screen.getByText('Caption de prueba')).toBeInTheDocument();
  });

  it('muestra caption en español si isEs=true', () => {
    render(
      <AcademyVideo
        src="/videos/x.mp4"
        durationSec={10}
        caption="english caption"
        captionEs="subtítulo español"
        isEs={true}
      />
    );
    expect(screen.getByText('subtítulo español')).toBeInTheDocument();
  });

  it('muestra caption en inglés si isEs=false', () => {
    render(
      <AcademyVideo
        src="/videos/x.mp4"
        durationSec={10}
        caption="english caption"
        captionEs="subtítulo español"
        isEs={false}
      />
    );
    expect(screen.getByText('english caption')).toBeInTheDocument();
  });

  it('la lección linux-01 incluye el video de historia de Linux como paso 3', () => {
    renderLesson('/es/academy/os/linux-01');
    expect(screen.getByText(/Antes de hackear un Linux/)).toBeInTheDocument();

    // paso 1=narrator, paso 2=content, paso 3=video
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));

    const video = document.querySelector('video');
    expect(video).toHaveAttribute('src', '/videos/li01-linux-history.mp4');
    expect(screen.getByText(/Nació en 1991 como hobby/)).toBeInTheDocument();
  });

  it('la lección windows-01 incluye el video de historia (wi-01) como paso 2', () => {
    renderLesson('/es/academy/os/windows-01');
    expect(screen.getByText(/Antes de tocar un Windows/)).toBeInTheDocument();

    // paso 1=narrator, paso 2=video
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));

    const video = document.querySelector('video');
    expect(video).toHaveAttribute('src', '/videos/wi01-windows-history.mp4');
    expect(screen.getByText(/Nació en 1985 como interfaz sobre MS-DOS/)).toBeInTheDocument();
  });

  it('la lección hacking-02 incluye el video de filesystems (pe-02) como paso 2', () => {
    renderLesson('/es/academy/hacking/hacking-02');
    expect(screen.getByText(/Para hackear no necesitás adivinar/)).toBeInTheDocument();

    // paso 1=narrator, paso 2=video
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));

    const video = document.querySelector('video');
    expect(video).toHaveAttribute('src', '/videos/pe02-filesystem.mp4');
    expect(screen.getByText(/Primero, entendé el mapa/)).toBeInTheDocument();
  });

  it('la lección ciber-01 incluye el video de la triada CID (ci-01) como paso 2', () => {
    renderLesson('/es/academy/ciberseguridad/ciber-01');
    expect(screen.getByText(/Toda la seguridad gira alrededor/)).toBeInTheDocument();

    // paso 1=narrator, paso 2=video
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));

    const video = document.querySelector('video');
    expect(video).toHaveAttribute('src', '/videos/ci01-cia-triad.mp4');
    expect(screen.getByText(/La triada CID: Confidencialidad/)).toBeInTheDocument();
  });

  it('la lección ciber-02 incluye el video de hashes (ci-02) como paso 2', () => {
    renderLesson('/es/academy/ciberseguridad/ciber-02');
    expect(screen.getByText(/Los hashes son como huellas/)).toBeInTheDocument();

    // paso 1=narrator, paso 2=video
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));

    const video = document.querySelector('video');
    expect(video).toHaveAttribute('src', '/videos/ci02-hashes-cracking.mp4');
    expect(screen.getByText(/Un hash es una huella de un solo sentido/)).toBeInTheDocument();
  });

  it('la lección ciber-03 incluye el video de information gathering (ci-03) como paso 2', () => {
    renderLesson('/es/academy/ciberseguridad/ciber-03');
    expect(screen.getByText(/Antes de tocar un solo sistema/)).toBeInTheDocument();

    // paso 1=narrator, paso 2=video
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));

    const video = document.querySelector('video');
    expect(video).toHaveAttribute('src', '/videos/ci03-information-gathering.mp4');
    expect(screen.getByText(/convierte a tu objetivo en un mapa/)).toBeInTheDocument();
  });

  it('la lección ciber-04 incluye el video de criptografía (ci-04) como paso 2', () => {
    renderLesson('/es/academy/ciberseguridad/ciber-04');
    expect(screen.getByText(/En la clase 2 viste hashes/)).toBeInTheDocument();

    // paso 1=narrator, paso 2=video
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));

    const video = document.querySelector('video');
    expect(video).toHaveAttribute('src', '/videos/ci04-cryptography.mp4');
    expect(screen.getByText(/es el arte de mezclar datos/)).toBeInTheDocument();
  });

  it('la lección ciber-05 incluye el video de OWASP Top Ten (ci-05) como paso 2', () => {
    renderLesson('/es/academy/ciberseguridad/ciber-05');
    expect(screen.getByText(/¿Dónde apuntás cuando defendés/)).toBeInTheDocument();

    // paso 1=narrator, paso 2=video
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));

    const video = document.querySelector('video');
    expect(video).toHaveAttribute('src', '/videos/ci05-owasp-top-ten.mp4');
    expect(screen.getByText(/es la lista ordenada de los riesgos web/)).toBeInTheDocument();
  });

  it('la lección hacking-05 incluye el video de cracking offline (hk-05) como paso 2', () => {
    renderLesson('/es/academy/hacking/hacking-05');
    expect(screen.getByText(/En la clase de ciberseguridad viste qué es un hash/)).toBeInTheDocument();

    // paso 1=narrator, paso 2=video
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));

    const video = document.querySelector('video');
    expect(video).toHaveAttribute('src', '/videos/hk05-offline-cracking.mp4');
    expect(screen.getByText(/vos tenés el hash, así que lo crackeás a tu ritmo/)).toBeInTheDocument();
  });

  it('la lección hacking-06 incluye el video de cracking online (hk-06) como paso 2', () => {
    renderLesson('/es/academy/hacking/hacking-06');
    expect(screen.getByText(/No siempre tenés el hash/)).toBeInTheDocument();

    // paso 1=narrator, paso 2=video
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));

    const video = document.querySelector('video');
    expect(video).toHaveAttribute('src', '/videos/hk06-online-cracking.mp4');
    expect(screen.getByText(/ataca el servicio vivo: no hace falta el hash/)).toBeInTheDocument();
  });
});
