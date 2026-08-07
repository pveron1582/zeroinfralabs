# Overview — ZeroInfra Labs

Extensión del [`README.md`](../README.md) con secciones de detalle que no caben en el readme conciso: configuración del webhook de analytics (Google Apps Script + Google Sheets), modelos de datos para análisis y visión de producto a futuro.

> Lo esencial del proyecto (quick start, labs, tech stack, estructura, estado) vive en `README.md`. Acá solo está el detalle operativo y de producto.

---

## Analytics y Encuestas Post-Lab

Al completar un laboratorio al 100%, aparece una encuesta emergente con:

- **Rating general** (1-10) con puntos clickeables.
- **Dificultad percibida** (Fácil / Medio / Difícil / Muy difícil).
- **Recomendación** (Sí / No).
- **Comentarios libres** (textarea opcional).

La encuesta se dispara tanto con el comando `end` como con el botón "Menú".

### Configuración del Webhook (Google Apps Script)

1. Crear una Google Sheet con columnas: `Timestamp | EventType | ScenarioId | ScenarioName | Details`.
2. Ir a **Extensions → Apps Script** y pegar el código del `doPost` handler (abajo).
3. **Deploy → New deployment → Web app** — Execute as: **Me**, Who has access: **Anyone**.
4. Copiar la URL y crear `.env.local`:

```env
VITE_ANALYTICS_WEBHOOK=https://script.google.com/macros/s/TU_ID/exec
```

> Sin la variable de entorno, el tracking se desactiva silenciosamente. Ver también `.env.example`.

### Eventos rastreados

| Evento | Cuándo se dispara |
|--------|-------------------|
| `lab_started` | Al iniciar un laboratorio |
| `mission_complete` | Cada misión completada |
| `lab_completed` | Al salir con 100% de progreso |
| `lab_abandoned` | Al salir con progreso parcial |
| `lab_changed` | Al cambiar de lab sin progreso |
| `survey_submitted` | Al enviar la encuesta post-lab |

### Estructura de datos en Google Sheets

Cada evento genera una fila con 13 columnas:

| Columna | Contenido | Ejemplo |
|---|---|---|
| A: Timestamp | Fecha/hora del evento | 1/4/2026 21:17:18 |
| B: EventType | Tipo de evento | `mission_complete` |
| C: ScenarioId | ID del escenario | `scenario-01` |
| D: ScenarioName | Nombre del lab | `WordPress Vulnerable Lab` |
| E: Details | JSON completo con todos los datos | `{"overall":9,...}` |
| F: sessionId | ID anónimo de sesión | `sess_1e0ce066` |
| G: language | Idioma del usuario | `en` / `es` |
| H: sessionDuration | Segundos desde que abrió la página | `1344` |
| I: labDuration | Segundos en el lab actual | `1344` |
| J: overall | Rating encuesta (1-10) | `9` |
| K: difficulty | Dificultad percibida | `medium` |
| L: recommend | ¿Lo recomendaría? | `TRUE` / `FALSE` |
| M: comments | Comentario libre | `cool!!!!` |

### Google Apps Script — Código completo

```javascript
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    const d = data.details || {};

    sheet.appendRow([
      new Date(),
      data.eventType || 'unknown',
      data.scenarioId || '-',
      data.scenarioName || '-',
      JSON.stringify(d),
      d.sessionId || '',
      d.language || '',
      d.sessionDuration || '',
      d.labDuration || '',
      d.overall !== undefined ? d.overall : '',
      d.difficulty || '',
      d.recommend !== undefined ? String(d.recommend) : '',
      d.comments || ''
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ status: 'ok' })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', error: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}
```

> **Importante**: Cada vez que modifiques el script, hacé **Deploy → Manage deployments → Edit → New version → Deploy**.

### Cómo analizar los datos

**1. Ver actividad por usuario (sheet "PorUsuario")**

Creá una sheet nueva y en A1:

```
=QUERY('Hoja 1'!A:M, "SELECT F, A, B, C, D, J, K, L, M WHERE F <> '' ORDER BY F, A", 1)
```

Esto agrupa todos los eventos por `sessionId`, mostrando el recorrido completo de cada usuario.

**2. Ver detalle de un usuario específico (sheet "DetalleUsuario")**

- En **A1** creá un dropdown: **Datos → Validación de datos → Menú desplegable (desde un intervalo)**.
- El intervalo apuntá a una lista de sessionIds únicos generada con:
  ```
  =UNIQUE(FILTER('Hoja 1'!F:F, 'Hoja 1'!F:F<>"", 'Hoja 1'!F:F<>"sessionId"))
  ```
