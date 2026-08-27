# ZeroInfra Labs — Simulador de Pentesting

> Plataforma web para aprender ciberseguridad ofensiva con laboratorios interactivos en el navegador. Sin instalación, sin VMs, solo abrir y hackear.

## 🚀 Quick Start

```bash
pnpm install              # Instalar dependencias
pnpm dev                  # Servidor de desarrollo (puerto 5173)
pnpm build                # Producción
pnpm preview              # Vista previa de build
pnpm test                 # Vitest watch mode
pnpm test:run             # Tests en single run (CI)
pnpm test -- -t "filter"  # Tests por nombre
pnpm test:coverage        # Tests con cobertura
pnpm test:ui              # Vitest UI mode
pnpm exec tsc --noEmit    # Type check
```

Abre `http://localhost:5173` y selecciona un laboratorio para comenzar.

> Nota: TypeScript configurado en modo `strict: true` (con `noUnusedLocals` y `noUnusedParameters`). Sin errores en `tsc --noEmit`. ESLint con flat config (`pnpm lint`) en modo orientativo; no se usa Prettier.

## 🧪 Laboratorios Disponibles (7)

| Lab | Nombre | Dificultad | Skills |
|-----|--------|------------|--------|
| 01 | **WordPress Vulnerable** | Medium | Web enum, WP compromise, SSH |
| 02 | **Web OSINT & SSH** | Easy | OSINT, Hydra brute force |
| 03 | **EternalBlue MS17-010** | Easy | Metasploit, Windows exploit |
| 04 | **LFI to RCE** | Medium | File inclusion, reverse shell |
| 05 | **FTP Enum & PrivEsc** | Medium | FTP, sudo vim privilege escalation |
| 06 | **SQL Injection** | Medium | SQLi, database exfiltration |
| 07 | **Burp Suite Web Pentesting** | Medium | SQLi manual, Burp Proxy + Repeater |

> 📖 Ver [docs/LABS.md](docs/LABS.md) para guías detalladas de cada laboratorio.

## 🎯 Características Principales

- **Academy** — 8 paths de estudio con 58 lecciones (SO, Redes I/II, Protocolos, Ciberseguridad, Pentesting, Hacking Web, Scripting) con quizzes y progreso persistente
- **Video-lecciones Remotion** — 39 composiciones animadas que acompañan las lecciones de la Academy
- **Terminal Linux realista** — 71 comandos funcionales con auto-registro (ls, cd, cat, nano, sudo, nmap, hydra, ssh, msfconsole, iptables, cron...)
- **Modelo de permisos Linux avanzado** — Simulación de SUID, SGID, Sticky bit, umask y ownership por usuario
- **7 Laboratorios progresivos** — De reconocimiento a Burp Suite (Proxy + Repeater)
- **Sistema de Validación Universal** — Comandos libres, 17 criteria types de validación
- **CommandResponse fuertemente tipado** — Discriminated Union de 16 variantes en TypeScript
- **Metasploit Framework simulado** — msfconsole con sesiones, módulos aux/exploit, contexto-aware prompts
- **Burp Suite simulado** — Proxy interceptor + Repeater para repetir/modificar requests HTTP
- **Shells interactivas** — SSH, FTP, Netcat con manejo de sesiones unificado
- **Navegador web simulado** — Para ataques web (WordPress, LFI, SQLi)
- **Desktop Mode** — Ventanas flotantes en cascada, wallpaper picker, entorno tipo escritorio
- **Manual de uso del simulador (ES/EN)** — Lector PDF en el escritorio con el manual del simulador en español e inglés según el idioma de la interfaz
- **Guía interactiva con Foxy** — Tour guiado con spotlight que recorre el escritorio, la topología de red y la enumeración automática
- **Network Map** — Topología visual de máquinas descubiertas con panel de enumeración (el botón "Ver red" se ilumina cuando hay novedades)
- **Blog** — Artículos educativos sobre ciberseguridad (ES/EN)
- **Sistema de pistas progresivas** — Ayuda opcional por misión (2 niveles)
- **Dark/Light Theme** — Alternancia entre temas en landing y workspace
- **Feedback y Analytics** — Encuestas post-lab, tracking de progreso, donaciones
- **i18n** — Español e Inglés
- **1918 Tests** — Vitest + React Testing Library (147 archivos de prueba)

## 🏗️ Tech Stack

- **Frontend:** React ^18.3 + TypeScript (`strict: true`) + Vite 7
- **Styling:** Tailwind CSS v4
- **State:** Zustand 5 (5 slices modulares + persistencia segura solo para UI preferences y progreso Academy)
- **Testing:** Vitest 4.x + React Testing Library + jsdom
- **Router:** React Router DOM v7
- **Video:** Remotion 4 (composiciones de video-lecciones)
- **Analytics:** Vercel Analytics + Speed Insights
- **Gestor de Paquetes:** pnpm

> 🔧 Ver [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) para detalles de arquitectura y sistema de validación.

## 📂 Estructura del Proyecto

