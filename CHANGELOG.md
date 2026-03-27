# Changelog

## [2.6.0] - 2026-03-26

### ✨ Nuevas Características

#### NetworkMap — Múltiples credenciales con indicador de servicio
**Archivos:** `src/components/NetworkMap.tsx`, `src/store/scenarioStore.ts`, `src/types.ts`
- **Mejora**: El panel de máquina ahora muestra múltiples credenciales (WP-Admin y SSH) simultáneamente
- **Nuevo**: Etiqueta de servicio visible para cada credencial (WordPress Admin, SSH, FTP)
- **Colores**: Naranja (sin verificar) → Verde (verificado) por credencial individual
- **Implementación**: `found_credentials` ahora es array con campo `service` en cada credencial
- **Beneficio**: El usuario puede ver todas las credenciales descubiertas y su estado de verificación

#### WordPress Lab — Config.bak limpio (solo WP-Admin)
**Archivo:** `src/components/fakesites/wordpress/wp01/ConfigBak.tsx`
- **Cambio**: Removidas credenciales SSH y de base de datos del archivo `config.bak`
- **Ahora**: Solo muestra credenciales WP-Admin (`admin`/`P@ssw0rd123!`)
- **Motivo**: Simplificar el descubrimiento y evitar confusión

#### WP-Admin Login — Fix de credenciales y campo limpio
**Archivos:** `src/components/FakeBrowser.tsx`, `src/components/fakesites/wordpress/wp01/Login.tsx`
- **Fix**: El login ahora usa credenciales WP-Admin correctas (no SSH)
- **Mejora**: Campo de usuario ahora está vacío (sin placeholder "admin") para evitar confusión
- **Flujo**: Usuario debe ingresar manualmente `admin` y `P@ssw0rd123!`

#### WordPress Lab — Credenciales SSH descubiertas junto con WP-Admin
**Archivos:** `src/components/fakesites/wordpress/wp01/Uploads.tsx`
- **Mejora**: Al descubrir `config.bak`, se registran ambas credenciales (WP-Admin y SSH)
- **Comportamiento**: Ambas credenciales aparecen en naranja simultáneamente en la topología
- **Verificación independiente**: WP-Admin se verifica al hacer login, SSH al conectarse vía terminal
- **Implementación**: `onCredentialsFound()` llamado dos veces con servicios diferentes

#### WordPress Lab — Credenciales SSH root descubiertas en Dashboard
**Archivos:** `src/components/fakesites/wordpress/wp01/Dashboard.tsx`, `src/components/FakeBrowser.tsx`, `src/exercises/exercise01.ts`
- **Cambio**: Las credenciales SSH ya no se descubren en `config.bak`
- **Nuevo**: Al acceder al WP-Admin Dashboard, se descubren credenciales SSH de **root**
- **Flujo actualizado**:
  1. Misión 5: Acceder a WP-Admin con credenciales de admin desde `config.bak` → credencial WP-Admin verde
  2. En el Dashboard: aparecen credenciales SSH root (naranja) en la topología
  3. Misión 6: Conectar por SSH como root → credencial SSH verde, laboratorio completo
- **Seguridad**: Acceso root completo a la máquina objetivo vía SSH

#### WordPress Lab — Nuevo flujo de misiones (WP-Admin → SSH)
**Archivo:** `src/exercises/exercise01.ts`
- **Cambio**: Ahora el laboratorio tiene 6 misiones en lugar de 5
- **Nueva misión 6**: "Conexión SSH" — el paso final para completar el laboratorio
- **Flujo actualizado**: 
  1. Misiones 1-4: Reconocimiento, escaneo, enumeración web, directorios
  2. Misión 5: Compromiso WP-Admin (login exitoso en /wp-admin)
  3. Misión 6: Conexión SSH (completa el laboratorio)
- **Preparación**: Estructura lista para agregar escalada de privilegios en futuras versiones

#### WP-Admin Dashboard — Botón de cerrar sesión
**Archivo:** `src/components/fakesites/wordpress/wp01/Dashboard.tsx`
- **Nuevo**: Botón "Cerrar sesión" en la barra superior del dashboard
- **Comportamiento**: Al cerrar sesión, se redirige al login pero las credenciales permanecen verificadas
- **Implementación**: `onLogout` prop que llama `setBrowserLoggedIn(false)` y navega al login

#### Terminal — Parámetro `service` en credenciales
**Archivo:** `src/components/Terminal.tsx`
- **Mejora**: Los comandos `hydra` y `ssh` ahora pasan el parámetro `service` al descubrir/verificar credenciales
- **Fix**: Las credenciales SSH ya no muestran "Desconocido" sino "SSH" correctamente
- **Fix**: Al salir de SSH, las credenciales permanecen verificadas (verdes)

### 🔧 Cambios

#### Terminal — Auto-scroll automático al final
**Archivo:** `src/components/Terminal.tsx`
- **Mejora**: Scroll suave automático cuando aparece nueva salida
- **Comportamiento**: La terminal mantiene siempre visible el último output
- **Implementación**: `useEffect` con `scrollTo({ behavior: 'smooth' })` activado en cambios de `history`, `busy` e `input`
- **Beneficio**: El usuario no necesita scrollear manualmente para ver resultados nuevos

#### FakeBrowser — Seguridad HTTPS forzada para Google
**Archivo:** `src/components/FakeBrowser.tsx`
- **Mejora**: Google ahora requiere HTTPS obligatoriamente
- **Nuevo componente**: `HttpSecurityError` — muestra página de error estilo Chrome cuando se intenta acceder vía HTTP
- **Mensaje**: "Tu conexión no es privada" con código `NET::ERR_CERT_AUTHORITY_INVALID`
- **Opciones**: Botón "Usar HTTPS seguro" o "Volver a Google (seguro)"
- **Comportamiento**: URLs como `http://google.com` o `http://www.google.com` muestran error de seguridad

### 🔧 Cambios

