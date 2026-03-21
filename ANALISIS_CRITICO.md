# Análisis Crítico Senior Review — CyberOps v2 (ZeroInfra Labs)

**Fecha:** 20 de Marzo, 2026
**Reviewer:** Senior Software Engineer
**Proyecto:** Simulador de Pentesting Educativo

---

## 🔴 ERRORES REALES (Bugs concretos)

### 1. ~~Mutación directa del estado en `gobuster.ts`~~ ✅ RESUELTO
**Archivo:** `src/commands/tools/gobuster.ts:59`
```typescript
// BUG: Mutación directa del objeto machine
target.discovery_level = Math.max(target.discovery_level || 0, 3);
```
**Problema:** Se muta directamente `target.discovery_level` dentro del comando. Esto rompe el flujo unidireccional de datos de React/Zustand. El estado debería actualizarse SOLO a través de `completeMission()` en el store. Los otros comandos (nmap, hydra, ssh) tienen comentarios `// No mutar directamente el estado aquí` pero gobuster NO.

**Impacto:** Si el usuario ejecuta gobuster múltiples veces o en diferente orden, el discovery_level puede quedar inconsistente con las misiones completadas.

**Fix aplicado:** Se eliminó la línea de mutación directa y se agregó el comentario `// No mutar directamente el estado aquí; el discovery_level se actualiza en completeMission` para mantener consistencia con los otros comandos. Ahora `completeMission()` en el store de Zustand es el único responsable de actualizar el `discovery_level`.

**Fecha de resolución:** 20 de Marzo, 2026

---

### 2. `whoami.ts` no respeta el contexto de SSH
**Archivo:** `src/commands/builtin/whoami.ts:14-22`
```typescript
// Para máquinas objetivo, intentar obtener el usuario desde las credenciales encontradas
let currentUser = 'admin'; // Valor por defecto para máquinas objetivo
```
**Problema:** Cuando el usuario está en una sesión SSH (después de ejecutar `ssh root@ip password`), el comando `whoami` debería devolver el usuario con el que se conectó (ej: `root`), pero devuelve `'admin'` por defecto. El código intenta leer `found_credentials` pero ese campo se llena DESPUÉS del SSH exitoso, creando una race condition.

**Impacto:** En el escenario 05 (privesc), después de SSH como `developer`, `whoami` puede mostrar `admin` en lugar de `developer`.

**Fix:** El comando debería usar el usuario de las credenciales SSH del puerto, no de `found_credentials`.

---

### 3. ~~`nc.ts` completa misión 4 hardcodeada~~ ✅ RESUELTO
**Archivo:** `src/commands/tools/nc.ts:73`
```typescript
completedMissionId: 4, // Marca el step 4 "Setup Listener" como completado
```
**Problema:** La misión 4 está hardcodeada. Si el escenario LFI-RCE cambia el orden de los steps o se usa nc en otro contexto, completará la misión 4 incorrectamente.

**Impacto:** Ejecutar `nc -nlvp 4444` en CUALQUIER escenario completará la misión 4, incluso si no es relevante.

**Fix aplicado:** Se reemplazó el hardcode por la función `findListenerMissionId(context)` que busca dinámicamente el step cuyo `task` o `text` contenga keywords como `"listener"`, `"setup listener"`, `"nc -nlvp"`, etc., y solo retorna el id si ese step coincide con la `currentMissionId` activa. Si nc se ejecuta fuera del contexto LFI (sin un step de listener activo), `completedMissionId` queda `undefined`. Se agregó test de regresión en `happyPath.test.ts` para verificar este comportamiento.

**Fecha de resolución:** 20 de Marzo, 2026

---

### 4. ~~`ssh.ts` completa misión hardcodeada con `Math.max`~~ ✅ RESUELTO
**Archivo:** `src/commands/tools/ssh.ts:41-43`
```typescript
const finalMissionId = target.learning_steps.length > 0
  ? Math.max(...target.learning_steps.map(s => s.id))
  : currentMissionId;
```
**Problema:** Asume que la última misión siempre es SSH. En el escenario 05 (privesc), el último step es "Capturar la flag de root" (step 6), no SSH (step 3). Esto significa que SSH completará la misión 6 incorrectamente.

