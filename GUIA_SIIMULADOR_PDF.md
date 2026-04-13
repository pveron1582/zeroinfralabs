# Capítulo 1 — Descubriendo una red: cómo piensan los sistemas (y quienes los analizan)

## 🧠 Antes de empezar

Antes de usar herramientas, hay algo importante que entender.

Los sistemas informáticos no son perfectos. Están hechos por personas, y como cualquier cosa creada por humanos, pueden tener errores. A veces esos errores son pequeños, otras veces permiten hacer cosas que no estaban pensadas.

Eso es lo que hace posible que exista la ciberseguridad.

No se trata de “romper sistemas”, sino de entender cómo funcionan… y dónde pueden fallar.

---

## 🔐 Una idea simple: las cerraduras

Hace muchos años, cuando aparecieron las primeras cerraduras, parecían completamente seguras. Si no tenías la llave, no podías entrar.

Pero con el tiempo, alguien descubrió que eso no era del todo cierto.

Algunas cerraduras podían forzarse. Otras estaban mal diseñadas. En algunos casos, simplemente estaban mal instaladas.

A partir de ahí empezó un juego que sigue hasta hoy: mientras unos mejoran la seguridad, otros intentan encontrar formas de superarla.

En los sistemas informáticos ocurre exactamente lo mismo.

---

📌 **Ilustración sugerida 1**
Una puerta con cerradura (simple), y al lado otra siendo forzada o manipulada.
Objetivo: representar “seguridad vs vulnerabilidad”.

---

## 🏠 Cómo ubicar un sistema

Imaginá una ciudad. Cada casa o edificio tiene una dirección única que permite encontrarla.

En una red, eso mismo se representa con una dirección IP.

Una IP es simplemente la forma de identificar dónde está un sistema dentro de una red. Es su ubicación.

---

## 🏢 Qué hay dentro: los puertos

Ahora imaginá que esa dirección no corresponde a una casa, sino a un edificio.

Desde afuera, la dirección es una sola. Pero adentro hay muchas puertas distintas: departamentos, oficinas, accesos independientes.

En una computadora ocurre algo parecido. Cada una de esas “puertas” se llama puerto, y cada puerto puede estar asociado a un servicio distinto.

Por ejemplo, algunos puertos suelen utilizarse para mostrar páginas web, otros para permitir conexiones remotas o transferir archivos. No hace falta memorizar números ahora; lo importante es entender la idea: un mismo sistema puede ofrecer múltiples puntos de acceso.

---

📌 **Ilustración sugerida 2**
Un edificio con una dirección visible y varios departamentos numerados.
Algunos con luz encendida (activos) y otros apagados.
Objetivo: representar IP + puertos.

---

## 🔍 Mirar sin tocar: observar un sistema

Si alguien quisiera entender qué pasa dentro de ese edificio sin entrar, probablemente haría algo simple: tocaría distintas puertas para ver cuáles responden.

Eso es, en esencia, lo que hacen muchas herramientas de análisis.

Una de las más conocidas es Nmap.

Cuando se utiliza, lo que hace es intentar comunicarse con distintos puertos de un sistema para ver cuáles están abiertos y qué tipo de servicio parece estar funcionando detrás.

No “rompe” nada. Solo observa y recopila información.

---

📌 **Ilustración sugerida 3**
Una persona tocando varias puertas de un edificio, algunas responden, otras no.
Objetivo: representar el comportamiento de Nmap.

---

## 🌐 Antes de analizar: descubrir qué existe

Sin embargo, antes de analizar un sistema, hay una pregunta más básica: ¿qué sistemas hay?

En una red, no siempre sabemos cuántos dispositivos están conectados. Para eso se utilizan herramientas que permiten descubrirlos.

Una de ellas es arp-scan.

Su función es simple: recorrer la red local y devolver una lista de dispositivos que están activos. Es como caminar por una calle y anotar qué edificios existen, sin entrar en ninguno.

---

## 🔍 Entender lo que vemos

Llegados a este punto, aparece algo importante.

Las herramientas muestran información, pero no la interpretan por vos. Ver una lista de dispositivos o puertos abiertos no alcanza; hay que entender qué significa eso.

Ahí es donde empieza el verdadero aprendizaje.

---

## 🔐 Cuando la seguridad entra en juego

Volvamos al edificio.

Durante mucho tiempo, muchos edificios no tenían ningún control en la entrada. Cualquiera podía entrar desde la calle y moverse libremente por los pasillos.

Con el tiempo, eso cambió.

Se empezaron a agregar puertas de acceso, llaves, códigos, cámaras y, en algunos casos, personal de seguridad. Todo eso con un objetivo claro: evitar que cualquiera llegue hasta las puertas de los departamentos.

---

📌 **Ilustración sugerida 4**
Dos edificios: uno abierto (sin control) y otro con puerta, cámara y control de acceso.
Objetivo: mostrar la evolución de la seguridad.

---

## 💻 El equivalente digital: el firewall

En redes, ese concepto existe y se llama firewall.

Un firewall funciona como el control de entrada de un edificio. Decide qué conexiones pueden pasar y cuáles no. Puede permitir ciertos accesos y bloquear otros, dependiendo de reglas definidas.

Esto no significa que el sistema sea invulnerable, pero sí que agrega una capa de protección muy importante.

---

📌 **Ilustración sugerida 5**
Entrada de edificio con control que deja pasar a algunos y bloquea a otros.
Objetivo: representar visualmente el firewall.

---

## 🧪 Tu primera experiencia práctica

Ahora que entendés la idea general, es momento de aplicarla.

En el laboratorio vas a hacer algo muy parecido a lo que describimos:

primero descubrir qué dispositivos hay en la red,
luego elegir uno,
y finalmente observar qué “puertas” tiene abiertas.

No se trata de ejecutar comandos sin pensar, sino de entender qué estás viendo y por qué.

---

## 🧠 Para quedarte con una idea clara

Todo lo que viste en este capítulo se puede resumir en algo simple:

cada sistema tiene una ubicación,
puede tener múltiples puntos de acceso,
y existen herramientas para descubrirlos y analizarlos.

A partir de ahí, entra en juego la seguridad.

---

## 🚀 Cierre

Lo importante no es memorizar herramientas ni comandos.

Es empezar a ver los sistemas como estructuras que pueden analizarse, entenderse y, eventualmente, protegerse.

Ese cambio de forma de pensar es el primer paso en ciberseguridad.