#### Directorio inicial de Kali — `/` → `/root`
**Archivo:** `src/store/scenarioStore.ts`
- **Cambio**: El directorio inicial al cargar un escenario ahora es `/root` en lugar de `/`
- **Razón**: `/root` es el directorio home real del usuario root en Kali Linux
- **Impacto**: El prompt muestra `~` (home) correctamente al inicio

#### Sistema de archivos — flag.txt removido del atacante
**Archivo:** `src/fs-models/fs-linux.ts`
- **Cambio**: El archivo `/root/flag.txt` ya no está en el filesystem base de Linux
- **Razón**: La flag es de la máquina víctima, no del atacante Kali
- **Implementación**: Cada escenario agrega su propia flag desde el archivo de configuración
- **Ejemplo**: `exercise01.ts` agrega `/root/flag.txt` con `THM{ROOT_ACCESS_ACHIEVED}`

#### FakeBrowser — URLs de Google normalizadas
**Archivo:** `src/components/FakeBrowser.tsx`
- **Mejora**: Acepta múltiples formatos de URL para Google:
  - `https://www.google.com` ✅
  - `https://google.com` ✅
  - `http://google.com` ❌ (error de seguridad)
  - `http://www.google.com` ❌ (error de seguridad)
- **Implementación**: Función `normalizeForComparison()` para manejar variantes

### 🧪 Tests

#### Tests actualizados
- **happyPath.test.ts**: Validaciones estrictas con `expectSuccess()` helper
- **FakeBrowser tests**: Verifican comportamiento HTTPS para Google
- **Terminal tests**: Verifican auto-scroll en nuevas entradas
- **Total**: 474 tests pasando (todos exitosos)

---

## [2.5.7] - 2026-03-26

### 🐛 Fixes

#### Terminal — Ctrl+C en Metasploit ahora preserva el prompt
**Archivo:** `src/components/Terminal.tsx`
- **Causa**: Al presionar Ctrl+C en el prompt de Metasploit (msf6>), se mostraba el mensaje de salida pero el prompt desaparecía
- **Fix**: Cambiado `command: null` a `command: ''` en la entrada de historial para Ctrl+C en MSF, igual que el comportamiento del comando `exit`
- **Resultado**: Ctrl+C en Metasploit ahora se comporta igual que el comando `exit`, mostrando correctamente el prompt de Kali después de salir

#### Exercise01 — Texto del step de gobuster actualizado
**Archivo:** `src/exercises/exercise01.ts`
- **Causa**: El step de descubrimiento de directorios mostraba `rockyou.txt` en lugar de la ruta completa del diccionario de directorios
- **Fix**: Actualizado texto del step para mostrar `/usr/share/wordlists/SecLists/Discovery/Web-Content/common.txt`
- **Resultado**: Los usuarios ahora ven la ruta correcta del diccionario de directorios web

#### MissionPanel — Texto de steps largos ahora se muestra completo
**Archivo:** `src/components/MissionPanel.tsx`
- **Causa**: Los textos largos de los steps (como el comando gobuster completo) se cortaban y no se podían leer
- **Fix**: Agregada clase `break-all` al párrafo de descripción del step
- **Resultado**: Los comandos largos ahora se muestran completos con word-break automático

### 🧪 Tests

#### Tests verificados
- Tests de happyPath ya usan las rutas correctas de diccionarios
- No se requirieron cambios en tests existentes

---

## [2.5.6] - 2026-03-26

### 🐛 Fixes

#### FakeBrowser — Logo "Go" corregido a "Google" en resultados de búsqueda
**Archivo:** `src/components/FakeBrowser.tsx`
- **Causa**: El componente `GoogleSearch` solo mostraba "Go" en lugar de "Google completo en el header de resultados
- **Fix**: Agregadas las letras faltantes (o, g, l, e) al logo del header de búsqueda
- **Resultado**: Ahora se muestra "Google completo al navegar a los resultados de búsqueda

#### Terminal — Ctrl+L preserva el input actual
**Archivo:** `src/components/Terminal.tsx`
- **Causa**: Al presionar Ctrl+L para limpiar la pantalla, se ejecutaba `setInput('')` que borraba lo que el usuario estaba escribiendo
- **Fix**: Eliminado el `setInput('')` del handler de Ctrl+L
- **Resultado**: Ctrl+L ahora limpia la pantalla pero preserva el contenido del input actual, como en terminales Linux reales

### 🧪 Tests

#### Tests verificados
- `FakeBrowser.test.tsx`: 13 tests pasando ✓
- `Terminal.test.tsx`: 23 tests pasando ✓
- Total: 36 tests pasando

---

## [2.5.5] - 2026-03-26

### ✨ Nuevas Características

#### Diccionario rockyou.txt agregado al sistema de archivos
**Archivo:** `src/fs-models/fs-linux.ts`
- Agregado `/usr/share/wordlists/rockyou.txt` con ~100 contraseñas comunes
- Incluye contraseñas populares: 123456, password, qwerty, admin, root, toor, etc.
- El diccionario está disponible para `cat` y lectura desde la terminal
- Ubicación realista: `/usr/share/wordlists/rockyou.txt` (como en Kali Linux)

#### Diccionario common.txt de SecLists agregado para enumeración web
**Archivo:** `src/fs-models/fs-linux.ts`
- Agregado `/usr/share/wordlists/SecLists/Discovery/Web-Content/common.txt` con ~100 directorios comunes
- Incluye directorios web típicos: admin, wp-admin, uploads, backup, config, login, etc.
- Estructura de directorios SecLists replicada: Discovery/Web-Content/
- Ideal para enumeración de directorios con gobuster

#### Gobuster ahora usa diccionario de directorios web
**Archivo:** `src/commands/tools/gobuster.ts`
- Validación estricta: debe usar `-w /usr/share/wordlists/SecLists/Discovery/Web-Content/common.txt`
- Mensaje de error claro con la ruta correcta del diccionario
- Diccionario apropiado para enumeración de directorios (no contraseñas)
- Uso actualizado en ejemplos y documentación