**Impacto:** En el escenario 05, ejecutar SSH saltará directamente a la misión final sin pasar por sudo -l ni la escalada.

**Fix aplicado:** Se reemplazó `Math.max` por la función `findSshMissionId(machine, fallback)` que busca en `learning_steps` el step cuyo `task` o `text` contenga keywords como `"ssh"`, `"acceso ssh"`, `"conexión ssh"`, etc. Si no encuentra ninguno, usa `currentMissionId` como fallback. El test del Paso 3 del Scenario 05 en `happyPath.test.ts` ahora verifica explícitamente que `completedMissionId` sea 3 y no 6.

**Fecha de resolución:** 20 de Marzo, 2026

---

### 5. Terminal no resetea `rceCompletedRef` al cambiar de escenario
**Archivo:** `src/components/Terminal.tsx:87`
```typescript
const rceCompletedRef = useRef(false);
```
**Problema:** Este ref se usa para evitar múltiples llamadas a `onMissionComplete(6)`, pero nunca se resetea. Si el usuario cambia de escenario y vuelve al LFI, el ref sigue en `true` y la misión 6 no se completará.

**Impacto:** Bug intermitente que aparece al cambiar entre escenarios.

**Fix:** Resetear `rceCompletedRef.current = false` en el `useEffect` que resetea el historial (línea ~100).

---

### 6. `InclusionSIte.tsx` normaliza paths de forma incorrecta
**Archivo:** `src/components/fakesites/lfi_lab/InclusionSIte.tsx:36-42`
```typescript
const normalized = decodeURIComponent(p)
  .replace(/\.\.\//g, '') // Remover ../
  .replace(/\.\./g, '')   // Remover ..
  .replace(/^\/+/, '');   // Remover barras iniciales
```
**Problema:** La sanitización es INSEGURA para un simulador de LFI. Remueve `../` pero no previene payloads como `....//` o `%2e%2e%2f`. Además, si el objetivo es enseñar LFI, ¿por qué sanitizar?

**Impacto:** Confusión educativa. El estudiante puede pensar que ciertos payloads no funcionan cuando en realidad el simulador los filtra.

**Fix:** O remover la sanitización completamente (es un simulador controlado) o documentar claramente qué payloads están soportados.
         decicion: remover sanitizacion
---

### 7. `FakeBrowser.tsx` usa `useEffect` con dependencias incompletas
**Archivo:** `src/components/FakeBrowser.tsx:89-103`
```typescript
useEffect(() => {
  if (!lfiMachine || !browserCurrentUrl.includes(lfiMachine.machine_info.ip)) return;
  if (rceCompletedRef.current) return;
  // ...
}, [browserCurrentUrl, lfiMachine, onMissionComplete, onVerifyCredentials]);
```
**Problema:** `lfiMachine` se calcula con `allMachines.find()` en cada render, creando una nueva referencia cada vez. Esto causa que el useEffect se ejecute innecesariamente.

**Impacto:** Re-renders excesivos y posibles loops infinitos en ciertos escenarios.

**Fix:** Usar `useMemo` para `lfiMachine` o buscar por `lfiMachine?.id` en las dependencias.

---

## 🟠 MALAS PRÁCTICAS CONCRETAS

### 8. Estado global mutable fuera de Zustand
**Archivo:** `src/commands/index.ts:18`
```typescript
let _msfState: MsfState | null = null;
```
**Problema:** Se usa una variable module-level para el estado de MSF, paralela al store de Zustand. Esto crea dos fuentes de verdad: `_msfState` (module scope) y `msfState` (Zustand). La sincronización es manual y propensa a errores.

**Impacto:** Si hay un bug en la sincronización, el estado puede divergir entre la terminal y el store.