```
src/
├── academy/          # 8 paths / 58 lecciones: path-*.ts + *-lessons.ts
├── video/            # Composiciones Remotion de video-lecciones (39)
├── commands/
│   ├── builtin/     # help, ls, cd, cat, mkdir, rmdir, sudo, whoami, ps, top, ping, nano, iptables, cron, etc. (59)
│   └── tools/       # nmap, hydra, ssh, ftp, nc, gobuster, arp-scan, netdiscover, curl, msfconsole, apt, dpkg (12)
├── components/
│   ├── landing/     # SiteHeader, PageHero, LandingLabPreview, MarketingFooter
│   ├── academy/     # Pantallas de la Academy (paths, lecciones, quizzes, simulador de red)
│   ├── tour/        # FoxyTour (guía interactiva)
│   ├── BlogListPage.tsx, BlogArticlePage.tsx
│   ├── DesktopTerminal.tsx, DesktopTopBar.tsx, AnimatedDesktop.tsx
│   ├── NetworkMap.tsx, EnumerationPanel.tsx
│   ├── Terminal.tsx, FakeBrowser.tsx, StreamingOutput.tsx
│   ├── AdminPanel.tsx, FeedbackModal.tsx, SurveyModal.tsx
│   └── ... (100+ componentes)
├── frameworks/
│   ├── metasploit/  # MSF console state machine + módulos (aux, exploit, post)
│   ├── shells/      # Shells interactivas (SSH, FTP, Netcat)
│   ├── process/     # ProcessManager (ps, kill, systemctl)
│   ├── network/     # NetworkState (iptables, ufw, interfaces)
│   ├── packages/    # PackageManager (apt, dpkg)
│   ├── cron/        # CronRunner (reloj virtual + cron jobs → syslog)
│   └── fs/          # mounts.ts (fstab + estado de montajes)
├── hooks/           # 14 hooks especializados: useCommandRunner (orquestador),
│                    # useIdentityStack, useFtpSession, useSshSession, usePendingSu,
│                    # useReverseShell, useAutoRefresh, useDownloadedFile, useTerminalEffects,
│                    # useNanoSave, useMissionCompletion, streamingConfig
├── i18n/            # Traducciones español/inglés
├── laboratorios/    # Definición de labs (01-07) + templates + attackers (Kali)
├── fs-models/       # Modelos de filesystem (Linux, Windows, Kali)
├── store/           # Zustand: 5 slices (ui, terminal, scenario, identity, academy) + persistencia segura
├── blog/            # Datos de artículos del blog
├── types/           # Tipos compartidos por dominio (command, machine, mission, academy)
├── utils/           # labValidator, permissions, fs, path, autocomplete, network, analytics, logger
└── test/            # Setup global de tests (Vitest mocks, matchMedia, history)

docs/
├── LABS.md          # Guías detalladas de cada laboratorio
├── ARCHITECTURE.md  # Arquitectura y sistema de validación
├── DEVELOPMENT.md   # Guía de desarrollo
├── TESTING.md       # Estrategia de testing
├── ROADMAP.md       # Plan de implementación futura
├── OVERVIEW.md      # Detalle de analytics (webhook, Google Sheets) y visión de producto
├── CHANGELOG.md     # Historial de cambios
├── archive/         # Histórico de mejoras y planes completados (MEJORAS.md, etc.)
└── nmap/            # Documentación del comando nmap (help.md, man.md)
```

## 📊 Estado del Proyecto

- ✅ 7 Laboratorios funcionales
- ✅ 1918 tests pasando (147 test files)
- ✅ TypeScript `strict: true` con 0 errores (`pnpm exec tsc --noEmit`)
- ✅ Persistencia segura en `localStorage` (solo UI preferences y progreso Academy; secrets no expuestos)
- ✅ `CommandResponse` fuertemente tipado (Discriminated Union de 16 variantes)
- ✅ Validación universal (17 criteria types, 17 validators)
- ✅ Permisos de sistema de archivos (SUID, SGID, Sticky bit, umask, ownership)
- ✅ Metasploit simulado (sesiones, módulos aux/exploit/post)
- ✅ Burp Suite simulado (Proxy interceptor + Repeater)
- ✅ Shells interactivas (SSH, FTP, Netcat)
- ✅ Desktop mode con ventanas flotantes y wallpapers
- ✅ Network map con panel de enumeración
- ✅ Academy: 8 paths / 58 lecciones con quizzes y progreso persistente
- ✅ Video-lecciones Remotion (39 composiciones)
- ✅ Blog con artículos ES/EN
- ✅ Landing page + selección de labs
- ✅ Dark/Light theme
- ✅ Sistema de feedback, analytics y donaciones
- ✅ **Arquitectura refactorizada** — `useCommandRunner` (orquestador), 5 slices en store, auto-registro de comandos

## 📚 Documentación

- **[docs/LABS.md](docs/LABS.md)** — Guías detalladas de cada laboratorio
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** — Arquitectura y sistema de validación
- **[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)** — Guía de desarrollo
- **[docs/TESTING.md](docs/TESTING.md)** — Estrategia de testing
- **[docs/ROADMAP.md](docs/ROADMAP.md)** — Plan de implementación futura
- **[docs/OVERVIEW.md](docs/OVERVIEW.md)** — Detalle de analytics (webhook, Google Sheets) y visión de producto
- **[docs/CHANGELOG.md](docs/CHANGELOG.md)** — Historial de cambios
- **[docs/PROYECTO_ACADEMY.md](docs/PROYECTO_ACADEMY.md)** — Diseño de la Academy (paths, lecciones, quizzes)
- **[docs/archive/MEJORAS.md](docs/archive/MEJORAS.md)** — Plan unificado de mejoras y refactorización técnica completado
- **[CLAUDE.md](CLAUDE.md)** — Guía completa para desarrollo asistido

## 🐛 Bugs Conocidos

Actualmente no hay ningún bug abierto conocido. (Bug #3 y Bug #6 verificados como resueltos).

## 🔒 Seguridad

Este es un **simulador educativo**. Todos los hashes y credenciales son ficticios. No se promueve ninguna actividad ilegal.

Ver [SECURITY.md](docs/SECURITY.md) para más información.

## 📝 Licencia

MIT © ZeroInfra Labs

---

<p align="center">
  <a href="docs/LABS.md">🧪 Labs</a> •
  <a href="docs/ARCHITECTURE.md">🏗️ Arquitectura</a> •
  <a href="docs/CHANGELOG.md">📜 Changelog</a>
</p>
