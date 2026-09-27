// ── commands/help/packages.ts ─────────────────────────────────────
// Ayudas de gestión de paquetes (reutiliza los textos internos de -h).

import { APT_HELP } from '../tools/apt';
import { DPKG_HELP } from '../tools/dpkg';

export const help_apt = `apt - Package manager (update/install/remove/list)

${APT_HELP}

Description:
  Installing a package adds its binaries to the machine filesystem.
  Modifying operations require root.`;

export const help_dpkg = `dpkg - Debian package tool

${DPKG_HELP}

Description:
  -l lists installed packages; -i installs a local .deb file.
  Installing requires root.`;
