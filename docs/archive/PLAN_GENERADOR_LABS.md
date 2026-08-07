# PLAN: Sistema de Generación de Labs (Site-as-Data)

> Documento vivo de seguimiento. Cada etapa con checkboxes que vamos marcando.
> Fecha inicio: 2026-08-01 · Estado: **Fase A (en diseño)**

---

## 0. Objetivo

Construir un sistema escalable para **generar laboratorios** de forma declarativa: desde una sección del sitio, un usuario/administrador podrá elegir:

- El **sitio web simulado** (WordPress, Drupal, e-commerce, mail, etc.)
- Las **vulnerabilidades** a explotar y **dónde** aplican
- Las **credenciales** y su ubicación
- La **escalada de privilegios** (si la hay) y sobre qué OS (**Linux / Windows**)
- Y que eso produzca un lab jugable completo.

Esto exige que **todo lo que hoy es código** (sitios, vulnerabilidades, filesystems) se vuelva **datos**, y que el generador emita exactamente lo que `buildScenario()` ya sabe consumir.

### Por qué la base ya es sólida

- Los labs **ya son declarativos**: `buildScenario()` (`src/laboratorios/templates.ts`) arma un `Scenario` desde un config (máquinas, puertos, FS, `learningSteps`, `validationCriteria`).
- La validación es **universal y metadata-driven**: contrato `CommandResponse` (16 criterios) → `LabValidator`. Agregar una vuln no toca validadores por lab.
- Los OS **ya son builders**: `createLinuxFileSystem` / `createWindowsFileSystem`.
- El cuello de botella real es que **los sitios son componentes React** (JSX), no datos.

### Observaciones — Acoplamiento actual de los sitios (verificado 2026-08-01)

Diagnóstico de la situación actual (a medio camino entre "independientes" y "frágiles"):

**Lo que NO está acoplado:** los sitios entre sí. Cada sitio (WordPress, SQLi, LFI, Consultancy) es un árbol de componentes React independiente; sus páginas internas (`wp01/Index`, `Login`, `Dashboard`...) son presentacionales y se comunican por callbacks. Modificar el WordPress **no rompe** el SQLi.

**Lo que SÍ está acoplado (el "pegamento"):**

1. **Routing monolítico en `FakeBrowser.tsx:335-424`** — cada sitio es un `if (máquina && url.includes(ip))` que renderiza un componente con props hardcodeadas. Agregar o cambiar un sitio = tocar ese único punto; el orden de los `if` importa.
2. **Estado compartido `isLoggedIn`** (`browserIsLoggedIn`) — WordPress **y** SQLi consumen el mismo flag del browser. Loguear en uno afecta al otro (bug latente).
3. **Números mágicos por lab** — `WordPressSite.tsx:56` hace `onLoginSuccess(6)` (id de misión hardcodeado del lab 1), umbrales `level < 2` / `level < 3` para desbloquear páginas, y paths de FS del LFI (`/var/www/html/uploads/`). Reusar un sitio en otro lab desalinea la validación.
4. **Parsing de credenciales por sitio** — `parseWPConfig` es privado del WordPress; cada sitio reimplementa el suyo.

**Conclusión:** no se rompe *todo* al tocar un sitio, pero sí se rompen el **enrutamiento, el estado de login y la validación por misión** — exactamente lo que la Fase A elimina de raíz (routing por `cms`/`SiteDefinition`, login por behavior, credenciales/levels como datos).

---

## 1. Fase A — Sitios como datos (SiteDefinition + SiteRenderer)

> La más pesada. Es la prueba de fuego: si un renderer genérico puede reproducir el WordPress actual, el resto es agregar datos.

### A.1 Diseñar el formato `SiteDefinition`
- [ ] Definir tipos en `src/types.ts` (o `src/sites/types.ts`): `SiteDefinition`, `SitePage`, `SiteBlock`.
- [ ] Catálogo de bloques inicial: `hero`, `nav`, `article-list`, `article`, `form`, `footer`, `section`, `iframe`…
- [ ] Catálogo de **behaviors** (interactividad reutilizable): `wp-admin-login`, `form-contact`, `nav`, `gobuster-dirs` (rutas ocultas).
- [ ] Ejemplo canónico documentado (un WP mínimo como JSON).

### A.2 Construir el `SiteRenderer`
- [ ] Componente `SiteRenderer` que renderiza una `SiteDefinition` (layout genérico).
- [ ] Renderer de bloques (estilos default estilo blog / corporativo).
- [ ] Router interno de páginas por ruta (reutilizar `onNavigate` del `FakeBrowser`).
- [ ] Motor de behaviors: estado de login, navegación, formularios.
- [ ] `dangerouslySetInnerHTML` solo para contenido confiable proveniente del sitio; el resto por bloques tipados.

### A.3 Migrar el WordPress actual a `SiteDefinition`
- [ ] Convertir `fakesites/wordpress/wp01/` (`Index`, `Login`, `Dashboard`, `Uploads`, `ConfigBak`) al nuevo formato.
- [ ] Mantener credenciales (`config.bak`) y flujo wp-admin idénticos.
- [ ] Actualizar `FakeBrowser` para elegir sitio por `web_enumeration.cms` → `SiteDefinition` del catálogo.
- [ ] Migrar/crear tests del sitio (contenido, login, navegación) contra el renderer.

### A.4 Catálogo de sitios (arranque)
- [ ] Directorio `src/sites/catalog/` con `site-wordpress.json`, `site-consultancy.json`, `site-sqli.json`.
- [ ] Convertir `ConsultancySite` y `SqlInjectionSite` (puede quedar para Fase C si el WP valida el enfoque).
- [ ] Validar que `ZeroInfraLabs` (externo) no se rompa.

