# Testing Strategy

## Resumen

**Framework:** Vitest + React Testing Library + jsdom  
**Total Tests:** 800+  
**Cobertura:** Componentes, Comandos, Hooks, Utilidades

## Comandos

```bash
npm test                 # Watch mode (re-ejecuta al guardar)
npm run test:run         # Ejecución única
npm run test:coverage    # Reporte de cobertura
npm run test:ui          # UI interactiva
```

## Estructura de Tests

```
src/
├── commands/__tests__/          # Tests de comandos
│   ├── happyPath-scenario01.test.ts
│   ├── happyPath-scenario02.test.ts
│   └── happyPathHelpers.ts
├── components/__tests__/          # Tests de React
│   ├── Terminal.test.tsx
│   ├── FakeBrowser.test.tsx
│   └── fixtures.ts
├── store/__tests__/               # Tests de store
│   └── selectors.test.ts
└── utils/__tests__/               # Tests de utilidades
    ├── donationMessage.test.ts
    ├── networkAlert.test.ts
    └── autocomplete.test.ts
```

## Tipos de Tests

### 1. Tests de Comandos (Happy Path)
Validan flujos completos de laboratorios:
- Escenario 1: WordPress compromise
- Escenario 2: SSH brute force
- Escenario 3: EternalBlue exploit
- Escenario 4: LFI to RCE
- Escenario 5: FTP + Privilege escalation

### 2. Tests de Componentes React
- Renderizado correcto
- Interacciones de usuario
- Callbacks y eventos
- Integración con store

### 3. Tests de Utilidades
- `labValidator.ts` — Validación de misiones
- `autocomplete.ts` — Sistema de autocompletado
- `networkAlert.ts` — Detección de cambios
- `analytics.ts` — Event tracking

## Convenciones

### Nomenclatura
```typescript
// Descripciones en español
describe('Terminal', () => {
  it('debe renderizar el mensaje de bienvenida', () => {
    // ...
  });
  
  it('debe limpiar el input al ejecutar un comando', () => {
    // ...
  });
});
```

### Mocks
```typescript
// Mock de store
vi.mock('../../store/scenarioStore', () => ({
  useScenarioStore: Object.assign(
    vi.fn((selector) => selector(mockState)),
    { getState: vi.fn(() => mockState) }
  )
}));
```

### Helpers
Usar `src/commands/__tests__/happyPathHelpers.ts` para:
- Crear máquinas mock
- Evolucionar estado
- Verificar resultados

## Cobertura Objetivo

| Módulo | Cobertura |
|--------|-----------|
| Commands | > 80% |
| Components | > 60% |
| Utils | > 70% |
| Store | > 85% |
| Labs | 100% (definición) |

## Debugging

```bash
# Ejecutar test específico
npm test -- src/commands/__tests__/happyPath-scenario01.test.ts

# Ejecutar por nombre
npm test -- -t "debe autenticar"

# Verbose
npm test -- --reporter=verbose
```

## CI/CD

Tests ejecutan automáticamente en cada PR:
```bash
npm run test:run
```

Fallo = bloqueo de merge.