- En **A3** poné:
  ```
  =QUERY('Hoja 1'!A:M, "SELECT A, B, C, D, J, K, L, M WHERE F = '"&A1&"' ORDER BY A", 1)
  ```

**3. Solo encuestas (sheet "Respuestas")**

En una sheet nueva, en A1:
```
=FILTER('Hoja 1'!A:E, 'Hoja 1'!B:B="survey_submitted")
```

Luego extraé los campos de la encuesta con `REGEXEXTRACT` en las columnas siguientes.

**4. Tabla dinámica de encuestas**

Seleccioná la tabla de respuestas → **Insertar → Tabla dinámica**:

- **Filas**: `scenario` (nombre del lab)
- **Columnas**: `difficulty`
- **Valores**: `difficulty` → CONTARA (cuenta respuestas por dificultad)
- **Valores**: `overall` → PROMEDIO (rating promedio por lab)
- **Valores**: `recommend` → PROMEDIO (% que lo recomendaría)

### Métricas útiles

| Pregunta | Cómo verla |
|---|---|
| ¿Cuántos usuarios únicos? | `=COUNTUNIQUE(F:F)` en Hoja 1 |
| ¿Cuántos completaron un lab? | Contar filas con `lab_completed` |
| ¿Dónde abandonan la mayoría? | Último `EventType` antes de `lab_abandoned` |
| ¿Qué lab es más difícil? | Tabla dinámica: scenario vs difficulty |
| ¿Rating promedio general? | `=AVERAGE(J:J)` en sheet Respuestas |
| ¿Cuánto tardan en promedio? | `=AVERAGE(I:I)` filtrando por `lab_completed` |

---

## Visión de producto a futuro

Roadmap aspiracional más allá de las fases técnicas documentadas en [`docs/ROADMAP.md`](./ROADMAP.md).

### Fase 1 — Admin Panel (CRUD de Labs)

Interfaz web protegida para crear, editar y eliminar laboratorios sin tocar código.

- **Lab Editor:** Formulario con secciones para metadata, máquinas, learning steps, misiones, hints.
- **File Manager:** Editor de archivos virtuales para cada máquina.
- **Preview:** Vista previa del lab antes de guardarlo.
- **Export/Import:** Labs como JSON portable.

### Fase 2 — Lab Builder con piezas modulares

Interfaz para armar labs combinando componentes predefinidos.

| Categoría | Piezas |
|---|---|
| **Attacker** | Kali Linux 2026.1, Parrot OS, Arch Linux |
| **Target OS** | Ubuntu 22.04, Windows 7, Windows 10, Debian |
| **Services** | SSH, FTP, HTTP, SMB, MySQL, PostgreSQL |
| **Vulnerabilities** | LFI, SQLi, EternalBlue, FTP Anonymous, Weak SSH Creds, Misconfigured Sudo, WordPress Admin Leak |
| **Web Sites** | WordPress, Consultancy Site, Login Portal, Custom |
| **Flags** | User flag, Root flag, Custom flag |

**Crear un lab nuevo:** de ~100 líneas de código → 5 minutos en UI.

### Fase 3 — Community Platform & Gamification

Plataforma viva donde la comunidad crea, vota y comparte labs.

- **Votación de labs:** Los usuarios votan los mejores labs de la comunidad.
- **Niveles de creador:** Novato → Creador → Arquitecto → Maestro.
- **Recompensas:** Labs más votados = meses gratis de premium.
- **Template gallery:** Labs de la comunidad con rating y sharing.
- **Lab Composer:** Usuarios avanzados combinan piezas y comparten sus creaciones.

### Fase 4 — Rutas de Aprendizaje (Premium)

Diferenciador clave: no solo "hacé el lab", sino "aprendé pentesting paso a paso".

- Rutas progresivas: Recon → Enumeración → Explotación → Post-explotación → Reporting.
- Labs con dificultad creciente dentro de cada ruta.
- Certificados descargables al completar rutas.
- Scoring y leaderboards.

### Modelo Freemium

| Free | Premium |
|---|---|
| Labs básicos | Rutas de aprendizaje completas |
| Crear labs propios | Labs avanzados exclusivos |
| Comunidad | Certificados + mentoring |
| Votar labs | Leaderboards + badges especiales |
