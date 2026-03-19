# Testing - ZeroInfra Labs

## Resumen General

**Estado:** ✅ Todos los tests pasando  
**Total de tests:** 166+  
**Archivos de test:** 14  
**Framework:** Vitest + React Testing Library  
**Cobertura:** Componentes React, Comandos Built-in, Herramientas (nmap, ssh, msfconsole, hydra)

---

## 📋 Comandos Para Ejecutar Tests

```bash
# Modo watch (watch mode)
npm test

# Ejecución única
npm run test:run

# Con reporte de cobertura
npm run test:coverage

# UI interactiva
npm run test:ui
```

---

## ✅ Tests Implementados (166+ tests - Todos PASANDO)

### 📱 Componentes React (6 archivos - 59 tests)

#### 1. **FakeBrowser.test.tsx** (8 tests) ✓
- debe renderizar el navegador con la página de inicio de Google
- debe mostrar sugerencias de búsqueda en Google
- debe llamar onClose al hacer clic en el botón cerrar
- debe mostrar el input de URL
- debe mostrar los botones de navegación
- debe mostrar el identificador del navegador
- debe mostrar el footer de Google
- debe mostrar los botones de búsqueda

#### 2. **NetworkMap.test.tsx** (11 tests) ✓
- debe renderizar el nombre del escenario
- debe mostrar todas las máquinas
- debe mostrar "Tu Estación" para la máquina atacante
- debe mostrar "Sesión Activa" para la máquina activa
- debe mostrar IPs para máquinas descubiertas
- debe mostrar ??? para máquinas no descubiertas
- debe llamar onClose al hacer clic en el botón cerrar
- debe mostrar badges de progreso para máquinas descubiertas
- debe mostrar la leyenda de niveles
- debe mostrar credenciales encontradas
- debe mostrar credenciales sin verificar

#### 3. **Terminal.test.tsx** (10 tests) ✓
- debe renderizar el mensaje de bienvenida
- debe mostrar el prompt correcto para la máquina atacante
- debe mostrar el prompt correcto para máquina target
- debe aceptar entrada de texto
- debe limpiar el input al ejecutar un comando
- debe navegar por el historial de comandos con flechas
- debe aplicar el color de terminal personalizado
- debe resetear el historial cuando cambia el scenarioId
- debe mostrar el estado ready cuando no hay comandos ejecutándose
- debe mostrar el header con los botones de control

#### 4. **LandingPage.test.tsx** (14 tests) ✓
- debe renderizar el header con el logo
- debe mostrar la cantidad de labs disponibles
- debe renderizar el título principal
- debe mostrar todas las tarjetas de escenarios
- debe mostrar la dificultad de cada escenario
- debe mostrar la categoría de cada escenario
- debe mostrar el rango de red de cada escenario
- debe mostrar la cantidad de misiones por escenario
- debe llamar onSelect al hacer clic en una tarjeta
- debe mostrar los badges hexadecimales
- debe mostrar las herramientas de cada escenario
- debe mostrar el botón INICIAR en cada tarjeta
- debe renderizar el footer
- debe mostrar el subtítulo correcto

#### 5. **MissionPanel.test.tsx** (8 tests) ✓
- debe renderizar el título del panel
- debe mostrar el progreso correcto
- debe mostrar todas las misiones
- debe llamar onOpenNetworkMap al hacer clic en el botón Ver red
- debe mostrar el hint de la misión activa
- debe mostrar 100% cuando todas las misiones están completadas
- debe mostrar los números de misión formateados
- debe mostrar el texto de progreso

#### 6. **MachineLoader.test.tsx** (8 tests) ✓
- debe renderizar la información de la máquina
- debe iniciar la barra de progreso
- debe avanzar el progreso con el tiempo
- debe completar al 100%
- debe llamar onComplete cuando termina

### 🛠️ Comandos Built-in (4 archivos - 12 tests)

#### 1. **help.test.ts** (2 tests) ✓
- `src/commands/builtin/__tests__/help.test.ts`
- Verifica lista de comandos disponibles

#### 2. **whoami.test.ts** (2 tests) ✓
- `src/commands/builtin/__tests__/whoami.test.ts`
- Diferencia entre atacante y objetivo

#### 3. **ls.test.ts** (4 tests) ✓
- `src/commands/builtin/__tests__/ls.test.ts`
- Listado de archivos y permisos

#### 4. **cat.test.ts** (4 tests) ✓
- `src/commands/builtin/__tests__/cat.test.ts`
- Lectura de archivos y manejo de errores

