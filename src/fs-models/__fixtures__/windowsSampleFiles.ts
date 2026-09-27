// ── fs-models/__fixtures__/windowsSampleFiles.ts ──────────────────
// Contenido de ESCENARIO para tests Windows. La plantilla
// `createWindowsFileSystem()` es neutra (SO instalado desde cero) y no
// lleva flags, credenciales ni notas: eso pertenece a los laboratorios.
// Los tests que necesitan leer archivos de usuario usan este helper.
// Solo para tests — no importar desde código de producción.

import type { FileEntry } from '../../types';

export const SAMPLE_FLAG_CONTENT = 'THM{USER_ACCESS_GRANTED}';

export const SAMPLE_NOTES_CONTENT =
  'TODO:\n- Update server passwords\n- Check firewall rules\n- Review access logs\n\nAdmin credentials:\nUsername: Administrator\nPassword: P@ssw0rd123!';

export const SAMPLE_WEB_CONFIG_CONTENT =
  '<?xml version="1.0" encoding="UTF-8"?>\n<configuration>\n  <connectionStrings>\n    <add name="DefaultConnection" connectionString="Server=localhost;Database=mydb;User Id=sa;Password=Str0ngP@ss!;" providerName="System.Data.SqlClient" />\n  </connectionStrings>\n  <system.web>\n    <authentication mode="Windows" />\n    <compilation debug="true" targetFramework="4.8" />\n  </system.web>\n</configuration>';

/** Agrega al FS Windows neutro los archivos de usuario que los tests leen. */
export function withWindowsSampleFiles(
  files: FileEntry[],
  username = 'Administrator',
): FileEntry[] {
  const home = `/C:/Users/${username}`;
  const entry = (relPath: string, content: string, mode: number): FileEntry => ({
    path: `${home}${relPath}`,
    content,
    type: 'text',
    owner: username,
    group: username,
    mode,
  });

  return [
    ...files,
    entry('/Desktop/flag.txt', SAMPLE_FLAG_CONTENT, 0o600),
    entry('/Documents/notes.txt', SAMPLE_NOTES_CONTENT, 0o600),
    entry('/Documents/web.config', SAMPLE_WEB_CONFIG_CONTENT, 0o600),
  ];
}
