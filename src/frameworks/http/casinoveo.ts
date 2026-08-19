// ── frameworks/http/casinoveo.ts ─────────────────────────────────────
// Branding de "CasinoVeo": parodia de un generador de imágenes y videos
// con IA en la nube (el chiste del nombre es "casi no veo", no un casino:
// los renders salen tan difusos que casi no se ven). Compartido por el
// motor HTTP sintético (responses de curl y Burp Suite) y por el fake site
// del navegador.

import type { Machine } from '../../types';

export function isCasinoVeo(m: Machine): boolean {
  return m.id.includes('casino') || !!m.web_enumeration?.cms?.toLowerCase().includes('casinoveo');
}

// ── Clasificación de payloads SQLi (compartida con response.ts) ──────
// La misma lógica que usa el motor HTTP sintético para que el fake site
// del navegador y Burp/curl emitan metadata idéntica (detected/confirmed).
export const SQLI_BYPASS = /['"]\s*or\s+['"]?1['"]?\s*=\s*['"]?1['"]?\s*(--|#)?/i;

export type SqliClassification = 'bypass' | 'error' | 'invalid';

export function classifySqli(username: string): SqliClassification {
  if (SQLI_BYPASS.test(username)) return 'bypass';
  if (username.includes("'")) return 'error';
  return 'invalid';
}

export function homePage(ip: string): string {
  return `<html>
<head><title>CasinoVeo — Generador de Imágenes y Videos con IA</title></head>
<body>
  <h1>CasinoVeo</h1>
  <p>Creamos imágenes y videos con inteligencia artificial en la nube. Tan buenos, que a veces casi no se ven.</p>
  <p>Nuestro modelo "Casi-No-Veo v2": render en la nube, resultados que se intuyen.</p>
  <ul>
    <li><a href="http://${ip}/login">Iniciar sesión (Premium)</a></li>
    <li><a href="http://${ip}/admin">Panel de administración (restringido)</a></li>
  </ul>
  <p>Prompts populares: "gato astronauta", "empanada cyberpunk", "abuela rankeando en CS:GO"</p>
  <p>Server: Apache/2.4.52 | Platform: PHP 7.4 | Database: MySQL 5.7</p>
</body>
</html>`;
}

export function loginPage(): string {
  return `<html>
<head><title>CasinoVeo — Login</title></head>
<body>
  <h1>CasinoVeo Premium Login</h1>
  <p>Ingresá para generar imágenes y videos ilimitados (hasta que explote la base de datos).</p>
  <form action="/login" method="POST">
    <label>Username: <input type="text" name="username"></label><br>
    <label>Password: <input type="password" name="password"></label><br>
    <input type="submit" value="Generar">
  </form>
  <p>Hint: Try SQL injection payloads like ' OR '1'='1</p>
</body>
</html>`;
}

export function adminDenied(ip: string): string {
  return `<html>
<head><title>403 Forbidden</title></head>
<body>
  <h1>403 Forbidden</h1>
  <p>El panel está reservado para los admins. Casi no te vemos, pero no pasás.</p>
  <p>Please login first: <a href="http://${ip}/login">Go to Login</a></p>
</body>
</html>`;
}

export function sqlErrorBody(username: string): string {
  return `<html>
<head><title>500 Internal Server Error</title></head>
<body>
  <h1>500 Internal Server Error</h1>
  <p>CasinoVeo se quedó sin GPU en la nube.</p>
  <pre>You have an error in your SQL syntax; check the manual that
corresponds to your MySQL server version for the right syntax to
use near '${username}' at line 1</pre>
  <p><strong>[!] Vulnerabilidad SQLi detectada:</strong> el input se interpola directamente en una consulta SQL sin sanitizar.</p>
  <p>Next Step: Bypass the login with <code>' OR '1'='1</code> or extract data with UNION SELECT.</p>
</body>
</html>`;
}

export function dashboardBody(): string {
  return `<html>
<head><title>CasinoVeo — Dashboard Premium</title></head>
<body>
  <h1>¡Render desbloqueado! — Dashboard Premium</h1>
  <p><strong>Success!</strong> SQL injection vulnerability exploited. Entraste como admin sin credenciales.</p>
  <p>Next Step: como buen profesional, repetí la explotación con Burp Suite: interceptá el POST /login y usá UNION SELECT desde el Repeater para extraer la base de datos.</p>
</body>
</html>`;
}
