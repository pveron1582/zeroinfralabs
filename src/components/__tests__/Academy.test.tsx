import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AcademyHome } from '../academy/AcademyHome';
import { AcademyPathPage } from '../academy/AcademyPath';
import { LessonViewer } from '../academy/LessonViewer';
import { useScenarioStore } from '../../store/scenarioStore';
import { ACADEMY_PATHS, getAllLessons } from '../../academy/paths';

vi.mock('../landing/SiteHeader', () => ({
  SiteHeader: () => <header data-testid="site-header">header</header>,
}));

vi.mock('../landing/MarketingFooter', () => ({
  MarketingFooter: () => <footer data-testid="footer">footer</footer>,
}));

function renderAcademy(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/:lang/academy" element={<AcademyHome />} />
        <Route path="/:lang/academy/:pathId" element={<AcademyPathPage />} />
        <Route path="/:lang/academy/:pathId/module/:subId" element={<AcademyPathPage />} />
        <Route path="/:lang/academy/:pathId/:lessonId" element={<LessonViewer />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Academy', () => {
  beforeEach(() => {
    useScenarioStore.setState({ language: 'es', completedLessons: [] });
  });

  describe('AcademyHome', () => {
    it('renderiza las 6 categorías principales', () => {
      renderAcademy('/es/academy');
      // Los headers de grupo
      expect(screen.getByText('Sistemas Operativos')).toBeInTheDocument();
      expect(screen.getByText('Redes')).toBeInTheDocument();
      expect(screen.getByText('Hacking Ético')).toBeInTheDocument();
      // Las tarjetas individuales (3 de redes + ciberseguridad + pentesting + hacking web)
      expect(screen.getByText('Fundamentos de redes')).toBeInTheDocument();
      expect(screen.getByText('Redes I')).toBeInTheDocument();
      expect(screen.getByText('Redes II')).toBeInTheDocument();
      expect(screen.getByText('Fundamentos de Ciberseguridad')).toBeInTheDocument();
      expect(screen.getByText('Pentesting')).toBeInTheDocument();
      expect(screen.getByText('Hacking Web')).toBeInTheDocument();
      // El módulo de scripting dentro de Hacking Ético
      expect(screen.getByText('Scripting para pentesting')).toBeInTheDocument();
      expect(screen.getByText('Bash')).toBeInTheDocument();
      expect(screen.getByText('PowerShell')).toBeInTheDocument();
      expect(screen.getByText('Python')).toBeInTheDocument();
    });

    it('muestra las categorías con sus subsecciones apiladas verticalmente', () => {
      renderAcademy('/es/academy');
      // Cada subsección aparece como row completo
      expect(screen.getByText('Linux')).toBeInTheDocument();
      expect(screen.getByText('Windows')).toBeInTheDocument();
      expect(screen.getByText('Otros sistemas operativos y hardware')).toBeInTheDocument();
      // Conteos de lecciones: Linux=5, Windows=5, Otros=4, Redes=5, Protocolos=5,
      // Protocolos II=5, Ciberseguridad=5, Hacking=5, Hacking Web=1, Bash=5, PowerShell=5, Python=5
      // /0\/5/ también matchea el progreso global "0/55 lecciones" → 10 cards + 1 global
      expect(screen.getAllByText(/0\/5/)).toHaveLength(11);
      expect(screen.getAllByText(/\b0\/4\b/)).toHaveLength(1);
      expect(screen.queryAllByText(/\b0\/3\b/)).toHaveLength(0);
      expect(screen.queryAllByText(/\b0\/6\b/)).toHaveLength(0);
      expect(screen.getAllByText(/\b0\/1\b/)).toHaveLength(1);
    });

    it('muestra el progreso general correctamente', () => {
      useScenarioStore.setState({ completedLessons: ['linux-01', 'linux-02', 'network-04', 'ciber-01', 'hacking-01'] });
      renderAcademy('/es/academy');

      expect(screen.getByText('Tu progreso general')).toBeInTheDocument();
      const progress = screen.getByTestId('overall-progress');
      expect(progress.textContent).toContain('9%'); // 5 de 55 lecciones
      expect(screen.getByText(/5\/55/)).toBeInTheDocument();
    });

    it('el progreso global muestra /55 lecciones', () => {
      renderAcademy('/es/academy');
      expect(screen.getByText(/0\/55/)).toBeInTheDocument();
    });
  });

  describe('AcademyPathPage', () => {
    it('redirige /academy/os al primer módulo (/module/linux) sin sidebar', () => {
      renderAcademy('/es/academy/os');
      // Las subsecciones se muestran como lecciones de Linux; ya no hay botones de sidebar
      expect(screen.getByText('Por qué Linux: historia, software libre y dónde vive')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /^Windows/ })).not.toBeInTheDocument();
    });

    it('muestra las 5 lecciones de Linux por defecto', () => {
      renderAcademy('/es/academy/os/module/linux');
      expect(screen.getByRole('heading', { name: 'Linux' })).toBeInTheDocument();
      expect(screen.getByText('Por qué Linux: historia, software libre y dónde vive')).toBeInTheDocument();
      expect(screen.getByText('La terminal: shells, PATH, prompt y flags')).toBeInTheDocument();
      expect(screen.getByText('Comandos base: pwd, echo, id, ls')).toBeInTheDocument();
      expect(screen.getByText('Crear y editar: touch, mkdir, nano')).toBeInTheDocument();
      expect(screen.getByText(/Permisos: rwx, octal/)).toBeInTheDocument();
    });

    it('muestra el módulo Windows con sus 5 lecciones en /module/windows', () => {
      renderAcademy('/es/academy/os/module/windows');
      expect(screen.getByRole('heading', { name: 'Windows' })).toBeInTheDocument();
      expect(screen.getByText('Historia de Windows: orígenes, versiones y el modelo privativo')).toBeInTheDocument();
      expect(screen.getByText('Versiones actuales: Windows 10, 11 y Server')).toBeInTheDocument();
      expect(screen.getByText('Seguridad: firewall, Defender, UAC, políticas de grupo y más')).toBeInTheDocument();
      expect(screen.getByText('Sistema de archivos, usuarios y permisos NTFS')).toBeInTheDocument();
      expect(screen.getByText('Servicios de red: SMB, RDP y WinRM')).toBeInTheDocument();
      expect(screen.queryByText('Por qué Linux: historia, software libre y dónde vive')).not.toBeInTheDocument();
    });

    it('muestra el módulo Otros con sus lecciones en /module/others', () => {
      renderAcademy('/es/academy/os/module/others');
      expect(screen.getByRole('heading', { name: 'Otros sistemas operativos y hardware' })).toBeInTheDocument();
      expect(screen.getByText('Sistemas alternativos de PC y servidores: macOS, BSD y ChromeOS')).toBeInTheDocument();
      expect(screen.getByText('Equipos portátiles y de electrónica: Android, iOS y Raspberry Pi')).toBeInTheDocument();
      expect(screen.getByText('Hardware de hacking: WiFi Pineapple, Flipper Zero, Rubber Ducky y compañía')).toBeInTheDocument();
      expect(screen.getByText('Gadgets ofensivos e ingeniería social (solo educativo)')).toBeInTheDocument();
      expect(screen.queryByText('Por qué Linux: historia, software libre y dónde vive')).not.toBeInTheDocument();
    });

    it('muestra el progreso del módulo con conteo y porcentaje', () => {
      useScenarioStore.setState({ completedLessons: ['linux-01'] });
      renderAcademy('/es/academy/os/module/linux');
      // 1 de 14 (5 linux + 5 windows + 4 others) = 7%
      const prog = screen.getByText('lecciones completadas', { exact: false });
      expect(prog.textContent).toContain('1');
      expect(prog.textContent).toContain('14');
      expect(screen.getByText('7%')).toBeInTheDocument();
    });

    it('redirige al index si el path no existe', () => {
      renderAcademy('/es/academy/no-existe');
      expect(screen.getByText('Sistemas Operativos')).toBeInTheDocument(); // volvió al home
    });

    it('muestra las 5 lecciones de Fundamentos de redes', () => {
      renderAcademy('/es/academy/redes');
      expect(screen.getByText('¿Qué es una red? Tipos: LAN, MAN, WAN y VPN')).toBeInTheDocument();
      expect(screen.getByText('Cómo se comunican: direcciones IP públicas y privadas')).toBeInTheDocument();
      expect(screen.getByText('Dispositivos básicos: hub, switch y router + topologías')).toBeInTheDocument();
      expect(screen.getByText('Modelo OSI y TCP/IP: las capas')).toBeInTheDocument();
      expect(screen.getByText('Direccionamiento: dirección, máscara, puerta de enlace y DNS')).toBeInTheDocument();
    });

    it('muestra las 5 lecciones de Redes I (switch y router unificadas + VLANs)', () => {
      renderAcademy('/es/academy/protocolos');
      expect(screen.getByText('Protocolos por capa: los imprescindibles')).toBeInTheDocument();
      expect(screen.getByText('Puertos: qué son, cuántos hay y los que tenés que conocer')).toBeInTheDocument();
      expect(screen.getByText('Servicios de red comunes: SMB, FTP, SSH y VNC')).toBeInTheDocument();
      expect(screen.getByText('Dispositivos esenciales de red: hub, switch y router')).toBeInTheDocument();
      expect(screen.getByText('VLANs: segmentación por diseño')).toBeInTheDocument();
      expect(screen.queryByText('El switch: el dispositivo de capa 2')).not.toBeInTheDocument();
      expect(screen.queryByText('El router: el dispositivo de capa 3')).not.toBeInTheDocument();
      expect(screen.queryByText('Protocolos en hacking web: HTTP, HTTPS y más')).not.toBeInTheDocument();
    });

    it('muestra las 5 lecciones de Redes II (DHCP, NAT, DNS, DMZ y VPN)', () => {
      renderAcademy('/es/academy/protocolos-ii');
      expect(screen.getByText('DHCP: el servicio que reparte las direcciones IP')).toBeInTheDocument();
      expect(screen.getByText('NAT: cómo toda tu red sale a internet con una sola IP')).toBeInTheDocument();
      expect(screen.getByText('DNS: cómo busca los nombres la internet')).toBeInTheDocument();
      expect(screen.getByText('DMZ: separando lo público de lo privado')).toBeInTheDocument();
      expect(screen.getByText('VPN: túneles cifrados que extienden la red')).toBeInTheDocument();
      expect(screen.queryByText('Tu primera red doméstica: switch, router y de dónde sale internet')).not.toBeInTheDocument();
      expect(screen.queryByText('Qué es un puerto y por qué importa')).not.toBeInTheDocument();
      expect(screen.queryByText('Servicios clásicos: dónde mirar primero')).not.toBeInTheDocument();
      expect(screen.queryByText('Man-in-the-middle: interceptando tráfico')).not.toBeInTheDocument();
    });

    it('muestra las 5 lecciones de Pentesting (sin la de hacking web, movida a su módulo)', () => {
      renderAcademy('/es/academy/hacking');
      expect(screen.getByText('Las 5 fases: el método, no el caos')).toBeInTheDocument();
      expect(screen.getByText('Dónde está la información en cada sistema')).toBeInTheDocument();
      expect(screen.getByText('Man-in-the-middle: interceptando tráfico')).toBeInTheDocument();
      expect(screen.getByText('Cracking offline: john y hashcat')).toBeInTheDocument();
      expect(screen.getByText('Cracking online: medusa, hydra y ncrack')).toBeInTheDocument();
      expect(screen.queryByText('Protocolos en hacking web: HTTP, HTTPS y más')).not.toBeInTheDocument();
      expect(screen.queryByText('Information gathering: qué es, la ley y las herramientas')).not.toBeInTheDocument();
    });

    it('muestra la lección de Protocolos en hacking web en el módulo Hacking Web', () => {
      renderAcademy('/es/academy/hacking-web');
      expect(screen.getByRole('heading', { name: 'Hacking Web' })).toBeInTheDocument();
      expect(screen.getByText('Protocolos en hacking web: HTTP, HTTPS y más')).toBeInTheDocument();
      expect(screen.getByText('0 de 1 lecciones completadas')).toBeInTheDocument();
      expect(screen.queryByText('Man-in-the-middle: interceptando tráfico')).not.toBeInTheDocument();
    });

    it('muestra las 5 lecciones de Fundamentos de Ciberseguridad (incluye Information Gathering y OWASP)', () => {
      renderAcademy('/es/academy/ciberseguridad');
      expect(screen.getByText('La triada CID con ejemplos reales')).toBeInTheDocument();
      expect(screen.getByText('Hashes, cifrado y cómo se crackean las contraseñas')).toBeInTheDocument();
      expect(screen.getByText('Information gathering: qué es, la ley y las herramientas')).toBeInTheDocument();
      expect(screen.getByText('Bases de criptografía: cifrar vs hashear')).toBeInTheDocument();
      expect(screen.getByText('El OWASP Top Ten: dónde mirar primero')).toBeInTheDocument();
      expect(screen.queryByText('Man-in-the-middle: interceptando tráfico')).not.toBeInTheDocument();
    });

    it('redirige /academy/scripting al primer módulo (/module/bash)', () => {
      renderAcademy('/es/academy/scripting');
      expect(screen.getByText('Qué es bash: la shell que se volvió lenguaje')).toBeInTheDocument();
    });

    it('muestra el módulo Bash con sus 5 lecciones en /module/bash', () => {
      renderAcademy('/es/academy/scripting/module/bash');
      expect(screen.getByRole('heading', { name: 'Bash' })).toBeInTheDocument();
      expect(screen.getByText('Qué es bash: la shell que se volvió lenguaje')).toBeInTheDocument();
      expect(screen.getByText('Bases: variables, argumentos y condicionales')).toBeInTheDocument();
      expect(screen.getByText('Bucles, funciones y filtros de texto')).toBeInTheDocument();
      expect(screen.getByText('Pentesting I: enumeración con bash')).toBeInTheDocument();
      expect(screen.getByText('Pentesting II: automatización y reverse shells')).toBeInTheDocument();
      expect(screen.queryByText('Qué es PowerShell: objetos, no texto')).not.toBeInTheDocument();
    });

    it('muestra el módulo PowerShell con sus 5 lecciones en /module/powershell', () => {
      renderAcademy('/es/academy/scripting/module/powershell');
      expect(screen.getByRole('heading', { name: 'PowerShell' })).toBeInTheDocument();
      expect(screen.getByText('Qué es PowerShell: objetos, no texto')).toBeInTheDocument();
      expect(screen.getByText('Bases: variables, arrays y condiciones')).toBeInTheDocument();
      expect(screen.getByText('Bucles, funciones y cmdlets útiles')).toBeInTheDocument();
      expect(screen.getByText('Pentesting I: enumeración de Windows')).toBeInTheDocument();
      expect(screen.getByText('Pentesting II: credenciales, ofuscación y exfiltración')).toBeInTheDocument();
    });

    it('muestra el módulo Python con sus 5 lecciones en /module/python', () => {
      renderAcademy('/es/academy/scripting/module/python');
      expect(screen.getByRole('heading', { name: 'Python' })).toBeInTheDocument();
      expect(screen.getByText('Qué es Python: el lenguaje del hacking')).toBeInTheDocument();
      expect(screen.getByText('Bases: variables, tipos y condiciones')).toBeInTheDocument();
      expect(screen.getByText('Bucles, funciones y librerías')).toBeInTheDocument();
      expect(screen.getByText('Pentesting I: redes con socket')).toBeInTheDocument();
      expect(screen.getByText('Pentesting II: HTTP con requests')).toBeInTheDocument();
    });
  });

  describe('LessonViewer', () => {
    it('muestra el primer paso (Foxy narrator) de linux-01', () => {
      renderAcademy('/es/academy/os/linux-01');
      expect(screen.getByText(/Antes de hackear un Linux/)).toBeInTheDocument();
      expect(screen.getByText(/Paso 1 de 8/)).toBeInTheDocument();
    });

    it('el back link de una lección OS vuelve a su módulo (/academy/os/module/linux)', () => {
      renderAcademy('/es/academy/os/linux-01');
      const link = screen.getByRole('link', { name: /Sistemas Operativos/ });
      expect(link).toHaveAttribute('href', '/es/academy/os/module/linux');
    });

    it('el back link de una lección flat (protocolos-ii) vuelve al path', () => {
      renderAcademy('/es/academy/protocolos-ii/network-04');
      const link = screen.getByRole('link', { name: /Redes II/ });
      expect(link).toHaveAttribute('href', '/es/academy/protocolos-ii');
    });

    it('el back link de una lección de scripting vuelve a su módulo', () => {
      renderAcademy('/es/academy/scripting/bash-01');
      const link = screen.getByRole('link', { name: /Scripting para pentesting/ });
      expect(link).toHaveAttribute('href', '/es/academy/scripting/module/bash');
    });

    it('avanza con Siguiente desde el narrator al content', () => {
      renderAcademy('/es/academy/os/linux-01');
      fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
      expect(screen.getByText(/1991: un estudiante finlandés/)).toBeInTheDocument();
    });

    it('renderiza terminal-demo con comando y output en linux-02', () => {
      renderAcademy('/es/academy/os/linux-02');
      // paso 1=narrator, 2=content, 3=video, 4=content, 5=terminal-demo echo $PATH
      for (let i = 0; i < 4; i++) {
        fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
      }
      expect(screen.getByText(/\$ echo \$PATH/)).toBeInTheDocument();
    });

    it('el quiz bloquea el avance hasta responder bien', () => {
      renderAcademy('/es/academy/os/linux-01');
      const steps = ACADEMY_PATHS.find(p => p.id === 'os')!.subSections![0].lessons[0].steps;
      // avanzar hasta el último paso (quiz)
      for (let i = 0; i < steps.length - 1; i++) {
        fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
      }
      expect(screen.getByText(/Comprobá lo aprendido/)).toBeInTheDocument();

      const nextBtn = screen.getByRole('button', { name: /Completar lección/ });
      expect(nextBtn).toBeDisabled();

      // Respuesta incorrecta (primera opción = "Ejecutar el programa...")
      fireEvent.click(screen.getByText(/Ejecutar el programa/));
      expect(screen.getByText(/No exactamente/)).toBeInTheDocument();
      // La correcta queda marcada con ✓
      expect(screen.getByText(/✓ Que sea siempre gratis/)).toBeInTheDocument();
    });

    it('completar windows-01 (lección con quiz) marca la lección y vuelve al path', () => {
      renderAcademy('/es/academy/os/windows-01');
      const total = getAllLessons().find(l => l.id === 'windows-01')!.steps.length;
      // Avanzar hasta el quiz y responder
      for (let i = 0; i < total - 1; i++) {
        fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
      }
      // responder bien (privativo = código fuente cerrado con licencia)
      fireEvent.click(screen.getByText(/código fuente es cerrado/));
      fireEvent.click(screen.getByRole('button', { name: /Completar lección ✓/ }));
      expect(useScenarioStore.getState().completedLessons).toContain('windows-01');
    });

    it('el matching (proto-07) bloquea el avance hasta emparejar todos los pares', () => {
      renderAcademy('/es/academy/protocolos/proto-07');
      const total = getAllLessons().find(l => l.id === 'proto-07')!.steps.length;
      expect(total).toBe(9); // narrator + video + 4 contents + matching + sim + quiz
      // Avanzar hasta el paso de matching (paso 7 de 9)
      for (let i = 0; i < 6; i++) {
        fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
      }
      expect(screen.getByText(/Emparejá los pares/)).toBeInTheDocument();
      const nextBtn = screen.getByRole('button', { name: /Siguiente/ });
      expect(nextBtn).toBeDisabled();

      // Resolver los 5 pares (la columna derecha está barajada, pero el
      // data-testid conserva el índice original del par)
      for (let i = 0; i < 5; i++) {
        fireEvent.click(screen.getByTestId(`match-left-${i}`));
        fireEvent.click(screen.getByTestId(`match-right-${i}`));
      }
      expect(screen.getByText(/Todo emparejado/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Siguiente/ })).not.toBeDisabled();

      // Siguiente → simulador → quiz final (capa 2) → completar lección
      fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
      fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
      expect(screen.getByText(/Comprobá lo aprendido/)).toBeInTheDocument();
      fireEvent.click(screen.getByText(/^Capa 2$/));
      fireEvent.click(screen.getByRole('button', { name: /Completar lección ✓/ }));
      expect(useScenarioStore.getState().completedLessons).toContain('proto-07');
    });

    it('redirige si la lección no existe', () => {
      renderAcademy('/es/academy/os/no-existe');
      expect(screen.getByText('Sistemas Operativos')).toBeInTheDocument(); // volvió al home
    });
  });
});