**Fix:** Migrar todo el estado de MSF a Zustand y eliminar `_msfState`.

---

### 9. `any` casts masivos en tests
**Archivos:** Todos los `__tests__/*.test.ts`
```typescript
const result = cmd_nmap.execute(['-sV', '192.168.1.10'], {
  allMachines: machines,
  currentMissionId: 1
} as any);
```
**Problema:** Cada test usa `as any` para el contexto, lo que elimina el type safety. Si `CommandContext` cambia, los tests no fallarán.

**Impacto:** Refactorizaciones futuras romperán silenciosamente los tests.

**Fix:** Crear un helper `createMockContext(partial?: Partial<CommandContext>): CommandContext` que retorne un objeto tipado.

---

### 10. Duplicación de lógica de búsqueda de misiones
**Archivos:** `nmap.ts`, `hydra.ts`, `gobuster.ts`, `arp-scan.ts`
```typescript
// Cada comando repite este patrón:
let missionId: number | undefined;
for (const m of allMachines) {
  const step = m.learning_steps.find(s =>
    s.task.toLowerCase().includes('escaneo') || s.task.toLowerCase().includes('puerto')
  );
  if (step) { missionId = step.id; break; }
}
```
**Problema:** Esta lógica está duplicada 4+ veces con variaciones mínimas. Es difícil de mantener y propenso a inconsistencias.

**Impacto:** Si se cambia la estructura de `learning_steps`, hay que actualizar 4+ archivos.

**Fix:** Extraer a una función helper `findMissionIdByKeywords(allMachines, keywords[])`.

---

### 11. `MachineLoader.tsx` ignora la prop `onComplete`
**Archivo:** `src/components/MachineLoader.tsx:28`
```typescript
setTimeout(onComplete, 300);
```
**Problema:** El componente recibe `onComplete` como prop pero `App.tsx` siempre pasa `() => {}` (función vacía). La prop nunca tiene efecto real.

**Impacto:** Código muerto que confunde a futuros desarrolladores.

**Fix:** O implementar la lógica de onComplete o remover la prop.
    decision: remover

---

### 12. `assignDynamicIPs` en `network.ts` nunca se usa
**Archivo:** `src/utils/network.ts:35-68`
```typescript
export function assignDynamicIPs(scenarioId: string, machines: Machine[]): Machine[] {
```
**Problema:** Esta función existe pero nunca se llama. Todos los escenarios usan `assignDHCP` (la función legacy). La función `generateRandomIP` tampoco se usa.

**Impacto:** Código muerto que aumenta la complejidad del proyecto sin beneficio.

**Fix:** Eliminar las funciones no usadas o integrarlas en el flujo.
        decision: eliminar

---

### 13. `resetAttackerCounter` en `templates.ts` nunca se llama
**Archivo:** `src/exercises/templates.ts:16-18`
```typescript
export function resetAttackerCounter() {
  attackerCount = 0;
}
```
**Problema:** Esta función se exporta pero nunca se invoca. Si se crean múltiples escenarios, el contador `attackerCount` puede dar MACs duplicadas.

**Impacto:** Potencial colisión de MACs entre escenarios.

**Fix:** Llamar `resetAttackerCounter()` al inicio de `buildScenario()` o al cambiar de escenario.

---

### 14. Hardcoded strings en español e inglés mezcladas
**Archivos:** Múltiples
```typescript
// español:
output: 'Uso: nmap -sV <IP>\nEjemplo: nmap -sV <IP>'
// inglés:
output: 'Command not found: ${cmdName}'
// msfconsole (inglés):
output: '[-] Unknown command: ${line}'
```
**Problema:** Las cadenas están mezcladas sin sistema de i18n. Algunos errores están en español, otros en inglés.

**Impacto:** Experiencia de usuario inconsistente.

**Fix:** Implementar un sistema de i18n o al menos estandarizar a un idioma.

---

## 🟡 PROBLEMAS DE SEGURIDAD (En el contexto del simulador)