**Criterio de salida:** el WordPress renderizado por `SiteRenderer` es visual y funcionalmente equivalente al actual, y un JSON define el sitio completo.

---

## 2. Fase B — Sitios desde el Filesystem

> Cierra el círculo con "leer el sitio desde la terminal": el navegador lee el sitio del FS de la máquina objetivo.

### B.1 Mover la definición del sitio al FS
- [ ] El `SiteDefinition` del objetivo vive en el FS (ej. `/var/www/html/site.json`).
- [ ] `createLinuxFileSystem` acepta inyectar el sitio como archivos (contenido artículos, `wp-config.php`, `index.php`, etc.).
- [ ] El `FakeBrowser`/`SiteRenderer` lee `site.json` de `machine.files` (no de un catálogo hardcodeado).
- [ ] Fallback: si no hay `site.json`, usar catálogo por `cms`.

### B.2 Sincronización contenido navegador ↔ terminal
- [ ] Artículos/logs del sitio existentes también como archivos del FS (para `cat`/`ls` coherentes).
- [ ] Asegurar que `gobuster` y `web_enumeration` sigan descubriendo lo mismo que renderiza el sitio.

**Criterio de salida:** cambiar `site.json` en el FS cambia el sitio en el navegador; `ls`/`cat` del FS muestran lo que el navegador renderiza.

---

## 3. Fase C — Catálogos reutilizables (vulns, credenciales, privesc, OS)

> Recetas como datos que el generador combinará.

### C.1 Catálogo de vulnerabilidades
- [ ] Formato `VulnerabilityRecipe`: nombre, prerequisitos, comandos, `validationCriteria` (emitidos por el `CommandResponse`).
- [ ] Inventario inicial: WordPress admin weak creds, SQLi, LFI, RCE upload, hydra/ssh, nmap/gobuster enum.
- [ ] Verificar que cada vuln use los 16 criterios del contrato o extienda el contrato con su validador.

### C.2 Catálogo de credenciales
- [ ] `CredentialSet`: user/pass, servicio (`ssh`, `ftp`, `wp-admin`, `mysql`…), archivo dónde vive (config.bak, .bash_history…).
- [ ] Verificar flujo `verifyCredentials` / `foundCredentials` reutilizable.

### C.3 Catálogo de privesc
- [ ] Recetas: binario SUID, `sudo -l` (ej. `vim !bash`), writable file / PATH, cron.
- [ ] Cada receta enlaza a entradas de FS (fs-models) + `privescCompleted` → prompt root.

### C.4 Plantillas OS
- [ ] Parametrizar `createLinuxFileSystem` / `createWindowsFileSystem` por roles (target web, target DB, DC…).
- [ ] Composición de FS: "base Linux + sitio + recetas de vuln + flags".

**Criterio de salida:** un lab existente (p. ej. lab 1) reconstruido 100% combinando catálogos, sin código hardcodeado de sitio/vuln.

---

## 4. Fase D — Generador de labs (sección web)

### D.1 Modelo `LabDefinition`
- [ ] Estructura serializable (JSON): sitio, OS, máquinas/puertos, vulns + dónde, credenciales, privesc, learningSteps derivados.
- [ ] Exportar/importar `LabDefinition` como JSON (compartir labs).

### D.2 Motor de generación
- [ ] `generateLab(definition): Scenario` → llama `buildScenario` con los catálogos.
- [ ] Derivación automática de `learningSteps`/`missions` desde vulns elegidas.
- [ ] Asignación de IPs/DHCP y red aislada reutilizando `assignDHCP`.

### D.3 UI del generador (ruta admin)
- [ ] Sección estilo `AdminPanel` (`/:lang/lab-builder`): wizard paso a paso.
- [ ] Paso 1: elegir sitio (vista previa del `SiteDefinition`).
- [ ] Paso 2: elegir vulns y dónde (máquina/servicio).
- [ ] Paso 3: credenciales y ubicación.
- [ ] Paso 4: privesc y OS.
- [ ] Paso 5: preview del lab + "Generar" → lab jugable (o exportar `laboratorioXX.ts`).
- [ ] Persistir labs generados (ruta `/scenario/:id` dinámica).

### D.4 Calidad
- [ ] Generar un lab nuevo completo de punta a punta (jugarlo manual + `HAPPY_PATH_TEST.md`).
- [ ] Tests del generador: para cada combinación de catálogo, validar que `validationCriteria` son alcanzables.

**Criterio de salida:** crear un lab nuevo desde la UI, jugarlo de principio a fin y que complete las misiones.

---

## 5. Transversal / riesgos

- [ ] **Contrato de metadata estable**: nuevas vulns deben emitir los criterios existentes o extender `types.ts` + `labValidator` (criterio `custom` hoy devuelve false — evaluar si se activa).
- [ ] **Tests**: mantener la suite (hoy 1495 tests) migrando tests de sitios a los nuevos renderers.
- [ ] **Rendimiento**: `SiteRenderer` no debe re-renderear todo el sitio por cada cambio de estado.
- [ ] **Seguridad**: el contenido que venga del FS se trata como data (tipos, sin ejecutar scripts).
- [ ] Mantener `docs/ROADMAP.md` y `AGENTS.md` actualizados al cerrar cada fase.

---

## 6. Hito actual

- [x] Documento de plan creado.
- [ ] **Fase A** — diseño `SiteDefinition` (A.1).
- [ ] **Fase A** — `SiteRenderer` (A.2).
- [ ] **Fase A** — migrar WordPress (A.3).
- [ ] **Fase B** — sitios desde FS.
- [ ] **Fase C** — catálogos.
- [ ] **Fase D** — generador + UI.

---

*Siguiente paso propuesto: A.1 — definir tipos `SiteDefinition`/`SiteBlock` y validar el diseño antes de tocar el renderer.*
