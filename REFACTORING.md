# Resumen de Refactorización - CyberOps v2

## Cambios Realizados

### 1. Reorganización de Comandos

**Antes:**
```
src/commands/
├── index.ts
├── arp-scan.ts
├── nmap.ts
├── gobuster.ts
├── hydra.ts
├── ssh.ts
├── msfconsole.ts
├── metasploit.ts
└── types.ts
```

**Después:**
```
src/commands/
├── index.ts              # Registro central importa desde subcarpetas
├── builtin/              # Comandos del sistema
│   ├── index.ts
│   ├── help.ts
│   ├── clear.ts
│   ├── whoami.ts
│   ├── ifconfig.ts
│   ├── ls.ts
│   ├── cat.ts
│   └── hashcat.ts
└── tools/                # Herramientas de pentesting
    ├── index.ts
    ├── arp-scan.ts
    ├── nmap.ts
    ├── gobuster.ts
    ├── hydra.ts
    ├── ssh.ts
    └── msfconsole.ts
```

**Beneficios:**
- Separación clara de responsabilidades
- Más fácil agregar nuevos comandos
- Mejor organización para testing
- Cada comando es independiente y testeable

---

### 2. Implementación de Zustand (State Manager)

**Problema anterior:** App.tsx tenía ~400 líneas con 15+ estados useState.

**Solución:** Store centralizado en `src/store/scenarioStore.ts`

**Estado gestionado por Zustand:**
- `view`: landing | workspace
- `currentScenario`: Escenario activo
- `machines`: Máquinas del escenario
- `missions`: Misiones y su estado
- `activeMachineId`: Máquina activa
- `activeApp`: terminal | browser
- `notification`: Sistema de notificaciones
- `termColor`: Color del terminal

**Beneficios:**
- App.tsx reducido a ~250 líneas
- No más prop drilling
- Estado accesible desde cualquier componente
- Acciones centralizadas (completeMission, findCredentials, etc.)
- Persistencia de estado entre renders

---

### 3. Templates para Escenarios

**Problema anterior:** Cada ejercicio repetía la configuración del atacante y tenía código duplicado.

**Solución:** `src/exercises/templates.ts` con:

- `createAttackerMachine()`: Crea máquina Kali automáticamente
- `buildScenario()`: Builder que ensambla escenarios completos
- `COMMON_PORTS`: Plantillas de puertos comunes
- `SCENARIO_TEMPLATES`: Escenarios predefinidos (WordPress, SSH Brute, EternalBlue)

**Ejemplo de uso:**
```typescript
// Antes: ~70 líneas de código
// Después: ~15 líneas
const config = SCENARIO_TEMPLATES.wordpress({
  id: 'scenario-01',
  name: 'WordPress Lab',
  networkRange: '192.168.1.0/24',
  flags: { user: 'THM{...}', root: 'THM{...}' },
  credentials: { user: 'admin', pass: 'P@ssw0rd123!' },
});
export const scenario_01: Scenario = buildScenario(config);
```

---

### 4. Tests Unitarios con Vitest

**Configuración:** `vitest.config.ts` con jsdom para testing de React.

**Scripts agregados:**
- `npm test`: Modo watch
- `npm run test:run`: Ejecución única
- `npm run test:coverage`: Con cobertura

**Tests creados (25 tests en total):**

**Comandos Built-in (9 tests):**
- `help.test.ts`: Verifica lista de comandos
- `whoami.test.ts`: Diferencia entre atacante y objetivo
- `ls.test.ts`: Listado de archivos y permisos
- `cat.test.ts`: Lectura de archivos y manejo de errores

**Comandos de Herramientas (16 tests):**
- `nmap.test.ts`: Requiere reconocimiento previo, escaneo de puertos
- `hydra.test.ts`: Validación de wordlist, fuerza bruta SSH
- `ssh.test.ts`: Requiere credenciales, conexión, misiones

**Ejemplo de test:**
```typescript
it('debe requerir reconocimiento previo', () => {
  const machines = [createMockMachine('target-01', '192.168.1.10', 0)];
  const result = cmd_nmap.execute(['-sV', '192.168.1.10'], {
    allMachines: machines,
    currentMissionId: 1
  } as any);

  expect(result.isError).toBe(true);
  expect(result.output).toContain('Primero realiza el reconocimiento');
});
```

---

### 5. Documentación de Seguridad

**Archivo creado:** `SECURITY.md`

**Contenido:**
- Explicación de hashes ficticios (MD5 de "hello")
- Por qué no usamos hashes reales
- Disclaimer legal
- Mejores prácticas de seguridad
- Referencias a frameworks (OWASP, NIST)

**HashCat mejorado:**
- Ahora muestra advertencia educativa
- Incluye nota sobre simulación
- Usa hash demostrativo `5d41402abc4b2a76b9719d911017c592`

---

## Estadísticas

| Métrica | Antes | Después | Cambio |
|---------|-------|---------|--------|
| Líneas en App.tsx | ~400 | ~250 | -37% |
| Archivos de comandos | 9 | 15 (+organizados) | +6 |
| Tests | 0 | 25 | +25 |
| Scripts npm | 3 | 6 | +3 |
| Documentación | 1 | 3 | +2 |

---

## Próximos Pasos Sugeridos

1. **Agregar más tests:**
   - Tests de integración para componentes React
   - Tests para FakeBrowser y MissionPanel
   - Tests end-to-end con Playwright

2. **Mejorar cobertura:**
   - Agregar tests para gobuster, arp-scan, msfconsole
   - Tests para el store de Zustand

3. **Internacionalización (i18n):**
   - Extraer strings a archivos de traducción
   - Soporte para inglés/español

4. **Modo Tutorial:**
   - Sistema de hints contextual
   - Explicaciones de por qué cada comando es importante

---

## Comandos Útiles

```bash
# Desarrollo
npm run dev

# Tests
npm test              # Modo watch
npm run test:run      # Ejecución única
npm run test:coverage # Con reporte de cobertura

# Build
npm run build
npm run preview
```

---

*Generado el: 2026-03-11*
*Versión: 2.0.0*