### 15. Credenciales hardcodeadas en el código fuente
**Archivos:** `exercise01.ts`, `exercise02.ts`, `exercise05.ts`, `ConfigBak.tsx`
```typescript
credentials: { user: 'admin', pass: 'P@ssw0rd123!' },
credentials: { user: 'root', pass: 'toor' },
credentials: { user: 'developer', pass: 'dev2024' },
```
**Problema:** Aunque es un simulador educativo, las credenciales están hardcodeadas en el código fuente. Si alguien copia este patrón en código real, será un problema de seguridad.

**Impacto:** Bajo en simulador, pero establece un mal precedente pedagógico.

**Fix:** Mover credenciales a un archivo de configuración separado o variables de entorno, y agregar un comentario educativo sobre por qué esto es malo en producción.

---

### 16. `sudo.ts` acepta cualquier comando si hay ALL en sudoers
**Archivo:** `src/commands/builtin/sudo.ts:107-112`
```typescript
const hasPermission = rules.some(r =>
  r.includes('ALL') || r.toLowerCase().includes(requestedCmd.toLowerCase())
);
```
**Problema:** Si el sudoers contiene `ALL`, CUALQUIER comando se ejecutará como root. Esto es correcto para el simulador, pero el escenario 05 solo debería permitir `vim`.

**Impacto:** En el escenario 05, el usuario puede ejecutar `sudo cat /root/root.txt` directamente sin necesidad de escalar via vim.

**Fix:** Para el escenario 05, verificar que el comando solicitado coincida EXACTAMENTE con el permitido en NOPASSWD.

---

### 17. `hashcat.ts` siempre "crackea" el mismo hash
**Archivo:** `src/commands/builtin/hashcat.ts:28`
```typescript
const demoHash = '5d41402abc4b2a76b9719d911017c592';
```
**Problema:** El hash demo es siempre el mismo (MD5 de "hello"), sin importar qué hash se pase como argumento. Esto puede confundir al estudiante sobre cómo funciona realmente hashcat.

**Impacto:** Educación incorrecta sobre el funcionamiento de hashcat.

**Fix:** Al menos validar que el hash pasado como argumento coincida con el demo, o mostrar un mensaje explicando que es una simulación.

---

### 18. No hay rate limiting ni delays realistas en fuerza bruta
**Archivo:** `src/commands/tools/hydra.ts`
**Problema:** Hydra "encuentra" la contraseña instantáneamente. En un entorno real, fuerza bruta toma tiempo. La falta de delay realista puede crear expectativas incorrectas.

**Impacto:** Los estudiantes pueden subestimar la importancia de contraseñas fuertes.

**Fix:** Agregar un delay progresivo o mostrar un contador de intentos simulados.

---

## 🔵 PARTES INCOMPLETAS O MAL DISEÑADAS

### 19. Sistema de directorios inconsistente entre máquinas
**Problema:** El sistema de archivos se crea en `templates.ts` con `createLinuxFileSystem()`, pero:
- No hay soporte para `ls /` (listar directorio raíz)
- No hay soporte para `ls /etc` (listar directorio específico)
- Los archivos se buscan por path exacto, no por navegación de directorios
- `cat /etc/passwd` funciona pero `ls /etc` no muestra passwd

**Impacto:** El estudiante no puede explorar el sistema de archivos de forma realista.

**Fix:** Implementar un árbol de directorios virtual o al menos agregar entradas de directorio al sistema de archivos.
         decision: implemetar un arbol de directorios virtual
---

### 20. `nc` listener no valida que el puerto coincida con el payload
**Archivo:** `src/commands/tools/nc.ts:74`
```typescript
listeningPort: parseInt(port), // Guardar puerto para validación de payload
```
**Problema:** El puerto se guarda en el store pero NUNCA se valida contra el payload. El estudiante puede hacer `nc -nlvp 4444` y luego subir un payload con puerto 5555, y la misión se completará igual.

