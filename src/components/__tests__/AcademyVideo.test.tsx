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

  it('la lección hacking-05 incluye el video de cracking offline (pe-03) como paso 2', () => {
    renderLesson('/es/academy/hacking/hacking-05');
    expect(screen.getByText(/En la clase de ciberseguridad viste qué es un hash/)).toBeInTheDocument();

    // paso 1=narrator, paso 2=video
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));

    const video = document.querySelector('video');
    expect(video).toHaveAttribute('src', '/videos/pe03-offline-cracking.mp4');
    expect(screen.getByText(/vos tenés el hash, así que lo crackeás a tu ritmo/)).toBeInTheDocument();
  });

  it('la lección hacking-06 incluye el video de cracking online (pe-04) como paso 2', () => {
    renderLesson('/es/academy/hacking/hacking-06');
    expect(screen.getByText(/No siempre tenés el hash/)).toBeInTheDocument();

    // paso 1=narrator, paso 2=video
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));

    const video = document.querySelector('video');
    expect(video).toHaveAttribute('src', '/videos/pe04-online-cracking.mp4');
    expect(screen.getByText(/ataca el servicio vivo: no hace falta el hash/)).toBeInTheDocument();
  });

  it('la lección network-05 incluye el video de man-in-the-middle (pe-05) como paso 2', () => {
    renderLesson('/es/academy/hacking/network-05');
    expect(screen.getByText(/La red no te miente/)).toBeInTheDocument();

    // paso 1=narrator, paso 2=video
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));

    const video = document.querySelector('video');
    expect(video).toHaveAttribute('src', '/videos/pe05-man-in-the-middle.mp4');
    expect(screen.getByText(/el atacante inunda a la víctima con respuestas ARP falsas/)).toBeInTheDocument();
  });

  it('la lección proto-02 incluye el video de protocolos web (hw-01) como paso 2', () => {
    renderLesson('/es/academy/hacking-web/proto-02');
    expect(screen.getByText(/La web es el campo de batalla/)).toBeInTheDocument();

    // paso 1=narrator, paso 2=video
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));

    const video = document.querySelector('video');
    expect(video).toHaveAttribute('src', '/videos/hw01-web-protocols.mp4');
    expect(screen.getByText(/La web es el campo de batalla: HTTP manda todo en texto plano/)).toBeInTheDocument();
  });

  it('la lección web-04 incluye el video de dominios (hw-02) como paso 2', () => {
    renderLesson('/es/academy/hacking-web/web-04');
    expect(screen.getByText(/Antes de dispararle a una web/)).toBeInTheDocument();

    // paso 1=narrator, paso 2=video
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));

    const video = document.querySelector('video');
    expect(video).toHaveAttribute('src', '/videos/hw02-domains-subdirectories.mp4');
    expect(screen.getByText(/Mapeá el objetivo: dominio, subdominio y subdirectorio/)).toBeInTheDocument();
  });

  it('la lección web-01 incluye el video de XSS (hw-03) como paso 2', () => {
    renderLesson('/es/academy/hacking-web/web-01');
    expect(screen.getByText(/Hay una vulnerabilidad que no se ejecuta/)).toBeInTheDocument();

    // paso 1=narrator, paso 2=video
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));

    const video = document.querySelector('video');
    expect(video).toHaveAttribute('src', '/videos/hw03-xss.mp4');
    expect(screen.getByText(/XSS ejecuta JavaScript en el navegador de la víctima/)).toBeInTheDocument();
  });

  it('la lección web-02 incluye el video de SQL injection (hw-04) como paso 2', () => {
    renderLesson('/es/academy/hacking-web/web-02');
    expect(screen.getByText(/Si una app arma su consulta/)).toBeInTheDocument();

    // paso 1=narrator, paso 2=video
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));

    const video = document.querySelector('video');
    expect(video).toHaveAttribute('src', '/videos/hw04-sql-injection.mp4');
    expect(screen.getByText(/La inyección SQL te hace hablar directo con la base/)).toBeInTheDocument();
  });

  it('la lección web-03 incluye el video de path traversal y LFI (hw-05) como paso 2', () => {
    renderLesson('/es/academy/hacking-web/web-03');
    expect(screen.getByText(/Si la app usa tu input para elegir/)).toBeInTheDocument();

    // paso 1=narrator, paso 2=video
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));

    const video = document.querySelector('video');
    expect(video).toHaveAttribute('src', '/videos/hw05-path-traversal-lfi.mp4');
    expect(screen.getByText(/Path traversal escapa de la raíz web y el LFI lee el código fuente/)).toBeInTheDocument();
  });

  it('la lección bash-01 incluye el video de intro a bash (sl-01) como paso 2', () => {
    renderLesson('/es/academy/scripting/bash-01');
    expect(screen.getByText(/Antes de escribir exploits/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));

    const video = document.querySelector('video');
    expect(video).toHaveAttribute('src', '/videos/sl01-bash-intro.mp4');
    expect(screen.getByText(/Bash es la shell que se volvió lenguaje/)).toBeInTheDocument();
  });

  it('la lección bash-02 incluye el video de variables y condicionales (sl-02) como paso 2', () => {
    renderLesson('/es/academy/scripting/bash-02');
    expect(screen.getByText(/Un script que hace siempre lo mismo no sirve/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));

    const video = document.querySelector('video');
    expect(video).toHaveAttribute('src', '/videos/sl02-variables-conditionals.mp4');
    expect(screen.getByText(/Variables que guardan datos, argumentos/)).toBeInTheDocument();
  });

  it('la lección bash-03 incluye el video de bucles y funciones (sl-03) como paso 2', () => {
    renderLesson('/es/academy/scripting/bash-03');
    expect(screen.getByText(/El pentesting es repetir cosas a escala/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));

    const video = document.querySelector('video');
    expect(video).toHaveAttribute('src', '/videos/sl03-loops-functions.mp4');
    expect(screen.getByText(/Bucles para repetir a escala, funciones para organizar/)).toBeInTheDocument();
  });

  it('la lección bash-04 incluye el video de enumeración (sl-04) como paso 2', () => {
    renderLesson('/es/academy/scripting/bash-04');
    expect(screen.getByText(/Ahora sí: el primer caso real/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));

    const video = document.querySelector('video');
    expect(video).toHaveAttribute('src', '/videos/sl04-enumeration.mp4');
    expect(screen.getByText(/Tu primer caso real: ping sweep/)).toBeInTheDocument();
  });

  it('la lección bash-05 incluye el video de reverse shells (sl-05) como paso 2', () => {
    renderLesson('/es/academy/scripting/bash-05');
    expect(screen.getByText(/Dos jugadas finales con bash/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));

    const video = document.querySelector('video');
    expect(video).toHaveAttribute('src', '/videos/sl05-reverse-shells.mp4');
    expect(screen.getByText(/De scripts que reconocen a scripts que atacan/)).toBeInTheDocument();
  });

  it('la lección powershell-01 incluye el video de objetos y pipeline (ps-01) como paso 2', () => {
    renderLesson('/es/academy/scripting/powershell-01');
    expect(screen.getByText(/el lenguaje con el que se mueven los atacantes es PowerShell/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));

    const video = document.querySelector('video');
    expect(video).toHaveAttribute('src', '/videos/ps01-objects-pipeline.mp4');
    expect(screen.getByText(/PowerShell pasa objetos, no texto/)).toBeInTheDocument();
  });

  it('la lección powershell-02 incluye el video de variables y condiciones (ps-02) como paso 2', () => {
    renderLesson('/es/academy/scripting/powershell-02');
    expect(screen.getByText(/nació pensando en la consola/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));

    const video = document.querySelector('video');
    expect(video).toHaveAttribute('src', '/videos/ps02-variables-conditionals.mp4');
    expect(screen.getByText(/hashtables y condiciones con operadores palabra/)).toBeInTheDocument();
  });

  it('la lección powershell-03 incluye el video de bucles y cmdlets (ps-03) como paso 2', () => {
    renderLesson('/es/academy/scripting/powershell-03');
    expect(screen.getByText(/un puñado de cmdlets/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));

    const video = document.querySelector('video');
    expect(video).toHaveAttribute('src', '/videos/ps03-loops-cmdlets.mp4');
    expect(screen.getByText(/los cmdlets que más vas a usar/)).toBeInTheDocument();
  });

  it('la lección powershell-04 incluye el video de enumeración de Windows (ps-04) como paso 2', () => {
    renderLesson('/es/academy/scripting/powershell-04');
    expect(screen.getByText(/tu navaja suiza para enumerar/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));

    const video = document.querySelector('video');
    expect(video).toHaveAttribute('src', '/videos/ps04-windows-enumeration.mp4');
    expect(screen.getByText(/Tu navaja suiza en Windows/)).toBeInTheDocument();
  });

  it('la lección powershell-05 incluye el video de credenciales y ofuscación (ps-05) como paso 2', () => {
    renderLesson('/es/academy/scripting/powershell-05');
    expect(screen.getByText(/el lenguaje favorito en post-explotación de Windows/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));

    const video = document.querySelector('video');
    expect(video).toHaveAttribute('src', '/videos/ps05-credentials-obfuscation.mp4');
    expect(screen.getByText(/Las credenciales viven en LSASS/)).toBeInTheDocument();
  });

  it('la lección python-01 incluye el video de intro a Python (py-01) como paso 2', () => {
    renderLesson('/es/academy/scripting/python-01');
    expect(screen.getByText(/Si hay un lenguaje que domina el hacking/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));

    const video = document.querySelector('video');
    expect(video).toHaveAttribute('src', '/videos/py01-python-intro.mp4');
    expect(screen.getByText(/Python es el lenguaje del hacking/)).toBeInTheDocument();
  });

  it('la lección python-02 incluye el video de tipos y condiciones (py-02) como paso 2', () => {
    renderLesson('/es/academy/scripting/python-02');
    expect(screen.getByText(/Python tiene pocos tipos y muy intuitivos/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));

    const video = document.querySelector('video');
    expect(video).toHaveAttribute('src', '/videos/py02-types-conditions.mp4');
    expect(screen.getByText(/Cuatro tipos/)).toBeInTheDocument();
  });

  it('la lección python-03 incluye el video de bucles y librerías (py-03) como paso 2', () => {
    renderLesson('/es/academy/scripting/python-03');
    expect(screen.getByText(/El 80% de tus scripts serán bucles/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));

    const video = document.querySelector('video');
    expect(video).toHaveAttribute('src', '/videos/py03-loops-libraries.mp4');
    expect(screen.getByText(/funciones con def/)).toBeInTheDocument();
  });

  it('la lección python-04 incluye el video de scanner con socket (py-04) como paso 2', () => {
    renderLesson('/es/academy/scripting/python-04');
    expect(screen.getByText(/un scanner de puertos en Python/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));

    const video = document.querySelector('video');
    expect(video).toHaveAttribute('src', '/videos/py04-socket-networking.mp4');
    expect(screen.getByText(/Tu primer script de red/)).toBeInTheDocument();
  });

  it('la lección python-05 incluye el video de HTTP con requests (py-05) como paso 2', () => {
    renderLesson('/es/academy/scripting/python-05');
    expect(screen.getByText(/La web es el blanco número uno/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));

    const video = document.querySelector('video');
    expect(video).toHaveAttribute('src', '/videos/py05-http-requests.mp4');
    expect(screen.getByText(/HTTP en tres líneas con requests/)).toBeInTheDocument();
  });
});