#### Hydra ahora requiere diccionario específico
**Archivo:** `src/commands/tools/hydra.ts`
- Validación estricta: debe usar `-P /usr/share/wordlists/rockyou.txt`
- Mensaje de error claro con la ruta correcta del diccionario
- Consistencia con gobuster en validación de wordlist

### 🧪 Tests

#### Tests actualizados para nueva sintaxis
**Archivos:** `src/commands/tools/__tests__/hydra.test.ts`, `src/commands/__tests__/happyPath.test.ts`
- 45 tests pasando correctamente
- Todos los comandos hydra y gobuster actualizados para usar `/usr/share/wordlists/rockyou.txt`
- Tests de happy path verifican el flujo completo con el nuevo diccionario

---

## [2.5.4] - 2026-03-26

### ✨ Nuevas Características

#### Contenido real en WordPress (Escenario 01)
**Archivo:** `src/components/fakesites/wordpress/wp01/Index.tsx`
- Reemplazado contenido genérico ("Hello World!", "Sample Post", "Another Entry") con artículos de tecnología reales:
  1. **"Claude 4: La nueva generación de IA de Anthropic revoluciona el mercado"** - Novedades sobre Claude en el mundo de IA
  2. **"Ciberseguridad e IA: Cómo la inteligencia artificial está transformando la defensa digital"** - Artículo sobre ciberseguridad e IA
  3. **"Nueva vulnerabilidad crítica reportada en WordPress afecta a millones de sitios"** - Artículo sobre vulnerabilidad RCE en WordPress
- Los artículos tienen fechas dinámicas y contenido técnico realista

#### Botones de Google funcionales
**Archivo:** `src/components/FakeBrowser.tsx`
- Agregados botones "Buscar con Google" y "Voy a tener suerte" al buscador de Google
- **Buscar con Google**: Realiza búsqueda con texto ingresado, o búsqueda aleatoria de temas de hacking si está vacío
- **Voy a tener suerte**: Muestra página del dinosaurio de Chrome con mensaje divertido
- Búsquedas aleatorias incluyen: "how to hack wifi", "sql injection tutorial", "metasploit guide", etc.

#### Página del dinosaurio de Chrome (Easter Egg)
**Archivo:** `src/components/FakeBrowser.tsx`
- Nuevo componente `DinoGame()` que simula la página "No hay conexión" de Chrome
- Mensaje personalizado: *"Esto es un simulador, no puedo mostrar nada muy útil desde acá. 😅"*
- Código de error: `ERR_INTERNET_SIMULATOR_MODE`
- Incluye emoji de dinosaurio 🦖 y decoración visual de cactus

### 🐛 Fixes

#### FakeBrowser — chrome://dino no funcionaba
**Archivo:** `src/components/FakeBrowser.tsx`
- **Causa**: La función `navigate()` agregaba `http://` a todas las URLs sin esquema, convirtiendo `chrome://dino` en `http://chrome://dino`
- **Fix**: Actualizada expresión regular para reconocer `chrome://` como esquema válido
- **Resultado**: El botón "Voy a tener suerte" ahora navega correctamente a `chrome://dino` y muestra la página del dinosaurio

### 🧪 Tests

#### Tests actualizados para nuevo contenido
**Archivo:** `src/components/fakesites/wordpress/wp01/__tests__/Index.test.tsx`
- Test "debe mostrar artículos del blog" actualizado para verificar nuevos títulos
- Test "debe mostrar contenido de los artículos" ahora verifica contenido real (Anthropic, ciberseguridad, ejecución remota de código)
- Usado `getAllByText` para "Claude 4" que aparece en título y contenido

---

## [2.5.3] - 2026-03-26

### 📝 Documentación

#### Testing Strategy agregada al README
**Archivo:** `README.md`
- Nueva sección completa "🧪 Testing Strategy" documentando:
  - Qué ya implementamos (suite de tests con Vitest)
  - Cobertura actual (5 escenarios con happy path tests)
  - 5 características clave de los tests:
    1. Tests de flujo completo (Golden Path)
    2. Validaciones basadas en estado (no solo output)
    3. Validaciones estrictas de errores
    4. Simulación controlada de estado con `advanceState`
    5. Código de tests mantenible con helpers
  - Limitación actual (engine no expone estado actualizado)
  - Mejora futura recomendada (exponer `updatedState` desde engine)
  - Nivel actual de testing por área
  - Importancia de la mejora pendiente (no crítico para etapa actual, sí para escalar)
  - Filosofía de testing: "Testear comportamiento del usuario, no implementación interna"

---

## [2.5.2] - 2026-03-26

### 🐛 Fixes

#### Terminal — Prompts históricos no cambian al entrar a msfconsole
**Archivo:** `src/components/Terminal.tsx`
- **Causa**: `renderKaliPrompt` y `renderKaliPromptSymbol` usaban `isMsfActive()` (estado global) para decidir el estilo de renderizado, afectando también todas las entradas históricas.
- **Fix**: Las funciones ahora inspeccionan el **contenido del texto del prompt** (buscan `'msf6'`, `'meterpreter'`, `'C:\\Windows\\system32>'`) para decidir el estilo. Los prompts históricos de Linux se mantienen intactos al entrar/salir de MSF.
- **`renderKaliPromptSymbol`**: Ahora acepta un parámetro `promptText` opcional. Cuando se renderiza el historial, se pasa `entry.prompt` para que el símbolo (`└─#`, `>`) respete el estado del momento en que fue ejecutado el comando.
- **Resultado**: Entrar/salir de Metasploit ya no retroactivamente cambia el estilo visual de comandos anteriores.

---

## [2.5.1] - 2026-03-26

### 🐛 Fixes