### 🔧 Comandos de Herramientas (10 archivos - 95+ tests)

#### 1. **nmap.test.ts** (5 tests) ✓
- `src/commands/tools/__tests__/nmap.test.ts`
- Requiere reconocimiento previo
- Escaneo de puertos
- Validación de argumentos

#### 2. **ssh.test.ts** ✓
- `src/commands/tools/__tests__/ssh.test.ts`
- Conexión SSH
- Validación de credenciales

#### 3. **msfconsole.test.ts** ✓
- `src/commands/tools/__tests__/msfconsole.test.ts`
- Comandos de Metasploit Framework
- Orchestrador de comandos MSF

#### 4. **hydra.test.ts** ✓
- `src/commands/tools/__tests__/hydra.test.ts`
- Fuerza bruta SSH
- Validación de wordlist

#### 5. **msfBase.test.ts** ✓
- `src/commands/tools/__tests__/msfCommands/msfBase.test.ts`
- Comandos base MSF

#### 6. **msfExploits.test.ts** (11 tests) ✓
- `src/commands/tools/__tests__/msfCommands/msfExploits.test.ts`
- Exploits básicos
- Verificación de vulnerabilidades

#### 7. **msfHelpers.test.ts** ✓
- `src/commands/tools/__tests__/msfCommands/msfHelpers.test.ts`
- Funciones auxiliares MSF

#### 8. **msfMeterpreter.test.ts** ✓
- `src/commands/tools/__tests__/msfCommands/msfMeterpreter.test.ts`
- Sesiones Meterpreter

#### 9. **msfShell.test.ts** ✓
- `src/commands/tools/__tests__/msfCommands/msfShell.test.ts`
- Shell de Metasploit

---

## ❌ Tests Que Faltan Implementar

### 🔨 Comandos sin tests
- **gobuster.test.ts** - Enumeración de directorios web
- **arp-scan.test.ts** - Escaneo ARP de red

### 🎯 Stores/State Management
- **scenarioStore.test.ts** - Tests para Zustand store
  - Selector de escenario
  - Actualización de misiones
  - Persistencia de estado

### 🏗️ Tests de Componentes Faltantes
- **App.test.tsx** - Tests de integración para el componente principal
- **MachineLoader.test.tsx** - Tests de estado React con `act()`

### 📦 Tests de Utilidades
- **utils/network.test.ts** - Tests para utilidades de red
- **exercises/{test.ts** - Tests para configuración de ejercicios

### 🔌 Tests End-to-End (E2E)
- Pruebas completas de flujo de usuario
- Integración entre componentes

---

## 🔧 Configuración de Tests

### Archivos de Configuración

**vitest.config.ts**
```typescript
test: {
  environment: 'jsdom',
  globals: true,
  include: ['src/**/*.{test,spec}.{ts,tsx}'],
  setupFiles: ['./src/test/setup.ts'],
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html'],
  },
}
```

**src/test/setup.ts**
- Mock de `window.matchMedia`
- Mock de `window.history`
- Mock de `ResizeObserver`
- Limpieza de localStorage entre tests
- Reset de Zustand store entre tests

---

## 📊 Patrones de Testing Encontrados

### 1. Tests de Componentes React
```typescript
it('debe renderizar correctamente', () => {
  render(<Component prop={value} />);
  expect(screen.getByText('text')).toBeInTheDocument();
});
```

### 2. Tests de Comandos
```typescript
it('debe ejecutar correctamente', () => {
  const result = cmd_nmap.execute([args], { machine } as any);
  expect(result.output).toContain('expected');
});
```

### 3. Tests de llamadas a callbacks
```typescript
it('debe llamar callback', () => {
  const onClose = vi.fn();
  render(<Component onClose={onClose} />);
  fireEvent.click(screen.getByText('Close'));
  expect(onClose).toHaveBeenCalled();
});
```

---

## 🎯 Próximos Pasos Recomendados

1. **Completar comandos faltantes**
   - Agregar tests para `gobuster` y `arp-scan`
   - ~10-15 tests adicionales

2. **Tests de Store**
   - Tests para Zustand (scenarioStore)
   - ~8-10 tests

3. **Tests de Integración**
   - E2E con Playwright
   - Flujos de usuario completos

4. **Cobertura**
   - Ejecutar `npm run test:coverage` regularmente
   - Apuntar a >80% de cobertura

---

**Última actualización:** 17 de Marzo, 2026  
**Versión:** 2.0.0  
**Framework:** Vitest 4.0.18 + React Testing Library
