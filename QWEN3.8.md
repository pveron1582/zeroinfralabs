# QWEN3.8.md — Checklist de mejoras (revisión 2026-08-16)

Estado actual: 1822 tests pasando, typecheck limpio, build OK, lint 0 errores / 112 warnings.

## Progreso (2026-08-16)

- [x] #1 `.venv` removida del tracking de git (commit `f7de35a`)
- [x] #2a Remotion movido a devDependencies
- [x] #2b Code-splitting con React.lazy: bundle inicial 911 KB → 184 KB (gzip 267 → 52 KB)
- [x] #3 CI workflow `.github/workflows/ci.yml` (typecheck + lint + tests + build)
- [x] #4 ESLint flat config (`eslint.config.mjs`, script `pnpm lint`): 0 errores, ~107 warnings para limpiar de a poco
      - Bonus: detectó y se corrigieron 2 violaciones reales de rules-of-hooks
        (`AppContent.tsx` useEffect condicional, `Li03CoreCommands.tsx` hook en callback)
- [x] #5 Higiene de repo: `src.zip` borrado, `list-files-by-lines.sh` → `scripts/`, docs (AGENTS/CLAUDE) sin refs a msfCommands,
      `push.sh` fuera del tracking + en `.gitignore`
- [x] #6 Deuda menor: tests MSF movidos a `src/frameworks/metasploit/__tests__/` (dir legado msfCommands eliminado);
      ramas de coverage quedan para cuando se toquen los comandos afectados
- [x] Refactors de archivos > 300 líneas (ronda 1):
      - `nmap.ts` (517) → directorio `nmap/` con 8 módulos (index/flags/help/vendors/ports/cidr/outfiles/pingScan/portScan)
        (+ `scripts.ts` añadido en ronda de fidelidad — buildHostScriptResults para -A)
      - `commands/index.ts` (467) → 127 líneas + `executor.ts`, `shellIntegration.ts`, `suid.ts`
      - `fs-linux.ts` (548) → 93 líneas + `fs-etc.ts`, `fs-var.ts`, `fs-wordlists.ts`, `fs-linux-types.ts`
        (paridad byte-a-byte verificada con test temporal antes de borrarlo)
      - `FakeBrowser.tsx` (463) → 293 líneas + `fakebrowser/pages.tsx`
- [x] Refactors de archivos > 300 líneas (ronda 2):
      - `types.ts` (482) → directorio `types/` con 4 módulos + barrel index.ts
        (compatibilidad de imports `../types` preservada al 100%)
      - `MissionPanel.tsx` (432) → 126 + `missionPanel/` (HintButton, StepCarousel, AttackerCredentials)
      - `MachineLoader.tsx` (420) → 147 + `machineLoader/` (phases.ts, screens.tsx)
      - `EditorModal.tsx` (417) → 320 + `editorModal/` (cursor.ts, NanoStatusBar, NanoFooter)
      - `FeedbackModal.tsx` (410) → 193 + `feedbackModal/` (captcha.ts, texts.ts, StatusViews, CaptchaSection, FeedbackForm)
      - `LabGrid.tsx` (409) → 198 + `labGrid/` (helpers.ts, ScenarioCard, ModalContent)
- [x] Refactors de archivos > 300 líneas (ronda 3):
      - `AdminPanel.tsx` (597) → 294 + `admin/` (LoginScreen, AdminHome, DebugPanel, shared)
      - `AppContent.tsx` (486) → 292 + `appContent/` (useAppContentEffects, WorkspaceTopBar,
        WorkspaceOverlays, LandingView)
      - Nota: ambos contienen los cambios Academy in-progress del working tree; se refactorizó
        sin alterar su comportamiento (tests de AdminPanel, AppNavigation, FoxyTour como red)
- [x] Refactor pendiente restante: ninguno >300 en el working tree actual
- [x] Mejora de fidelidad de nmap (3 correcciones + extra):
      - `-A` ahora implica `-sV` → columna VERSION + detección de servicio automática (`flags.ts`)
      - MAC Address siempre visible en misma subred sin `-v` (`portScan.ts`, `pingScan.ts`) — fiel al nmap real
      - `Host is up` siempre visible sin `-v` (`portScan.ts`)
      - Default `-p` = top ~1000: 1-1024 + puertos altos frecuentes (3306, 3389, 5432, 5900, 6379, 8080, 8443, 9090, 27017, ...) (`ports.ts`)
      - `buildHostScriptResults` integrado en `-A`: smb-os-discovery (Windows+445/139), http-server-header/http-title (servicios web) (`scripts.ts` + `portScan.ts`)
      - `Service Info: OS:` en `-A` (`portScan.ts`)
      - Help actualizado: `-A` ≡ `-sV -O --script=default`, default top-1000 (`help.ts`)
      - 8 tests nuevos (46 total en nmap.test.ts)
