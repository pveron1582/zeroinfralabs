# Changelog

## [Unreleased] - 2026-06-06

### Fixes de Laboratorio / Validación

- ✅ **Solución a la validación del Paso 3 en Lab 5 (FTP + PrivEsc)** — Se rehizo este cambio partiendo de una versión anterior en el GitHub del 29 de abril.
  - Implementado el tipo de validación `fileDownloaded` en `MissionCriteriaType` (`src/types.ts`) y su validador respectivo en `validateMission` (`src/utils/labValidator.ts`).
  - Agregada la validación universal del laboratorio en el flujo interactivo de FTP (`Terminal.tsx`) al descargar archivos con `get`.
  - Añadidas pruebas unitarias para `fileDownloaded` en `labValidator.test.ts`.

---

## [Unreleased] - 2026-05-28

### DevOps y Gestión de Dependencias

- ✅ **Migración a pnpm** — Se migró el gestor de paquetes de `npm` a `pnpm` (v11) para acelerar las instalaciones, mejorar la seguridad del árbol de dependencias y optimizar el almacenamiento.
  - Reemplazado `package-lock.json` por `pnpm-lock.yaml`.
  - Actualizada toda la documentación y guías del proyecto (`README.md`, `AGENTS.md`, `docs/DEVELOPMENT.md`, `docs/TESTING.md`) con las nuevas instrucciones de ejecución basadas en `pnpm`.

---

## [Unreleased] - 2026-04-29

### Mejoras de UX y Routing

- ✅ **Detección automática de idioma** — Detecta `navigator.language` del navegador
  - Redirige a `/es` si el navegador está en español (es-ES, es-MX, es-AR, etc.)
  - Redirige a `/en` por defecto o para otros idiomas
  - Respeta preferencia guardada en localStorage si el usuario ya cambió manualmente

- ✅ **Language switcher fix** — Cambio de idioma actualiza la URL correctamente
  - Al cambiar ES → EN, la URL cambia de `/es/scenario/...` a `/en/scenario/...`
  - Preserva la ruta completa, solo cambia el prefijo de idioma

- ✅ **Persistencia de directorio actual** — `currentDir` se guarda en localStorage
  - Valor inicial: `/root` (en lugar de `/`)
  - Al refrescar la página, mantiene el directorio donde estabas

### Comandos

- ✅ **nmap -oN / -oG fix** — Guarda archivos en el directorio actual
  - Ej: `nmap -oN basico 192.168.1.10` guarda en `/root/basico`
  - Ej: `nmap -oN salida.txt 192.168.1.10` guarda en `/root/salida.txt`
  - Paths absolutos se respetan: `nmap -oN /tmp/scan.txt ...` guarda en `/tmp/scan.txt`
  - `-oG` funciona igual que `-oN`

- ✅ **nmap --open** — Nuevo flag para filtrar solo puertos abiertos

### DevOps

- ✅ **vercel.json** — Configuración para SPA routing
  - Soluciona error 404 al refrescar páginas con rutas dinámicas (`/es/labs`, `/en/scenario/...`)
  - Redirige todas las rutas al `index.html` para que React Router maneje el routing

- ✅ **chunkSizeWarningLimit** — Aumentado a 1000KB para suprimir warning de Vercel

---

## [Unreleased] - 2026-04-23

### Comandos de Sistema y Red

- ✅ **ping** — Comando ICMP para testear conectividad de red
  - Flags: `-c` (count), `-i` (interval), `-W` (timeout), `-s` (size), `-h` (help)
  - Simula respuestas de hosts existentes con TTL (64 Linux / 128 Windows)
  - 10 tests incluidos

- ✅ **traceroute** — Trazar ruta a un destino
  - Flags: `-m` (max hops), `-q` (queries), `-w` (wait), `-h` (help)
  - Simula saltos intermedios con latencias
  - 7 tests incluidos

- ✅ **ps** — Reportar estado de procesos
  - Opciones: `ps`, `ps aux`, `ps -e`, `ps -ef`
  - Procesos simulados según OS (Linux/Windows)
  - 5 tests incluidos

- ✅ **top** — Visor dinámico de procesos en tiempo real
  - Implementado como comando bloqueante (sale con `q`)
  - Muestra CPU%, MEM%, load average, uptime
  - 6 tests incluidos

- ✅ **which** — Localizar ejecutables en PATH
  - Soporta múltiples comandos: `which nmap ls python`
  - Lista completa de comandos builtin y tools
  - 12 tests incluidos

- ✅ **htop** — Visor de procesos interactivo con colores
  - Barras visuales de CPU (múltiples cores)
  - Barras de memoria y swap con porcentajes
  - Proceso htop resaltado con '>'
  - Menú de function keys (F1-F10)
  - Sale con 'q' o F10
  - 8 tests incluidos

### Comandos de Reconocimiento de Red

