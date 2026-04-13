# ZeroInfra Labs — Simulador de Pentesting

> Plataforma web para aprender ciberseguridad ofensiva con laboratorios interactivos en el navegador. Sin instalación, sin VMs, solo abrir y hackear.

## 🚀 Quick Start

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev

# Ejecutar tests
npm test
```

Abre `http://localhost:5173` y selecciona un laboratorio para comenzar.

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

- **Terminal Linux realista** — Comandos funcionales (ls, cd, cat, ssh, nmap, hydra...)
- **6 Laboratorios progresivos** — De reconocimiento básico a privilege escalation
- **Sistema de Validación Universal** — Comandos libres, validación declarativa
- **Navegador web simulado** — Para ataques web (WordPress, LFI, SQLi)
- **Sistema de pistas progresivas** — Ayuda opcional por misión
- **Feedback y Analytics** — Encuestas post-lab, tracking de progreso
- **i18n** — Español e Inglés
- **800+ Tests** — Vitest + React Testing Library

## 🏗️ Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS v4
- **State:** Zustand (persistencia localStorage)
- **Testing:** Vitest + React Testing Library + jsdom
- **Router:** React Router DOM v7

> 🔧 Ver [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) para detalles de arquitectura y sistema de validación.

## 📂 Estructura del Proyecto

```
src/
├── commands/        # Comandos de terminal (builtin + tools)
├── components/      # Componentes React
├── laboratorios/    # Definición de labs (scenario-01 a 06)
├── store/           # Zustand state management
├── utils/           # LabValidator, analytics, etc.
└── test/            # Configuración de tests
```

## 📊 Estado del Proyecto

- ✅ 6 Laboratorios funcionales
- ✅ 800+ tests pasando
- ✅ Sistema de validación universal implementado
- ✅ Landing page con marketing y selección de labs
- ✅ Sistema de feedback y analytics activo

## 📚 Documentación

- **[docs/LABS.md](docs/LABS.md)** — Guías detalladas de cada laboratorio
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** — Arquitectura y sistema de validación
- **[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)** — Guía de desarrollo y contribución
- **[docs/TESTING.md](docs/TESTING.md)** — Estrategia de testing
- **[docs/CHANGELOG.md](docs/CHANGELOG.md)** — Historial de cambios

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-feature`
3. Commit: `git commit -am 'Add: nueva feature'`
4. Push: `git push origin feature/nueva-feature`
5. Abre un Pull Request

> Ver [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) para más detalles.

## 🔒 Seguridad

Este es un **simulador educativo**. Todos los hashes y credenciales son ficticios. No se promueve ninguna actividad ilegal.

Ver [SECURITY.md](SECURITY.md) para más información.

## 📝 Licencia

MIT © ZeroInfra Labs

---

<p align="center">
  <a href="docs/LABS.md">🧪 Labs</a> •
  <a href="docs/ARCHITECTURE.md">🏗️ Arquitectura</a> •
  <a href="CHANGELOG.md">📜 Changelog</a>
</p>