- [x] Burp Suite simulado (Proxy + Repeater + Target):
      - Motor HTTP sintético compartido en `src/frameworks/http/` (`request.ts`, `response.ts`) — extracción de la lógica de curl para reutilizarla
      - `curl.ts` refactorizado (298→117) para usar el motor extraído (mismo comportamiento + ahora emite `httpRequest`/`httpResponse`)
      - `src/components/burpsuite/` (5 archivos): Proxy (intercept + history), Repeater (editor + response panel), Target (site map con web_enumeration)
      - `activeApp` extendido a `'terminal' | 'browser' | 'burpsuite'`; botón "Burp" en WorkspaceTopBar (solo Web)
      - Tipos: `HttpRequestData`/`HttpResponseData` + tipo `'http'` en `CommandResponse` (`types/command.ts`)
      - Laboratorio 07 nuevo: "Burp Suite: Web Application Pentesting" — 8 misiones de intercept→Repeater→SQLi→UNION→flag (reusa el motor de curl → LabValidator valida igual)
      - SCENARIOS pasa de 6 a 7 labs; `credentials-by-machine.test.ts` y `LandingPage.test.tsx` actualizados
      - 36 tests nuevos (16 motor HTTP + 16 laboratorio07 + 4 ajustes a tests existentes)
      - Total: suite completa 1822 tests, tsc 0, build OK, lint 0 errores
- [x] Fix pantalla en blanco al elegir lab (dev server):
      - `src/utils/lazyRetry.ts`: `lazyWithRetry()` reintenta el `import()` dinámico 2 veces si falla
        (tab abierta antes de reiniciar Vite / deploy nuevo que invalidó hashes)
      - `src/components/ChunkErrorBoundary.tsx`: boundary raíz en App.tsx — ante error de chunk hace un
        reload automático (flag en sessionStorage, una sola vez); si persiste, muestra aviso + botón Recargar
      - Todos los `React.lazy` de App.tsx usan `lazyWithRetry`
      - 10 tests nuevos (5 lazyRetry + 5 ChunkErrorBoundary)
      - Total: suite completa 1832 tests (142 archivos), tsc 0, build OK, lint 0 errores
- [x] Burp Suite integrado al modo escritorio:
      - Ventana `burpsuite` en `useDesktopWindows` (singleton, restaura + bringToFront si ya existe/minimizada)
      - Entrada "Burp Suite" en menú Aplicaciones + botón en barra de tareas (solo escenarios Web)
      - `DesktopTerminal` renderiza `<BurpSuite>` como ventana; WindowFrame data-tour `burp-window`
      - 5 tests nuevos (2 TopBar + 3 hook): suite completa 1837 tests, tsc 0, build OK, lint 0 errores
- [x] Fix lab 07: Burp Suite ahora valida misiones + cadena de misiones sana:
      - `BurpSuite` emite cada request como `CommandResponse` (type 'http') → `checkMissionCompletion`
        valida contra la misión activa (antes Burp solo actualizaba el store; las misiones eran incompletables)
      - Nuevo criteria `httpRequest` en LabValidator (misión 3: primera intercept, misión 4: request a /login)
      - UNION dinámico en `frameworks/http/response.ts`: credenciales y fila de flag salen de la máquina
        objetivo (known_passwords + flags) — el lab 07 ya no mostraba creds del lab 06 (SQLr00t@2024!)
        ni ninguna flag; la fila del dump lleva role "flag" con ZIL{INTERCEPT_AND_EXPLOIT} + fileRead.isFlag
      - Línea de hint FTP solo aparece si el target tiene servicio ftp con credenciales (lab 07 no tiene)
      - Misión 1 reescrita: orienta a escanear la red (sin prescribir arp-scan); hints con ip a/subred
      - Hints 3-8 mejores: payloads concretos, método+URL+body paso a paso, Ctrl+Enter
      - `curl.ts`: credencial del output ahora usa foundCredentials.pass (no hardcodeada)
      - 14 tests nuevos (4 httpRequest + 6 happyPath-scenario07-flow + 4 laboratorio07)
      - Total: suite completa 1849 tests (143 archivos), tsc 0, lint 0 errores