**Impacto:** El estudiante no aprende la importancia de que los puertos coincidan.

**Fix:** Validar que el puerto del payload coincida con `listeningPort` antes de completar la misión 6.

---

### 21. No hay soporte para `cd` (cambio de directorio)
**Problema:** El comando `cd` no existe. El estudiante no puede navegar por el sistema de archivos. Esto es una limitación significativa para un simulador de terminal Linux.

**Impacto:** La experiencia no es fiel a una terminal real.

**Implementación sugerida:**
```typescript
// commands/builtin/cd.ts
export const cmd_cd = {
  name: 'cd',
  execute: (args: string[], { machine }: CommandContext): CommandResponse => {
    // Mantener un currentDir en el contexto o store
    // Validar que el directorio existe en machine.files
    // Actualizar el prompt
  }
};
```

---

### 22. `gobuster` no soporta wordlists reales
**Archivo:** `src/commands/tools/gobuster.ts:14`
```typescript
if (!wl || !wl.includes('rockyou.txt')) {
  return { output: `Error: wordlist "${wl}" no válida...`, isError: true };
}
```
**Problema:** Solo acepta `rockyou.txt`. No hay soporte para otras wordlists comunes como `common.txt`, `directory-list-2.3-medium.txt`, etc.

**Impacto:** Limita la flexibilidad del simulador.

**Fix:** Soportar al menos 2-3 wordlists comunes o permitir cualquier archivo.
    desicion: crear las wordlists common.txt y alguna otra de seclist que sean realies, que se puedan leer con cat y que esten en la carpeta corespondiente de /usr/share/wordlist

---

### 23. No hay persistencia del progreso entre sesiones del navegador
**Archivo:** `src/store/scenarioStore.ts:196-218`
```typescript
partialize: (state) => ({
  // ...
  msfState: state.msfState?.active ? state.msfState : null,
}),
```
**Problema:** El estado de MSF se persiste en localStorage, pero si el usuario cierra el navegador y vuelve, el estado puede estar corrupto (ej: `sessionOpen: true` pero sin contexto de máquina).

**Impacto:** El usuario puede encontrarse en un estado inválido al volver.

**Fix:** Validar el estado restaurado al cargar o no persistir estados transitorios como `sessionOpen`.

---

### 24. `FakeBrowser` no soporta navegación por teclado
**Problema:** No hay soporte para Ctrl+L (limpiar URL), Ctrl+R (recargar), o atajos de teclado del navegador. La experiencia no es realista.

**Impacto:** Menor inmersión en el simulador.

---

### 25. No hay sistema de hints o ayuda contextual
**Problema:** Si el estudiante se queda trabado, no hay forma de obtener ayuda más que leer las misiones. No hay sistema de hints progresivos.

**Impacto:** Estudiantes principiantes pueden frustrarse.

**Implementación sugerida:** Agregar un comando `hint` que muestre pistas contextuales basadas en la misión activa.

---

## 🟢 MEJORAS ESPECÍFICAS PROPUESTAS

### Mejora 1: Helper para contexto mock en tests
```typescript
// src/test/helpers.ts
export function createMockContext(overrides?: Partial<CommandContext>): CommandContext {
  return {
    machine: createMockMachine('attacker-01', '10.0.0.1', 4),
    allMachines: [],
    currentMissionId: 1,
    ...overrides,
  };
}

export function createMockMachine(
  id: string, 
  ip: string, 
  discoveryLevel: number = 0
): Machine {
  return {
    id,
    machine_info: { hostname: id, ip, mac: '00:00:00:00:00:00', os: 'Linux', status: 'up', type: 'server' },
    discovery_level: discoveryLevel,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files: [],
  };
}
```