#### ls — Directorio mostrándose a sí mismo como subdirectorio
**Archivo:** `src/commands/builtin/ls.ts`
- **Causa**: El segundo loop que detecta marcadores `.dir` usaba `filePath.slice(0, -4)` (removía 4 chars: `.dir`), dejando la barra diagonal en paths como `/var/mail/.dir` → `/var/mail/`. Con barra incluida, `parentDir === targetDir` era verdadero y el directorio aparecía como subdirectorio de sí mismo.
- **Fix**: Cambiado a `filePath.slice(0, -5)` para remover `/.dir` (5 chars) completo, obteniendo `/var/mail` (sin barra) como `dirPath`. Ahora `parentDir = '/var/'` que no coincide con `targetDir = '/var/mail/'`.
- **También**: El chequeo `filePath.endsWith('.dir')` cambiado a `filePath.endsWith('/.dir')` para mayor precisión.

#### Autocompletado — Tab mostraba archivos `.dir` internos
**Archivo:** `src/utils/autocomplete.ts`
- **Causa**: `getItemsInDirectory` no filtraba los archivos marcadores `.dir` que son internos del sistema de archivos virtual.
- **Fix**: Agregados filtros `dir !== '.dir'` (para subdirectorios) y `relativePath !== '.dir' && !relativePath.endsWith('.dir')` (para archivos directos) para que nunca aparezcan en sugerencias de Tab.

#### Autocompletado — `mkdir` y `rmdir` sin Tab completion
**Archivo:** `src/utils/autocomplete.ts`
- **Causa**: `mkdir` y `rmdir` no estaban incluidos en `AVAILABLE_COMMANDS`.
- **Fix**: Agregados ambos comandos a la lista.

---

## [2.5.0] - 2026-03-26

### 🔧 Refactoring

#### exercise03 y exercise04 — Eliminación de código duplicado
**Archivos:** `src/exercises/exercise03.ts`, `src/exercises/exercise04.ts`
- **Causa**: Estos archivos tenían su propia copia de `createAttackerMachine` que retornaba `files: []` (vacío), a diferencia de `templates.ts` que usa `createLinuxFileSystem({ username: 'kali' })`. Esto causaba que `ls` y `cd` fallaran en los escenarios 3 y 4 porque la máquina atacante no tenía sistema de archivos.
- **Fix**: Ambos archivos ahora importan `buildScenario`, `COMMON_PORTS`, `createFile`, `createLinuxFileSystem` y `REVERSE_SHELL_PAYLOAD` directamente desde `templates.ts`, igual que hacen `exercise01.ts` y `exercise02.ts`.
- **Resultado**: La máquina atacante en los escenarios 3 y 4 ahora tiene el sistema de archivos Linux completo (Kali).

#### exercise03 y exercise04 — Eliminación de código duplicado (funciones helper)
- Removidas copias locales de `buildScenario`, `createAttackerMachine`, `createWebDirs`, `createLinuxFileSystem`, `COMMON_PORTS`, `REVERSE_SHELL_PAYLOAD` y la interfaz `ScenarioBuilderConfig`.
- Archivos reducidos de ~183 líneas a ~59-61 líneas cada uno.
- Completada la modularización iniciada en [2.0.0] (pendiente en exercise03 y exercise04).

#### cd — Lista de directorios conocidos actualizada
**Archivo:** `src/commands/builtin/cd.ts`
- Agregado `/home/kali/` a `knownDirs` para que `cd ~` y `cd /home/kali/` funcionen en la máquina atacante Kali.

#### scenarioStore — currentDir se resetea al cambiar escenario
**Archivo:** `src/store/scenarioStore.ts`
- Agregado `currentDir: '/'` al `set()` dentro de `selectScenario` para que las sesiones anteriores no contaminen el directorio activo al cargar un nuevo escenario.

---

## [2.4.5] - 2026-03-25

### 🧪 Tests y Coverage Mejorados

#### Tests completos para nuevos comandos
**Archivos:** `src/commands/builtin/__tests__/mkdir.test.ts`, `src/commands/builtin/__tests__/rmdir.test.ts`
- **mkdir**: 14 tests cubriendo todos los casos de uso
  - Creación simple, múltiples directorios, paths absolutos/relativos
  - Flag -p, validación de padres, permisos de sistema
  - Errores: opción inválida, directorio existente, padres faltantes
- **rmdir**: 13 tests cubriendo toda la funcionalidad
  - Eliminación simple, múltiples directorios, paths absolutos/relativos
  - Flag -p, eliminación de padres, validación de vacíos
  - Errores: directorio no existe, directorio no vacío, permisos
- **help**: 9 tests mejorados significativamente
  - Lista general, ayuda específica por comando
  - Case insensitive, manejo de comandos con espacios
  - Errores: comando no existente, sintaxis inválida

#### Coverage mejorado
- **mkdir**: 1.11% → ~90% (mejora masiva)
- **rmdir**: 1.25% → ~85% (mejora masiva)  
- **help**: 44.44% → ~95% (mejora significativa)
- **Total builtin**: 53.2% → ~85% (mejora general)

#### Tests corregidos
- **help**: Agregada propiedad `isError: false` en todos los returns
- **help**: Importación de `beforeEach` para setup de tests
- **mkdir/rmdir**: Estructura de tests consistente con otros comandos
- **Tipos**: Corrección de `found_credentials` en contextos de prueba

---

## [2.4.4] - 2026-03-25

### 🐛 Fixes

#### Tests - Corrección de test de nc
**Archivo:** `src/commands/tools/__tests__/nc.test.ts`
- **Test actualizado**: Removida expectativa de `cancelKey: 'c'`
- **Nuevo mensaje**: Verificado que contiene 'Ctrl+C' en lugar de 'c'
- **Contexto agregado**: `currentDir: '/'` en contextos de test
- **Compatibilidad**: Tests ahora pasan con cambios de nc 2.3.2

#### Coverage mantenido
- **Todos los tests pasan**: 436/436 tests exitosos
- **Coverage estable**: Sin pérdida de cobertura con nuevos comandos
- **Integración completa**: mkdir y rmdir funcionando correctamente

---

## [2.4.3] - 2026-03-25

### 🐛 Fixes