---

## 1. `.venv` trackeada en git (alta)

- `.venv/` (46 MB, 1014 archivos) entró en el commit inicial `642e574` a pesar de estar en `.gitignore`.
- El repo pesa ~33 MiB casi todo por esto.

Acción:

```bash
git rm -r --cached .venv
git commit -m "chore: remove .venv from git tracking"
```

Opcional (limpiar también el historial, reescribe commits):

```bash
pip install git-filter-repo
git filter-repo --invert-paths --path .venv
git push --force
```

> Si se usa filter-repo: clonar de nuevo después, el remoto hay que re-agregarlo.

## 2. Bundle sin code-splitting (alta — UX)

- Un solo chunk JS: 911 KB (267 KB gzip) — todos los labs, Academy, Remotion y AdminPanel se descargan al inicio.
- `remotion`, `@remotion/cli`, `@remotion/player`, `@remotion/media` están en `dependencies` pero solo se usan offline para generar videos.

Acciones:

- Mover todo Remotion a `devDependencies` en `package.json`.
- Lazy-load por ruta con `React.lazy()` + `Suspense`:
  - `/:lang/academy` → componentes de `src/academy/` y `src/components/academy/`
  - `/:lang/zildeb` → `AdminPanel.tsx` (597 líneas)
  - `/:lang/scenario/:id` → la vista de laboratorio completa
  - `/:lang/blog` → páginas de blog
- Considerar `manualChunks` en `vite.config.ts` para separar React + Zustand + Router del código de la app.
- `chunkSizeWarningLimit: 1000` en vite.config.ts hoy tapa la advertencia; el objetivo es poder bajarla.

## 3. Sin linting ni CI (media)

- No hay ESLint, ni GitHub Actions, ni pre-commit hooks.
- Hoy solo `tsc --noEmit` y `vitest` fuerzan calidad, y se corren a mano.

Acciones:

- Agregar ESLint (mínimo `@eslint/js` + `typescript-eslint`, config flat): reglas recomendadas + `no-unused-vars`/`no-explicit-any` en modo warn.
- Crear `.github/workflows/ci.yml`: en cada push/PR correr:
  1. `pnpm install --frozen-lockfile`
  2. `pnpm exec tsc --noEmit`
  3. `pnpm test:run`
  4. `pnpm build`
- Opcional: correr los 4 pasos también en `push.sh` antes de pushear.

## 4. Archivos que superan el límite de 300 líneas (media)

Convención propia del proyecto: archivos < 300 líneas. Hoy exceden:

| Archivo | Líneas | Idea de refactor |
|---|---|---|
| `src/components/AdminPanel.tsx` | 597 | Separar en subcomponentes (LessonBuilder/LabBuilder ya existen en `components/admin/`) |
| `src/fs-models/fs-linux.ts` | 548 | Extraer builders de subárboles (`/etc`, `/var`, `/home`, `/usr`) a módulos |
| `src/commands/tools/nmap.ts` | 517 | Separar parseo de args, escaneo y formateo de output |
| `src/components/AppContent.tsx` | 486 | Extraer los wrappers de layout a componentes propios |
| `src/types.ts` | 482 | Partir por dominio: `machine.ts`, `mission.ts`, `command.ts`, `academy.ts` + barrel |
| `src/components/FakeBrowser.tsx` | 463 | Separar barra/historia del render de sitios |
| `src/commands/index.ts` | 466 | Extraer helpers SUID/SGID y lógica MSF |
| `src/components/MissionPanel.tsx` | 432 | Separar lista de misiones, hints y progreso |
| `src/components/MachineLoader.tsx` | 420 | — |
| `src/components/EditorModal.tsx` | 417 | — |
| `src/components/FeedbackModal.tsx` | 410 | — |
| `src/components/LabGrid.tsx` | 409 | — |
| `src/hooks/useCommandRunner.ts` | 400 | Separar resolución de contexto de ejecución de comando |

No es urgente: son candidatos naturales cuando se toque cada uno.

## 5. Higiene de repo e historial (baja)

