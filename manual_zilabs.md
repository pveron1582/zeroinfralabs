# Manual ZeroInfra Labs

## Bienvenido

¡Bienvenido al primer simulador de hacking desde tu navegador!

Esta guía breve te explica las funciones básicas del simulador. Demos un vistazo a las herramientas que vas a usar durante tus misiones.

---

## 1. El escritorio

Al entrar a cualquier laboratorio se carga un escritorio estilo Kali Linux con:

- **Terminal** (icono `>_`): tu consola principal, siempre abierta al iniciar.
- **Manual** (icono de documento PDF): esta guía, abierta junto a la terminal.
- **Fondos** (icono de imagen): abre el selector de fondos de pantalla.
- **Chrome** (icono de navegador): aparece solo en laboratorios web, para interactuar con las aplicaciones vulnerables.

En la barra superior (taskbar) tenés:

- El menú **Aplicaciones** (letra `K`) con acceso rápido a Terminal, Cambiar Fondo, Ver Manual y Chrome.
- Botones de todas las ventanas abiertas (hacé clic para minimizar, restaurar o traer al frente).
- El reloj, el estado de red y el botón de **apagado** para salir del laboratorio.

Todas las ventanas se pueden **mover** (arrastrando el título) y **redimensionar**: arrastrá los **bordes** (superior, inferior, izquierdo o derecho) o las **esquinas** para ajustar el tamaño. También se pueden **minimizar**, **maximizar** y **cerrar** desde los botones de la barra de título.

---

## 2. La terminal

Es el corazón del simulador: ahí escribís todos los comandos de pentesting.

### Cómo se usa

- Escribí el comando y presioná **Enter**.
- Navegación básica: `ls`, `cd`, `cat`, `pwd`, `echo`, etc. funcionan como en Linux real.
- El historial se recorre con las flechas ↑/↓.
- Podés usar **redirecciones** (`>`, `>>`, `<`) y **pipes** (`|`), por ejemplo: `cat archivo.txt | grep flag`.

### Configuración

Cada terminal tiene un menú de ajustes (icono de engranaje en la barra de la ventana) donde podés cambiar:

- **Tamaño de fuente** (de 10 a 20 px).
- **Opacidad** de la ventana.
- **Color del texto** del prompt.

### Cantidad de terminales

Podés tener hasta **5 terminales** abiertas a la vez. Usá el botón `+` de la barra superior o el menú **Aplicaciones → Abrir Terminal**.

### Ayuda de comandos

Escribí `help` en cualquier terminal para ver la lista completa de comandos disponibles. También podés consultar un comando puntual:

```
help <comando>
```

> **Importante: es una simulación**
> Este simulador **no implementa todos los comandos** de un sistema real, y los comandos que existen **no soportan todos sus parámetros** (solo los necesarios para las misiones). El objetivo es educativo: aprendé el *flujo* del pentesting (enumeración → escaneo → explotación → post-explotación), no la sintaxis exhaustiva de cada herramienta.

---

## 3. El navegador

En los laboratorios web vas a encontrar el icono **Chrome** en el escritorio. El navegador del simulador funciona como uno real:

- Barra de dirección para escribir URLs (ej.: `http://<ip>/login`).
- **Páginas web simuladas** que reproducen aplicaciones vulnerables (login, paneles de administración, blogs WordPress, directorios con archivos sensibles, etc.).
- Botones de navegación (atrás / adelante / recargar) y pestañas.

Es una herramienta complementaria: muchas pistas del lab requieren **observar el sitio web** para encontrar credenciales, rutas o funcionalidades ocultas que después usás en la terminal.

---

## 4. Menú de guía de pasos (Misiones)

En el **panel lateral derecho** se muestra la lista de misiones del laboratorio. Cada misión representa un paso concreto del ataque y tiene:

- El **objetivo** (enumeración, escaneo, explotación, etc.).
- Una barra de estado: **activa / pendiente / completada**.
- Hints o **pistas**: un botón para revelar la siguiente pista cuando te quedes trabado. Hay hasta 2 pistas por misión.

La misión se **completa automáticamente** cuando ejecutás el comando correcto (el simulador detecta la acción y valida el paso). Seguí el orden de las misiones para avanzar de manera lógica.

---

## 5. Topología de red y enumeración

- **Mapa de red** (icono de red en el panel): muestra las máquinas descubiertas y su estado. A medida que avanzás, se van agregando hosts detectados con `arp-scan`, `netdiscover` o `nmap`.
- **Panel de enumeración**: registra los resultados de tu reconocimiento — puertos abiertos, servicios detectados, credenciales encontradas y vulnerabilidades confirmadas.

Estos paneles son tu "libreta de notas automática": no hace falta memorizar IPs ni credenciales, porque el simulador las guarda ahí a medida que las descubrís. Las credenciales confirmadas se marcan como **VERIFIED** cuando el servicio verifica que son válidas.

---

## 6. Wallpapers y personalización

Desde el icono **Fondos** (icono de imagen) del escritorio o **Aplicaciones → Cambiar Fondo** se abre el selector de fondos de pantalla. Podés elegir entre varios diseños, y tu elección **se guarda** para la próxima vez que abras el simulador.

También podés personalizar la terminal (color de texto, opacidad y tamaño de fuente) desde el menú de ajustes de cada ventana.

---

¡Disfrutá el laboratorio y feliz hacking!