#### mkdir - Lógica del flag -p corregida finalmente
**Archivo:** `src/commands/builtin/mkdir.ts`
- **Flag -p**: Solo para crear directorios padres que no existen
- **Paths absolutos**: `mkdir /var/www/html/nueva` funciona sin -p si padres existen
- **Paths relativos**: `mkdir nueva` crea en directorio actual
- **Múltiples niveles**: `mkdir -p dira/dirb` crea toda la estructura

#### Comportamiento correcto implementado
- **Sin -p**: `mkdir nueva` ✅ (crea en directorio actual)
- **Sin -p**: `mkdir /var/www/html/nueva` ✅ (si /var/www/html/ existe)
- **Sin -p**: `mkdir /ruta/inexistente/nueva` ❌ (padres no existen)
- **Con -p**: `mkdir -p dira/dirb` ✅ (crea dira y dira/dirb)
- **Con -p**: `mkdir -p /ruta/completa/nueva` ✅ (crea toda la estructura)

#### Lógica realista de Linux
- **-p específico**: Solo crea padres que no existen
- **Paths completos**: Permitidos sin -p si padres existen
- **Validación**: Verifica existencia de padres antes de crear

---

## [2.4.2] - 2026-03-25

### 🐛 Fixes

#### mkdir - Lógica de paths corregida completamente
**Archivo:** `src/commands/builtin/mkdir.ts`
- **Sin -p**: Solo permite crear en directorio actual
- **Paths absolutos**: `mkdir /var/nueva` ahora falla sin -p (comportamiento correcto)
- **Paths relativos**: `mkdir nueva` crea en directorio actual
- **Con -p**: Permite paths absolutos y rutas completas
- **Validación estricta**: No permite `../` o paths complejos sin -p

#### Comportamiento correcto implementado
- **Sin -p**: `mkdir nueva` ✅ (crea en directorio actual)
- **Sin -p**: `mkdir /var/nueva` ❌ (error, requiere -p para paths absolutos)
- **Sin -p**: `mkdir sub/carpeta` ❌ (error, requiere -p para paths con /)
- **Con -p**: `mkdir -p /var/nueva` ✅ (crea en ruta absoluta)
- **Con -p**: `mkdir -p sub/carpeta` ✅ (crea estructura completa)

#### Lógica realista de Linux
- **Directorio actual**: Sin -p solo funciona en el contexto actual
- **Paths absolutos**: Requieren -p para especificar ruta completa
- **Seguridad**: Previene creaciones accidentales en otras ubicaciones

---

## [2.4.1] - 2026-03-25

### 🐛 Fixes

#### mkdir - Lógica de directorio raíz corregida
**Archivo:** `src/commands/builtin/mkdir.ts`
- **Paths absolutos**: `mkdir /var/nueva` ahora funciona sin -p
- **Directorio raíz**: `/` siempre existe como padre válido
- **Comportamiento correcto**: Solo requiere -p cuando los padres no existen
- **Ejemplo funcionando**: `mkdir /var/nueva` crea directamente en /var/

#### Comportamiento corregido
- **Sin -p**: `mkdir /var/nueva` ✅ (funciona, /var existe)
- **Sin -p**: `mkdir /var/inexistente/nueva` ❌ (error, /var/inexistente no existe)
- **Con -p**: `mkdir -p /var/inexistente/nueva` ✅ (crea toda la ruta)

---

## [2.4.0] - 2026-03-25

### 🚀 Nuevas Funcionalidades

#### Comandos mkdir y rmdir implementados
**Archivos:** `src/commands/builtin/mkdir.ts`, `src/commands/builtin/rmdir.ts`, `src/commands/builtin/help.ts`

##### mkdir - Crear directorios
- **Sintaxis**: `mkdir [-p] directorio...`
- **Flag -p**: Crea directorios padres si no existen
- **Paths relativos**: `mkdir nueva_carpeta` (crea en directorio actual)
- **Paths absolutos**: `mkdir /tmp/test` (crea en ruta absoluta)
- **Rutas completas**: `mkdir -p /var/www/html/nueva` (crea toda la estructura)
- **Validación**: Sin -p, los padres deben existir
- **Permisos**: Solo root puede crear en directorios del sistema (/var, /etc, etc.)

##### rmdir - Eliminar directorios vacíos
- **Sintaxis**: `rmdir [-p] directorio...`
- **Flag -p**: Elimina directorios padres si quedan vacíos
- **Validación**: Solo elimina directorios completamente vacíos
- **Rutas completas**: `rmdir -p /var/www/html/nueva` (elimina toda la estructura)
- **Permisos**: Solo root puede eliminar en directorios del sistema
- **Seguridad**: Protege directorios del sistema como /var, /etc, etc.

#### Sistema de ayuda mejorado
- **help individual**: `help mkdir`, `help rmdir`, `help ls`, etc.
- **Documentación completa**: Uso, opciones, ejemplos y descripción
- **Mensajes de error**: Claros cuando un comando no tiene ayuda disponible

### 🔧 Cambios

#### Usuario de máquina atacante actualizado
**Archivo:** `src/exercises/templates.ts`
- **Usuario cambiado**: De `root` a `kali` en máquina atacante
- **Consistencia**: Ahora el prompt muestra `kali@kali-attacker` en lugar de `root@kali-attacker`
- **Realismo**: Kali Linux normalmente usa usuario no-root por defecto

#### Registro de comandos expandido
**Archivos:** `src/commands/index.ts`, `src/commands/builtin/index.ts`
- **Nuevos comandos**: `mkdir` y `rmdir` agregados al registro
- **Exportaciones**: Todos los comandos builtin correctamente exportados

---

## [2.3.3] - 2026-03-25

### 🐛 Fixes

#### Metasploit - Prompt duplicado corregido
**Archivo:** `src/components/Terminal.tsx`
- **Prompt único**: Metasploit ahora muestra solo `msf6 >` sin línea adicional
- **Sin duplicación**: Eliminado el `>` extra que aparecía en línea separada
- **Renderizado condicional**: Metasploit usa una línea, Linux normal usa dos líneas
- **Experiencia auténtica**: Comportamiento idéntico al msfconsole real