- `src.zip` (455 KB) en la raíz — es un backup viejísimo; borrarlo (ya está en `.gitignore` vía `*.zip`, no está trackeado).
- Commit `e351403 "-h"` y `01db073 fix: restaurar versión estable del 29 de abril` — mensajes poco informativos en el historial; para adelante mantener formato `feat:/fix:/chore:/docs:` consistente.
- `list-files-by-lines.sh` en la raíz: moverlo a `scripts/`.
- Directorios de config de herramientas de IA (`.kilo`, `.continue`, `.codeboarding`) ya ignorados, verificar que nada sensible entre en commits futuros.

## 6. Deuda menor detectada

- Cobertura de branches: 71.7% (statements 83.6%) — los branches son el punto débil; priorizar tests de paths de error al tocar comandos.
- `src/utils/logger.ts` envuelve `console.log` — revisar que no quede logging en producción si se activa DEBUG.
- Verificar que `src/commands/tools/msfCommands/` (que existió en versiones previas) no deje referencias huérfanas en tests o docs tras la migración a `frameworks/metasploit/`.

## 7. Revisión Academy (2026-08-16)

Revisión completa del estado de la academia. Verificado como terminado:

- [x] 7 paths / 41 lecciones, todo bilingüe ES/EN (`src/academy/`)
- [x] 18 videos + audio, cada referencia apunta a un archivo real de `public/videos/`
- [x] Rutas (`/:lang/academy/...` con lazy loading), persistencia vía `partialize`, suite de tests academy verde
- [x] Fase B (quizzes + progreso), fase D (FoxyNarrator) y fase E (LessonBuilder en AdminPanel)
- [x] Simuladores de red interactivos (home/DMZ/MITM) en `src/components/academy/`

Pendiente:

- [x] #7a **Diseño Academy = diseño del landing** (2026-08-17): tras probar la estética "expediente táctico"
      (v4) fue descartada — la Academy ahora usa EXACTAMENTE el mismo diseño que el landing / páginas
      internas: `SiteHeader` + `PageHero` (hero oscuro) + cuerpo claro con cards (`sectionBg`, borde
      `colors.border`, hover con borde/ sombra en emerald, `translateY`, animación de entrada), progreso en
      emerald/cyan, chrome de ventana oscura para terminal/video/simuladores. Se reescribieron AcademyHome,
      AcademyPath, LessonViewer, LessonContent (partido en lessonSteps.tsx), AcademyVideo, FoxyNarrator,
      FoxyAssistantBubble, LabMiniTerminal y el marco de NetworkSimCore. `academyTheme.tsx` (expediente)
      eliminado y las fuentes Special Elite/Courier Prime sacadas de index.html. Doc de referencia:
      `docs/ACADEMY_DESIGN.md` (ahora describe el diseño del landing; propuesta_diseno_v4.html = histórico descartado).
      `pnpm exec tsc` OK · lint 0 errores · build OK · 1871 tests verdes.
- [ ] #7b **Fuentes JetBrains Mono sin usar**: `public/fonts/jetbrains-mono/*.woff2` (400/700) descargadas
      pero no se cargan en ningún lado — el código usa `'Cascadia Code','Fira Code','Consolas'` del sistema.
      Cargarlas con `@font-face` o borrarlas.
- [ ] #7c **Fase C parcial**: el renderer `lab-challenge` existe (`LessonContent.tsx:350`) pero ninguna
      lección lo usa; los labs inline solo se usan vía `practical-exercise`.
- [ ] #7d **Docs desactualizados**: `docs/PROYECTO_ACADEMY.md` dice "pendiente de implementación" y "4 bases /
      8 lecciones semilla" cuando el estado real es otro (7 paths, 41 lecciones). Actualizar estado.
- [ ] #7e **Archivos > 300 líneas**: `src/components/academy/LessonContent.tsx` (384) y
      `src/components/academy/NetworkSimCore.tsx` (400) — romper en submódulos como el resto de los refactors.

---

## Orden sugerido de trabajo

1. Limpiar `.venv` de git (#1) — 5 minutos, sin riesgo.
2. Code-splitting + Remotion a devDeps (#2) — mayor impacto para usuarios.
3. CI básico (#3) — protege todo lo anterior.
4. Linting (#3b) — configurar con warns, ir limpiando de a poco.
5. Refactors de archivos grandes (#4) — uno por vez, con tests cubriendo.
6. Higiene (#5, #6) — cuando venga bien.
7. Academy pendiente (#7) — decidir diseño expediente v4 y aplicar; lo demás es deuda menor.