### Mejora 2: Función helper para búsqueda de misiones
```typescript
// src/commands/helpers.ts
export function findMissionIdByKeywords(
  allMachines: Machine[], 
  keywords: string[]
): number | undefined {
  for (const m of allMachines) {
    const step = m.learning_steps.find(s =>
      keywords.some(k => s.task.toLowerCase().includes(k.toLowerCase()))
    );
    if (step) return step.id;
  }
  return undefined;
}

// Uso en nmap.ts:
const missionId = findMissionIdByKeywords(allMachines, ['escaneo', 'puerto', 'nmap']);
```

### Mejora 3: Validación de puerto en LFI-RCE
```typescript
// En FakeBrowser.tsx, antes de completar misión 6:
const listeningPort = useScenarioStore(state => state.listeningPort);
// ...
if (fullPath.includes('?page=uploads/') && fullPath.endsWith('.php')) {
  if (listeningPort && listeningPort === 4444) { // Validar puerto
    rceCompletedRef.current = true;
    onMissionComplete(6);
  } else {
    // Mostrar error: el puerto del listener no coincide
  }
}
```

### Mejora 4: Comando `exit` para salir del laboratorio
```typescript
// src/commands/builtin/exit.ts
export const cmd_exit = {
  name: 'exit',
  execute: (_: string[], { machine }: CommandContext): CommandResponse => {
    if (machine.id === 'attacker-01') {
      return { output: 'EXIT_TO_LANDING' };
    }
    return { output: 'logout' };
  }
};

// En Terminal.tsx, detectar 'EXIT_TO_LANDING' y llamar goHome()
```

### Mejora 5: Sistema de directorios virtual
```typescript
// src/utils/filesystem.ts
interface VirtualFS {
  [path: string]: { type: 'file' | 'dir'; content?: string; children?: string[] };
}

export function buildVirtualFS(files: FileEntry[]): VirtualFS {
  const fs: VirtualFS = { '/': { type: 'dir', children: [] } };
  // Construir árbol de directorios desde los archivos
  // ...
  return fs;
}

export function listDir(fs: VirtualFS, path: string): string[] {
  return fs[path]?.children || [];
}
```

---

## 📊 RESUMEN EJECUTIVO

| Categoría | Cantidad | Severidad |
|-----------|----------|-----------|
| Errores reales (bugs) | 7 (5 pendientes, 2 resueltos ✅) | 🔴 Alto |
| Malas prácticas | 7 | 🟠 Medio |
| Problemas de seguridad | 4 | 🟡 Bajo-Medio |
| Partes incompletas | 7 | 🔵 Medio |
| Mejoras propuestas | 5 | 🟢 Oportunidad |

### Bugs resueltos:
- ✅ Bug #1: Mutación directa en `gobuster.ts`
- ✅ Bug #3: `nc.ts` — `completedMissionId: 4` hardcodeado → búsqueda dinámica por keyword
- ✅ Bug #4: `ssh.ts` — `Math.max` → `findSshMissionId()` por keyword

### Prioridad de fixes pendientes:
1. **Inmediato:** ~~Bug #1 (mutación en gobuster)~~ ✅, ~~Bug #4 (ssh misión hardcodeada)~~ ✅
2. **Próximo sprint:** Bug #2 (whoami contexto SSH), ~~Bug #3 (nc misión hardcodeada)~~ ✅, Bug #6 (sanitización LFI), Bug #5 (rceCompletedRef no se resetea)
3. **Backlog:** Mejoras 1-5, sistema de directorios, comando exit

### Lo que está bien:
- ✅ Arquitectura modular limpia (comandos separados)
- ✅ Uso de Zustand para state management
- ✅ Templates reutilizables para escenarios
- ✅ Tests unitarios con buena cobertura
- ✅ Simulación realista de Metasploit
- ✅ UI moderna con Tailwind CSS
- ✅ Documentación completa (README, TESTING, SECURITY)

### Lo que necesita atención urgente:
- ❌ Mutación de estado fuera del store
- ❌ Misiones hardcodeadas que rompen con nuevos escenarios
- ❌ Falta de validación de contexto (SSH, nc listener)
- ❌ Código muerto (assignDynamicIPs, resetAttackerCounter)