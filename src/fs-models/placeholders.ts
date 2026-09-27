// ── fs-models/placeholders.ts ────────────────────────────────────
// Placeholders que la plantilla escribe y `buildScenario` reemplaza por el
// valor real de cada máquina. Evita que el modelo hardcodee hostnames ni IPs
// de laboratorio (fuente única: machine_info.hostname).

/** Hostname en /etc/hostname, /etc/hosts y los logs de la plantilla Linux. */
export const MACHINE_HOSTNAME_PLACEHOLDER = 'MACHINE_HOSTNAME';
