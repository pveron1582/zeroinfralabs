# Changelog

## [Unreleased]

### 📊 Analytics & Post-Lab Survey

#### Sistema de Tracking de Actividad
**Archivos nuevos:**
- `src/utils/analytics.ts` — Módulo de tracking que envía eventos a un webhook (Google Apps Script)
- `src/components/SurveyModal.tsx` — Encuesta post-lab con rating 1-10, dificultad, recomendación y comentarios

**Eventos rastreados:**
- `lab_started` — Cuando el usuario inicia un laboratorio
- `mission_complete` — Cada misión completada (con ID y título)
- `lab_completed` — Laboratorio completado al 100%
- `lab_abandoned` — Usuario vuelve al menú con progreso parcial
- `lab_changed` — Usuario cambia de laboratorio sin progreso
- `survey_submitted` — Encuesta enviada con rating, dificultad, recomendación y comentarios

**Configuración:**
- Crear `.env.local` con `VITE_ANALYTICS_WEBHOOK=<url>` (Google Apps Script)
- Sin la variable, el tracking se desactiva silenciosamente (seguro para desarrollo)

**¿Cuándo aparece la encuesta?**
- Al ejecutar `end` cuando todas las misiones están completadas
- Al presionar el botón "Menú" cuando el lab está al 100%
- Es opcional — se puede saltar con "Skip"

### 🏗️ Refactorización de Arquitectura

#### Terminal.tsx — Modularización (899 → ~430 líneas)
**Archivos nuevos:**
- `src/components/AutocompletePanel.tsx` — Panel de sugerencias de autocompletado extraído como componente reutilizable
- `src/hooks/useKeyboardShortcuts.ts` — Hook personalizado que maneja Tab, Ctrl+L/C/U, flechas, Escape

**Cambios:**
- Lógica de autocompletado movida de Terminal a `AutocompletePanel`
- Manejo de atajos de teclado extraído a `useKeyboardShortcuts`
- Terminal se enfoca en ejecución de comandos, streaming y renderizado de historial

#### FakeBrowser.tsx — Delegación de contenido (547 → ~280 líneas)
**Archivo nuevo:**
- `src/components/fakesites/WordPressSite.tsx` — Toda la lógica de WordPress (ruteo, credenciales, discovery level, parseo de config.bak)

**Cambios:**
- FakeBrowser ahora solo actúa como router de URLs
- WordPressSite maneja: index, login, dashboard, uploads, config.bak
- LFI y ConsultancySite ya estaban en componentes separados
- Eliminada duplicación de imports y lógica de parseo de credenciales

### 🧪 Tests Nuevos
- **useKeyboardShortcuts**: 12 tests (hook de atajos de teclado)
- **WordPressSite**: 10 tests (ruteo, discovery levels, credenciales dinámicas, logout)
- **AutocompletePanel**: 6 tests (renderizado, selección, iconos archivo/carpeta)
- **Total**: 579 tests pasando (+28 tests nuevos)

### 🐛 Fixes
- **Bug #1 resuelto**: OS ya no se muestra tras arp-scan (solo tras nmap, discovery_level >= 2)

### 📦 Test Coverage Mejorado
| Componente | Antes | Después |
|------------|-------|---------|
| AutocompletePanel | — | 80% |
| WordPressSite | — | 42% |
| useKeyboardShortcuts | — | 48% |
| FakeBrowser | 67% | 67% |
| Terminal | 57% | 57% |

---

## [2.6.0] - 2026-03-26

### ✨ Nuevas Características

#### NetworkMap — Múltiples credenciales con indicador de servicio
**Archivos:** `src/components/NetworkMap.tsx`, `src/store/scenarioStore.ts`, `src/types.ts`
- **Mejora**: El panel de máquina ahora muestra múltiples credenciales (WP-Admin y SSH) simultáneamente
- **Nuevo**: Etiqueta de servicio visible para cada credencial (WordPress Admin, SSH, FTP)
- **Colores**: Naranja (sin verificar) → Verde (verificado) por credencial individual
- **Implementación**: `found_credentials` ahora es array con campo `service` en cada credencial