#### Comportamiento mejorado
- **Metasploit**: `msf6 >` (una sola línea)
- **Linux normal**: `┌──(user㉿host)-[path]` + `└─#` (dos líneas)
- **Consistencia visual**: Cada sistema mantiene su formato característico

---

## [2.3.2] - 2026-03-25

### 🐛 Fixes

#### Netcat (nc) - Cancelación con Ctrl+C estandarizado
**Archivos:** `src/commands/tools/nc.ts`, `src/types.ts`, `src/components/Terminal.tsx`
- **Mensaje actualizado**: Ahora indica "Presiona Ctrl+C para cancelar" en lugar de "Presiona 'c' para cancelar"
- **Comportamiento estándar**: La tecla 'c' simple ya no cancela el listener de nc
- **Ctrl+C exclusivo**: Solo Ctrl+C puede detener comandos bloqueantes como nc listener
- **Consistencia**: Todos los comandos bloqueantes usan el mismo atajo (Ctrl+C)
- **Tipo actualizado**: `cancelKey` ahora es opcional en `blockingCommand` (deprecated)

#### Comportamiento mejorado
- **Experiencia Linux real**: Comportamiento consistente con terminales Linux reales
- **Mensaje claro**: Los usuarios saben exactamente qué tecla usar
- **Sin ambigüedad**: Eliminada la confusión entre 'c' y Ctrl+C

---

## [2.3.1] - 2026-03-25

### 🐛 Fixes

#### Historial de comandos preservado en atajos de teclado
**Archivo:** `src/components/Terminal.tsx`
- **Ctrl+L**: Ya no borra el historial de comandos, solo limpia la pantalla
- **Ctrl+C**: Resetea el índice del historial para permitir navegación con flechas
- **Ctrl+U**: Mantiene el historial intacto al limpiar la línea actual
- **Navegación con flechas**: Funciona correctamente después de usar atajos

#### Comportamiento mejorado
- **Historial persistente**: Los comandos anteriores permanecen accesibles
- **Índice reseteado**: `setHistIdx(-1)` asegura que las flechas funcionen
- **Consistencia**: Todos los atajos ahora manejan el historial de manera uniforme

---

## [2.3.0] - 2026-03-25

### 🚀 Nuevas Funcionalidades

#### Atajos de teclado estándar de Linux
**Archivo:** `src/components/Terminal.tsx`
- **Ctrl+L**: Limpia toda la pantalla (como comando `clear`)
- **Ctrl+U**: Limpia la línea actual del prompt
- **Ctrl+C**: Detener procesos o salir de programas:
  - Detiene listeners activos (ej: `nc -nlvp 4444`)
  - Sale de Metasploit Framework
  - Detiene cualquier proceso en ejecución
  - Limpia línea si no hay procesos activos

### 🐛 Fixes

#### Sistema de archivos y comandos mejorados
**Archivos:** `src/commands/builtin/ls.ts`, `src/utils/autocomplete.ts`, `src/components/Terminal.tsx`

##### Comando ls completamente funcional
- **`ls`**: Muestra solo nombres (comportamiento por defecto)
- **`ls -l`**: Formato largo con permisos, propietario, tamaño, fecha
- **`ls -a`**: Muestra archivos ocultos sin propiedades
- **`ls -la`**: Archivos ocultos con formato largo
- Soporta combinaciones: `-al`, `-la`, `-l -a`, etc.

##### Autocompletado de paths mejorado
- **Paths absolutos**: `cat /et` + Tab → `cat /etc/` (mantiene la `/`)
- **Navegación consecutiva**: Permite seguir usando Tab en subdirectorios
- **Barra diagonal**: Se agrega automáticamente a directorios para facilitar navegación

##### Prompt dinámico corregido
- **Directorio actual**: Muestra correctamente `/` o `~/path` según ubicación
- **Historial preservado**: Cada entrada mantiene su prompt original
- **Actualización inmediata**: Cambia después de comandos `cd`

### 🧪 Tests

#### Coverage y calidad mejorados
- **436 tests pasando** (+5 tests nuevos)
- **0 tests fallando** (corregidos 5 tests existentes)
- **Tests actualizados** para nuevas funcionalidades de autocompletado y prompt
- **Mantenimiento de coverage** en niveles saludables (>90% en core)

---

## [2.2.3] - 2026-03-25

### 🐛 Fixes

#### Sistema de archivos completo para máquina atacante
**Archivos:** `src/exercises/templates.ts`, `src/fs-models/fs-linux.ts`
- Agregado sistema de archivos completo a la máquina atacante (Kali)
- Ahora `ls /` y `cd /` funcionan correctamente en la máquina atacante
- Sistema de archivos incluye directorios estándar de Linux: /bin, /etc, /home, /var, /usr, /tmp, /root, etc.

#### Comando ls mejorado con soporte de flags
**Archivo:** `src/commands/builtin/ls.ts`
- Implementación de flags `-l` (formato largo) y `-a` (archivos ocultos)
- `ls` muestra solo nombres de archivos/directorios
- `ls -l` muestra formato largo con permisos, propietario, tamaño y fecha
- `ls -a` muestra archivos ocultos (que empiezan con .)
- `ls -la` o `ls -l -a` combina ambos formatos

#### Prompt dinámico con directorio actual
**Archivo:** `src/components/Terminal.tsx`
- El prompt ahora muestra el directorio actual en lugar de siempre `~`
- Formato: `user@hostname:/current/path#` o `user@hostname:~/relative/path$`
- Los prompts anteriores en pantalla conservan el directorio que tenían cuando se ejecutó el comando
- Solo el nuevo prompt muestra el directorio actualizado después de `cd`

### 🎨 Mejoras de UI

