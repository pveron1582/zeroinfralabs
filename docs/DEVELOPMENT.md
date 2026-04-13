# Guía de Desarrollo

## Instalación y Setup

```bash
# Clonar el repositorio
git clone <repo>
cd cyberops-v2

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Abrir en navegador
# http://localhost:5173
```

## Comandos Disponibles

### Desarrollo
```bash
npm run dev              # Inicia servidor con hot-reload
```

### Testing
```bash
npm test                 # Modo watch (re-ejecuta tests al guardar)
npm run test:run         # Ejecución única de tests
npm run test:coverage    # Reporte de cobertura
npm run test:ui          # UI interactiva de Vitest
```

### Build
```bash
npm run build            # Genera bundle optimizado
npm run preview          # Preview del build
```

## Estructura de Directorios

```
src/
├── commands/            # Comandos de terminal
│   ├── builtin/       # Comandos básicos (ls, cat, cd, sudo)
│   ├── tools/         # Herramientas (nmap, hydra, ssh, etc.)
│   └── index.ts       # Registro central
├── components/          # Componentes React
│   ├── Terminal.tsx   # Terminal principal
│   ├── FakeBrowser.tsx # Navegador simulado
│   └── __tests__/     # Tests de componentes
├── frameworks/
│   └── shells/        # Sesiones interactivas (SSH, FTP, NC)
├── laboratorios/        # Definición de escenarios
├── store/             # Zustand state management
└── utils/             # Utilidades
```

## Agregar un Nuevo Comando

1. Crear archivo en `src/commands/builtin/` (sistema) o `src/commands/tools/` (pentesting)
2. Exportar objeto con `name` y `execute()`
3. Registrar en `src/commands/builtin/index.ts` o `src/commands/tools/index.ts`
4. Agregar tests en `src/commands/__tests__/` o subcarpeta `__tests__/`

Ejemplo:
```typescript
export const cmd_mi_comando = {
  name: 'mi-comando',
  execute: (args: string[], context: CommandContext): CommandResponse => {
    return { output: '¡Funciona!' };
  }
};
```

## Agregar un Nuevo Laboratorio

1. Crear `src/laboratorios/laboratorioXX.ts`
2. Usar `buildScenario()` de `templates.ts`
3. Definir `learningSteps` con `validationCriteria`
4. Exportar en `src/laboratorios/laboratorios.ts`
5. Agregar tests en `src/commands/__tests__/happyPath-scenarioXX.test.ts`

## Convenciones de Código

### TypeScript
- Usar tipos explícitos para parámetros y retornos
- Usar `import type` para imports de tipos
- Comandos: exportar `cmd_<nombre>` con interfaz estándar

### Testing
- Tests en `__tests__/` dentro de cada carpeta
- Nomenclatura: `<nombre>.test.ts`
- Usar descripciones en español: `it('debe hacer algo', ...)`

### React
- Componentes funcionales con props tipadas
- Tailwind CSS para estilos
- Archivos < 300 líneas

## Linting y Formato

No usamos ESLint ni Prettier. TypeScript type-checking via `tsconfig.json`:

```bash
npx tsc --noEmit
```

Vite maneja la compilación durante `npm run build`.

## Troubleshooting

### Tests fallan
```bash
# Limpiar caché
rm -rf node_modules/.vitest

# Reinstalar dependencias
rm -rf node_modules && npm install
```

### Cambios no se reflejan
```bash
# Reiniciar dev server
# Ctrl+C y luego npm run dev
```

## Contribuir

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-feature`
3. Commit con mensaje claro: `git commit -am 'Add: nueva feature'`
4. Push: `git push origin feature/nueva-feature`
5. Abre un Pull Request

## Recursos

- [Testing Strategy](TESTING.md)
- [Architecture](ARCHITECTURE.md)
- [Labs Guide](LABS.md)
