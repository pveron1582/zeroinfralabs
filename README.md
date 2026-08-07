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

> Nota: TypeScript configurado en modo `strict: true` (con `noUnusedLocals` y `noUnusedParameters`). Sin errores en `tsc --noEmit`. No se usa ESLint ni Prettier.

## 🧪 Laboratorios Disponibles (6)

| Lab | Nombre | Dificultad | Skills |
|-----|--------|------------|--------|
| 01 | **WordPress Vulnerable** | Medium | Web enum, WP compromise, SSH |
| 02 | **Web OSINT & SSH** | Easy | OSINT, Hydra brute force |
| 03 | **EternalBlue MS17-010** | Easy | Metasploit, Windows exploit |
| 04 | **LFI to RCE** | Medium | File inclusion, reverse shell |
| 05 | **FTP Enum & PrivEsc** | Medium | FTP, sudo vim privilege escalation |
| 06 | **SQL Injection** | Medium | SQLi, database exfiltration |

> 📖 Ver [docs/LABS.md](docs/LABS.md) para guías detalladas de cada laboratorio.

## 🎯 Características Principales

- **Terminal Linux realista** — 70 comandos funcionales con auto-registro (ls, cd, cat, nano, sudo, nmap, hydra, ssh, msfconsole, iptables, cron...)
- **Modelo de permisos Linux avanzado** — Simulación de SUID, SGID, Sticky bit, umask y ownership por usuario
- **6 Laboratorios progresivos** — De reconocimiento a privilege escalation
- **Sistema de Validación Universal** — Comandos libres, 16 criteria types de validación
- **CommandResponse fuertemente tipado** — Discriminated Union de 15 variantes en TypeScript
- **Metasploit Framework simulado** — msfconsole con sesiones, módulos aux/exploit, contexto-aware prompts
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
- **1680 Tests** — Vitest + React Testing Library (128 archivos de prueba)

## 🏗️ Tech Stack

- **Frontend:** React ^18.3 + TypeScript (`strict: true`) + Vite 7
- **Styling:** Tailwind CSS v4
- **State:** Zustand 5 (4 slices modulares + persistencia segura solo para UI preferences)
- **Testing:** Vitest 4.x + React Testing Library + jsdom
- **Router:** React Router DOM v7
- **Analytics:** Vercel Analytics + Speed Insights
- **Gestor de Paquetes:** pnpm

> 🔧 Ver [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) para detalles de arquitectura y sistema de validación.

## 📂 Estructura del Proyecto

```
src/
├── commands/
│   ├── builtin/     # help, ls, cd, cat, mkdir, rmdir, sudo, whoami, ps, top, ping, nano, iptables, cron, etc. (59)
│   └── tools/       # nmap, hydra, ssh, ftp, nc, gobuster, arp-scan, msfconsole, curl, apt, dpkg (11)
├── components/
│   ├── landing/     # SiteHeader, PageHero, LandingLabPreview, MarketingFooter
│   ├── BlogListPage.tsx, BlogArticlePage.tsx
│   ├── DesktopTerminal.tsx, DesktopTopBar.tsx, AnimatedDesktop.tsx
│   ├── NetworkMap.tsx, EnumerationPanel.tsx
│   ├── Terminal.tsx, FakeBrowser.tsx, StreamingOutput.tsx
│   ├── AdminPanel.tsx, FeedbackModal.tsx, SurveyModal.tsx
│   └── ... (30+ componentes)
├── frameworks/
│   ├── metasploit/  # MSF console state machine + módulos (aux, exploit, post)
│   └── shells/      # Shells interactivas (SSH, FTP, Netcat)
├── hooks/           # 12 hooks especializados: useCommandRunner (orquestador),
│                    # useIdentityStack, useFtpSession, useSshSession, usePendingSu,
│                    # useReverseShell, useAutoRefresh, useDownloadedFile, useTerminalEffects,
│                    # useNanoSave, useMissionCompletion, streamingConfig
├── i18n/            # Traducciones español/inglés
├── laboratorios/    # Definición de labs (01-06) + templates + attackers (Kali)
├── fs-models/       # Modelos de filesystem (Linux, Windows, Kali)
├── store/           # Zustand: 4 slices (ui, terminal, scenario, identity) + persistencia segura de UI
├── blog/            # Datos de artículos del blog
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

- ✅ 6 Laboratorios funcionales
- ✅ 1680 tests pasando (128 test files)
- ✅ TypeScript `strict: true` con 0 errores (`pnpm exec tsc --noEmit`)
- ✅ Persistencia segura en `localStorage` (solo UI preferences; secrets no expuestos)
- ✅ `CommandResponse` fuertemente tipado (Discriminated Union de 15 variantes)
- ✅ Permisos de sistema de archivos (SUID, SGID, Sticky bit, umask, ownership)
- ✅ Manual de uso del simulador en ES/EN (lector PDF en el escritorio)
- ✅ Validación universal (16 criteria types)
- ✅ Metasploit simulado (sesiones, módulos aux/exploit/post)
- ✅ Shells interactivas (SSH, FTP, Netcat)
- ✅ Desktop mode con ventanas flotantes y wallpapers
- ✅ Network map con panel de enumeración
- ✅ Blog con artículos ES/EN
- ✅ Landing page + selección de labs
- ✅ Dark/Light theme
- ✅ Sistema de feedback, analytics y donaciones
- ✅ **Arquitectura refactorizada** — `useCommandRunner` (orquestador), 4 slices en store, auto-registro de comandos

## 📚 Documentación

- **[docs/LABS.md](docs/LABS.md)** — Guías detalladas de cada laboratorio
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** — Arquitectura y sistema de validación
- **[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)** — Guía de desarrollo
- **[docs/TESTING.md](docs/TESTING.md)** — Estrategia de testing
- **[docs/ROADMAP.md](docs/ROADMAP.md)** — Plan de implementación futura
- **[docs/OVERVIEW.md](docs/OVERVIEW.md)** — Detalle de analytics (webhook, Google Sheets) y visión de producto
- **[docs/CHANGELOG.md](docs/CHANGELOG.md)** — Historial de cambios
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