#### Prompt estilo Kali Linux moderno (verde claro/celeste)
**Archivo:** `src/components/Terminal.tsx`
Actualización de los colores del prompt para coincidir con el último Kali Linux. Cambiado el color a verde claro/celeste (#7fffd4 - aquamarine) para:
- Usuario (user)
- Símbolo @
- Host
- Símbolo # o $

Esto hace que el prompt se vea más moderno y auténtico al estilo de Kali Linux actual, con un verde más claro e intermedio entre verde y celeste.

---

## [2.2.1] - 2026-03-25

### 🐛 Fixes

#### Fix #18: Sistema de archivos en máquina atacante
**Archivo:** `src/exercises/templates.ts`
La máquina atacante (Kali) ahora tiene un sistema de archivos Linux completo. Anteriormente, los comandos `ls /` y `cd /` no funcionaban en la máquina atacante porque no tenía archivos asignados. Ahora usa `createLinuxFileSystem({ username: 'root' })` para tener acceso a todos los directorios y archivos del sistema.

---

## [2.2.0] - 2026-03-25

### ✨ Nuevas Características

#### Prompt estilo Kali Linux
- **Diseño moderno**: Prompt de dos líneas estilo Kali Linux (`┌──(㉿)-[~]` + `└─$`)
- **Colores personalizados**:
  - Usuario y host en rojo (#ff0000)
  - Ruta actual en blanco (#ffffff)
  - Símbolo (#/$) en rojo (#ff0000)
  - Caracteres decorativos (┌, ──, (, ), [, ], └─) en azul (#0000ff)
- **Consistencia**: Prompt uniforme en toda la aplicación (terminal, historial, input)

#### Sistema de Modelos de Archivos (fs-models)
- **Arquitectura modular**: Nueva carpeta `src/fs-models/` para modelos de sistemas de archivos
- **Modelo Linux** (`fs-linux.ts`):
  - Sistema de archivos completo de Linux (Ubuntu 20.04)
  - 19 directorios raíz + subdirectorios
  - Archivos de configuración del sistema (/etc/passwd, /etc/shadow, etc.)
  - Logs del sistema (/var/log/syslog, auth.log, kern.log)
  - Directorios de usuario (/home/admin/, /root/)
  - Configuración de servicios (Apache, SSH, MySQL)
- **Modelo Windows** (`fs-windows.ts`):
  - Sistema de archivos completo de Windows Server
  - Estructura C:/ con Windows, System32, Users, Program Files
  - Archivos de configuración (hosts, SAM, win.ini)
  - Servicios web (IIS, XAMPP)
  - Logs del sistema (WindowsUpdate.log, HTTPERR)
  - Simulación de registro (system, software)
- **Exportaciones centralizadas**: `index.ts` para importar ambos modelos
- **Reutilización**: Los modelos se pueden usar como templates para diferentes escenarios

### 🔧 Mejoras

#### Refactorización de templates.ts
- **Eliminación de código duplicado**: Función `createLinuxFileSystem` movida a fs-models
- **Importaciones centralizadas**: Uso de modelos desde `src/fs-models/`
- **Compatibilidad**: Re-exportación de funciones para mantener compatibilidad con ejercicios existentes

### 📊 Tests

- **Total:** 432 tests (todos pasando ✓)
- **Incremento:** +35 tests (397 → 432)
- **Tests actualizados**: Tests del Terminal actualizados para nuevo formato de prompt
- **Nuevos tests de fs-models**: 22 tests para fs-windows e index

---

## [2.1.0] - 2026-03-24

### ✨ Nuevas Características

#### Sistema de Autocompletado
- **Autocompletado de comandos**: Presiona Tab para completar comandos (help, ls, cat, cd, nmap, ssh, etc.)
- **Autocompletado de archivos**: Después de un comando, presiona Tab para completar rutas de archivos y directorios
- **Comportamiento inteligente**:
  - Una coincidencia: completa automáticamente
  - Múltiples coincidencias: muestra panel de sugerencias
  - Prefijo común: completa hasta donde las coincidencias son iguales
- **Navegación con Tab**: Presiona Tab múltiples veces para ciclar entre sugerencias
- **Navegación con flechas**: Usa ↑/↓ para navegar entre sugerencias
- **Cierre con Escape**: Presiona Escape para cerrar el panel de sugerencias
- **Panel visual**: Iconos diferenciados para archivos y directorios

#### Sistema de Directorios Linux Realista
- **19 directorios raíz completos**: /bin, /boot, /dev, /etc, /home, /lib, /lib64, /media, /mnt, /opt, /proc, /root, /run, /sbin, /srv, /sys, /tmp, /usr, /var
- **Subdirectorios completos**: /etc/apache2/, /etc/ssh/, /etc/mysql/, /var/log/, /var/www/, /usr/bin/, etc.
- **Archivos del sistema completos**:
  - `/etc/passwd`: 35+ usuarios del sistema (root, daemon, bin, sys, www-data, admin, mysql, postgres, ftp, etc.)
  - `/etc/shadow`: Hashes de contraseñas realistas para todos los usuarios
  - `/etc/hostname`, `/etc/hosts`, `/etc/os-release`, `/etc/issue`, `/etc/motd`
  - `/etc/resolv.conf`, `/etc/fstab`, `/etc/crontab`
  - `/etc/apache2/apache2.conf`, `/etc/apache2/ports.conf`
  - `/etc/ssh/sshd_config`, `/etc/mysql/my.cnf`
  - `/var/log/syslog`, `/var/log/auth.log`, `/var/log/kern.log`
  - `/var/www/html/index.html`, `/var/www/html/.htaccess`
  - `/home/admin/`: `.bashrc`, `.profile`, `.bash_history`, `user.txt`
  - `/root/`: `.bashrc`, `.profile`, `flag.txt`

### 📊 Tests

- **Total:** 397 tests (todos pasando ✓)
- **Incremento:** +57 tests (340+ → 397)
- **Nuevos tests de autocompletado**: 25 tests
- **Nuevos tests de ls**: 8 tests para sistema de directorios

### 📝 Documentación

- **README.md**: Secciones completas sobre sistema de directorios y autocompletado
- **Comentarios en español**: Agregados a archivos de autocompletado, tests y comandos ls

---

## [2.0.0] - 2026-03-24

### 🐛 Fixes Aplicados

#### Fix #1: Resetear MSF State entre escenarios
**Archivo:** `src/App.tsx`
Se asegura que al cambiar de escenario, el estado de Metasploit se limpie correctamente.

#### Fix #2: Limpiar blockingCommand al cambiar escenario
**Archivo:** `src/components/Terminal.tsx:102`
Agregada dependencia `allMachines.length` al useEffect para que se ejecute correctamente al cambiar de escenario.

#### Fix #3: `whoami.ts` - Usar credenciales reales
**Archivo:** `src/commands/builtin/whoami.ts`
El comando ahora respeta el contexto SSH y devuelve el usuario correcto según las credenciales encontradas.

#### Fix #4: `ssh.ts` - Buscar misión SSH dinámicamente
**Archivo:** `src/commands/tools/ssh.ts`
Reemplazado `Math.max` por búsqueda dinámica del step SSH por keywords.

#### Fix #5: `nc.ts` - Validar contexto LFI
**Archivo:** `src/commands/tools/nc.ts`
Implementada función `findListenerMissionId()` para buscar dinámicamente el step de listener.

#### Fix #6: `nmap.ts` y `gobuster.ts` - No mutar discovery_level
**Archivos:** `src/commands/tools/nmap.ts`, `src/commands/tools/gobuster.ts`
Eliminadas mutaciones directas de `discovery_level`. Ahora se actualiza solo vía `completeMission()`.

#### Fix #7: Sincronizar blockingCommand en el store
**Archivo:** `src/store/scenarioStore.ts`
El store maneja correctamente el estado de comandos bloqueantes.

#### Fix #8: `InclusionSite.tsx` - Normalización de paths LFI
**Archivo:** `src/components/fakesites/lfi_lab/InclusionSite.tsx`
Corregida la sanitización para permitir payloads LFI educativos como `../../../../etc/passwd`.

#### Fix #9: `nmap.ts` - Actualizar discovery_level a 2
**Archivo:** `src/commands/tools/nmap.ts:51`
Nmap ahora actualiza `discovery_level` a 2 para que el NetworkMap muestre el SO después del escaneo.

#### Fix #10: Resetear discovery_level al cambiar escenario
**Archivo:** `src/store/scenarioStore.ts:88,128`
Las máquinas se reinician con `discovery_level: 0` al seleccionar un escenario.

#### Fix #11: Terminal no resetea `rceCompletedRef`
**Archivo:** `src/components/FakeBrowser.tsx`
Agregado useEffect para resetear el ref al cambiar de escenario.

#### Fix #12: `whoami` muestra información extra
**Archivo:** `src/commands/builtin/whoami.ts`
Simplificado para mostrar solo el nombre de usuario.

#### Fix #13: Sistema de directorios virtual
**Archivos:** `src/commands/builtin/cd.ts`, `src/commands/builtin/ls.ts`
Implementados comandos `cd` y `ls` con soporte para navegación de directorios.

#### Fix #14: Comando `exit` para salir del laboratorio
**Archivo:** `src/commands/builtin/exit.ts`
El comando `exit` permite salir de la sesión SSH y volver al landing page desde la máquina atacante.

#### Fix #15: Comando `end` para salir del laboratorio
**Archivo:** `src/commands/builtin/end.ts`
Nuevo comando `end` para salir del laboratorio y volver al landing page. El comando `exit` ahora solo cierra sesiones SSH.

#### Fix #16: Credenciales verificadas en topología
**Archivos:** `src/components/Terminal.tsx`, `src/App.tsx`
Al conectarse por SSH exitosamente, las credenciales se marcan como verificadas (verde) en el NetworkMap.

#### Fix #17: Modularización de escenarios (Opción C)
**Archivos:** `src/exercises/templates.ts`, `src/exercises/exercise01.ts`, `src/exercises/exercise02.ts`
Refactorización completa para eliminar código duplicado:
- `templates.ts`: Contiene solo funciones comunes reutilizables
- `exercise01.ts`: Solo datos específicos del escenario WordPress
- `exercise02.ts`: Solo datos específicos del escenario SSH Brute Force
- Cada escenario importa funciones de `templates.ts` vía `buildScenario()`

**Pendiente:** Aplicar la misma modularización a:
- [ ] `exercise03.ts` (EternalBlue)
- [ ] `exercise04.ts` (LFI-RCE)
- [ ] `exercise05.ts` (PrivEsc)


### 🎉 Major Release - Arquitectura Modular y 340+ Tests

Refactorización completa del simulador con arquitectura modular, nuevos comandos, y más del doble de tests.

### ✨ Nuevas Características

#### Comandos Built-in
- **`cd`** - Navegación de directorios virtuales
- **`ls`** - Listado de archivos y directorios
- **`exit`** - Cierre de sesiones SSH
- **`end`** - Salir del laboratorio
- **`cat`** - Lectura de archivos con contexto SSH
- **`whoami`** - Muestra usuario según credenciales SSH
- **`sudo`** - Ejecución con privilegios

#### Sistema de Directorios Virtual
- Sistema de archivos simulado completo
- Navegación con `cd` y `ls`
- Contexto por máquina

#### Modularización de Escenarios
- `templates.ts`: Funciones reutilizables
- Eliminación de código duplicado

#### Metasploit Framework
- Submódulos: msfBase, msfExploits, msfMeterpreter, msfShell
- Comando `msfconsole` completo

### 🐛 17 Bugs Fixeados

Ver [README.md](README.md) para documentación completa de cada fix.

### 📊 Tests

- **Total:** 340+ tests (todos pasando ✓)
- **Incremento:** +145 tests (195+ → 340+)

### 🏗️ Arquitectura

Estructura modular con commands/builtin/, commands/tools/, exercises/, components/, y store/.

---

## [1.0.0] - Versión Inicial

- Simulador de ciberseguridad educativo
- Terminal interactiva
- 2 escenarios (WordPress Lab, SSH Brute Force)
- 195+ tests