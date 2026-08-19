// ── fs-models/fs-linux-types.ts ─────────────────────────────────
// Tipos de configuración del filesystem Linux

export interface ExtraLinuxUser {
  username: string;
  gecos?: string;
  shell?: string;
}

export interface LinuxFileSystemConfig {
  username?: string;
  password?: string;
  shadowPassword?: string;
  // Usuarios normales adicionales del sistema (se agregan a passwd/shadow/
  // group con uid auto 1001+ y su directorio /home/<usuario>). Sus passwords
  // se definen en `known_passwords` de la máquina, no aquí.
  extraUsers?: ExtraLinuxUser[];
}