#### WordPress Lab — Config.bak limpio (solo WP-Admin)
**Archivo:** `src/components/fakesites/wordpress/wp01/ConfigBak.tsx`
- Removidas credenciales SSH y de base de datos del archivo `config.bak`
- Solo muestra credenciales WP-Admin (`admin`/`P@ssw0rd123!`)

#### WP-Admin Login — Fix de credenciales y campo limpio
**Archivos:** `src/components/FakeBrowser.tsx`, `src/components/fakesites/wordpress/wp01/Login.tsx`
- El login ahora usa credenciales WP-Admin correctas (no SSH)
- Campo de usuario vacío (sin placeholder "admin")

#### WordPress Lab — Credenciales SSH root descubiertas en Dashboard
**Archivos:** `src/components/fakesites/wordpress/wp01/Dashboard.tsx`
- Al acceder al WP-Admin Dashboard, se descubren credenciales SSH de **root**
- Flujo: WP-Admin → Dashboard revela SSH root → SSH como root completa el lab

#### Terminal — Parámetro `service` en credenciales
- Los comandos `hydra` y `ssh` ahora pasan el parámetro `service` al descubrir/verificar credenciales
- Las credenciales SSH muestran "SSH" correctamente en lugar de "Desconocido"

### 🔧 Cambios

#### Terminal — Auto-scroll automático al final
- Scroll suave automático cuando aparece nueva salida
- `useEffect` con `scrollTo({ behavior: 'smooth' })`

#### FakeBrowser — Seguridad HTTPS forzada para Google
- Nuevo componente `HttpSecurityError` — muestra página de error estilo Chrome
- URLs HTTP muestran "Tu conexión no es privada" con `NET::ERR_CERT_AUTHORITY_INVALID`

#### Directorio inicial de Kali — `/` → `/root`
- El directorio inicial ahora es `/root` (home real del usuario root en Kali)

#### Sistema de archivos — flag.txt removido del atacante
- `/root/flag.txt` ya no está en el filesystem base de Linux
- Cada escenario agrega su propia flag desde la configuración

### 🧪 Tests
- 474 tests pasando (todos exitosos)

---

## [2.5.7] - 2026-03-26

### 🐛 Fixes
- **Terminal**: Ctrl+C en Metasploit ahora preserva el prompt
- **Exercise01**: Texto del step de gobuster actualizado con ruta correcta
- **MissionPanel**: Texto de steps largos ahora se muestra completo (`break-all`)

---

## [2.5.6] - 2026-03-26

### 🐛 Fixes
- **FakeBrowser**: Logo "Go" corregido a "Google" en resultados de búsqueda
- **Terminal**: Ctrl+L preserva el input actual

---

## [2.5.5] - 2026-03-26

### ✨ Nuevas Características
- **Diccionario rockyou.txt** en `/usr/share/wordlists/rockyou.txt` (~100 contraseñas)
- **Diccionario common.txt** de SecLists en `/usr/share/wordlists/SecLists/Discovery/Web-Content/`
- **Gobuster** ahora valida diccionario de directorios web
- **Hydra** ahora requiere diccionario específico

### 🧪 Tests
- 45 tests pasando con nueva sintaxis de diccionarios

---

## [2.5.4] - 2026-03-26

### ✨ Nuevas Características
- **Contenido real en WordPress**: Artículos de tecnología (Claude 4, ciberseguridad, vulnerabilidades)
- **Botones de Google funcionales**: "Buscar con Google" y "Voy a tener suerte"
- **Página del dinosaurio de Chrome** (Easter Egg): `chrome://dino` con `ERR_INTERNET_SIMULATOR_MODE`

### 🐛 Fixes
- **FakeBrowser**: `chrome://dino` no funcionaba (agregaba `http://` al esquema)

---

## [2.5.3] - 2026-03-26

### 📝 Documentación
- Testing Strategy agregada al README

---