- ✅ **netdiscover** — Nuevo comando de descubrimiento de hosts pasivo/activo
  - Auto-detección de red desde la IP de la máquina
  - Flags: `-r` (rango), `-p` (pasivo), `-v` (verbose), `-P` (parseable), `-f` (fast), `-n` (nodo inicial)
  - Output tipo netdiscover real con tabla de hosts encontrados
  - 12 tests incluidos

- ✅ **nmap -sn con CIDR** — Escaneo de red completa (`nmap -sn 192.168.1.0/24`)
  - Encuentra todos los hosts en la red especificada
  - Retorna `discoveredHosts` para validación de labs
  - 4 tests nuevos para CIDR

- ✅ **nmap simplificado** — Removida validación de `discovery_level` del comando
  - El comando ahora es completamente "libre" (sin validaciones internas)
  - La validación de pasos debe hacerse en el sistema de labs (labValidator)

### Documentación

- ✅ **docs/nmap/help.md** — Referencia rápida de opciones de nmap
- ✅ **docs/nmap/man.md** — Manual completo de nmap en formato Unix man page

### DevOps

- ✅ **Vercel Analytics** — Agregado seguimiento de analytics con `@vercel/analytics` en `src/main.tsx`

---

## [1.1.0] - 2026-04-12

### Fixes de Navegación

- ✅ **Corregido tipo `lang` en `App.tsx`** — Validación explícita `'en' | 'es'` con fallback seguro a `'en'`
- ✅ **Flujo encuesta → LabGrid corregido** — Al saltar o enviar encuesta, navega directamente a `/:lang/labs` en vez de volver al mismo lab (usaba `history.back()`)
- ✅ **Botones atrás/adelante del browser** — `popstate` handler ahora hace cleanup directo + `navigate()` para evitar loops con `history.back()`
- ✅ **Estado se limpia correctamente** — Survey y workspace state se resetean completamente al salir de un lab
- ✅ **7 tests de navegación nuevos** — `AppNavigation.test.tsx` cubriendo todos los flujos en ambos idiomas

### Landing Page — Textos para principiantes

- ✅ **Hero** — Supertítulo: "LA PRIMERA PLATAFORMA DE HACKING ÉTICO EN ESPAÑOL — DIRECTO EN TU NAVEGADOR"
- ✅ **Hero** — Título: "Aprendé hacking desde cero — sin instalar nada"
- ✅ **Hero** — 4 badges: Sin conocimientos previos, Sin registro, 100% seguro y legal, ⏱️ Sin límite de tiempo
- ✅ **Hero** — CTA: "Empezar gratis ahora →"
- ✅ **Sección "¿Nunca hackeaste nada? Perfecto."** — Reemplaza "Meet ZI Labs"
- ✅ **Card "Terminal realista"** — Texto centrado en aprender haciendo
- ✅ **Card "Curiosos del hacking"** — Reemplaza "Preparación para certificaciones" (ícono 👀)
- ✅ **Paso 01** — "Labs ordenados de más fácil a más difícil"
- ✅ **Sección nueva: Disclaimer legal** — "Hacking ético, siempre." con ícono de escudo
- ✅ **6ta card "Sin límite de tiempo"** — Reemplaza "Enumeración guiada" (ícono ⏱️)
- ✅ **Card "Autodidactas"** — Mención al tiempo: "ni un reloj corriendo en contra"
- ✅ **Card "Sin dolores de cabeza con VMs"** → **"Amantes de lo simple"** (ES) / **"Lovers of simplicity"** (EN)
- ✅ **Todos los textos en ES (voseo) y EN**

### Lab 02 — SSH Compromised Fix

- ✅ **Misiones 5 y 6** — `discoveryLevel: 4` → `3` — SSH como `gonzalo` ya no marca la máquina como "Compromised" (no hay escalada de privilegios en este lab)

---

## [1.0.0] - 2026-04-11

### Features Principales

- **6 Laboratorios completos** — WordPress, SSH Brute, EternalBlue, LFI/RCE, FTP+PrivEsc, SQL Injection
- **Terminal realista** — 20+ comandos funcionales (nmap, hydra, ssh, msfconsole, etc.)
- **Sistema de Validación Universal** — Comandos libres, validación declarativa
- **Landing Page** — Marketing completo con animaciones
- **800+ Tests** — Cobertura completa con Vitest

### Arquitectura

- React 18 + TypeScript + Vite
- Tailwind CSS v4 + shadcn/ui
- Zustand + localStorage persistence
- i18n (Español/Inglés)

### Fixes Recientes

- ✅ Validación universal implementada (14 criterios)
- ✅ LHOST mensaje genérico en MSF exploit
- ✅ Tests de Terminal actualizados con store mock
- ✅ Coverage de store mejorado (selectors tests)

---

## Versiones Anteriores

Ver [CHANGELOG_ARCHIVE.md](CHANGELOG_ARCHIVE.md) para historial completo de versiones anteriores.
