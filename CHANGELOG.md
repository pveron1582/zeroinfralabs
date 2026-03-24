# Changelog

## [2.0.0] - 2026-03-24

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