## [2.5.2] - 2026-03-26

### 🐛 Fixes
- **Terminal**: Prompts históricos no cambian al entrar a msfconsole
- Las funciones de renderizado ahora inspeccionan el contenido del texto del prompt

---

## [2.5.1] - 2026-03-26

### 🐛 Fixes
- **ls**: Directorio mostrándose a sí mismo como subdirectorio (`.dir` slicing)
- **Autocompletado**: Tab mostraba archivos `.dir` internos
- **Autocompletado**: `mkdir` y `rmdir` sin Tab completion

---

## [2.5.0] - 2026-03-26

### 🔧 Refactoring
- **exercise03 y exercise04**: Eliminación de código duplicado, ahora usan `templates.ts`
- **cd**: Lista de directorios conocidos actualizada (`/home/kali/`)
- **scenarioStore**: `currentDir` se resetea al cambiar escenario

---

## [2.4.5] - 2026-03-25

### 🧪 Tests
- **mkdir**: 14 tests, **rmdir**: 13 tests, **help**: 9 tests
- Coverage mejorado: mkdir 1% → 90%, rmdir 1% → 85%, help 44% → 95%

---

## [2.4.0] - 2026-03-25

### 🚀 Nuevas Funcionalidades
- **mkdir** y **rmdir** implementados con flags `-p`
- Sistema de ayuda mejorado (`help mkdir`, `help rmdir`, etc.)
- Usuario de máquina atacante: `root` → `kali`

---

## [2.3.0] - 2026-03-25

### ✨ Nuevas Funcionalidades
- **Atajos de teclado**: Ctrl+L (limpiar), Ctrl+U (línea), Ctrl+C (detener)
- **ls** con flags `-l`, `-a`, `-la`
- **Autocompletado** de paths mejorado (paths absolutos, navegación consecutiva)
- **Prompt dinámico** con directorio actual

### 🧪 Tests
- 436 tests pasando

---

## [2.2.0] - 2026-03-25

### ✨ Nuevas Características
- **Prompt estilo Kali Linux**: Dos líneas (`┌──(㉿)-[~]` + `└─$`)
- **Sistema de Modelos de Archivos** (`fs-models/`):
  - `fs-linux.ts`: Sistema completo de Linux
  - `fs-windows.ts`: Sistema completo de Windows Server

### 🧪 Tests
- 432 tests pasando (+35 nuevos)

---

## [2.1.0] - 2026-03-24

### ✨ Nuevas Características
- **Sistema de Autocompletado**: Tab para comandos y archivos, panel de sugerencias
- **Sistema de Directorios Linux Realista**: 19 directorios raíz, archivos del sistema completos

### 🧪 Tests
- 397 tests pasando (+57 nuevos)

---

## [2.0.0] - 2026-03-24

### 🐛 17 Bugs Fixeados
- Reset de MSF State entre escenarios
- Limpieza de `blockingCommand` al cambiar escenario
- `whoami` usa credenciales reales
- `ssh` busca misión dinámicamente
- `nc` valida contexto LFI
- `nmap` y `gobuster` no mutan `discovery_level`
- Sincronización de `blockingCommand` en el store
- Normalización de paths LFI
- `nmap` actualiza `discovery_level` a 2
- Reset de `discovery_level` al cambiar escenario
- Reset de `rceCompletedRef` en FakeBrowser
- `whoami` sin información extra
- Sistema de directorios virtual (`cd`, `ls`)
- Comando `exit` y `end`
- Credenciales verificadas en topología
- Modularización de escenarios

### ✨ Nuevas Características
- Comandos: `cd`, `ls`, `exit`, `end`, `cat`, `whoami`, `sudo`
- Metasploit Framework con submódulos
- Sistema de directorios virtual

### 🧪 Tests
- 340+ tests pasando (+145 nuevos)

---

## [1.0.0] - Versión Inicial

- Simulador de ciberseguridad educativo
- Terminal interactiva
- 2 escenarios (WordPress Lab, SSH Brute Force)
- 195+ tests
