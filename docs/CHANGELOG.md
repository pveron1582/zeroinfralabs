# Changelog

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
