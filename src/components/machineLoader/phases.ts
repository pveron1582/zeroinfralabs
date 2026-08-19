// ── components/machineLoader/phases.ts ───────────────────────────
// Definición de fases, textos y helpers de la animación de carga de máquinas

export interface LogEntry {
  text: string;
  timestamp: number;
  type: 'info' | 'ok' | 'warn' | 'retry';
}

export interface LoadPhase {
  label: { en: string; es: string };
  duration: number;
  targetProgress: number;
  logLines?: { text: { en: string; es: string }; type: LogEntry['type']; atPercent: number }[];
}

export const PHASES: LoadPhase[] = [
  {
    label: { en: 'Resolving infrastructure...', es: 'Resolviendo infraestructura...' },
    duration: 600,
    targetProgress: 15,
    logLines: [
      { text: { en: '→ Resolving lab DNS...', es: '→ Resolviendo DNS del laboratorio...' }, type: 'info', atPercent: 3 },
      { text: { en: '→ Infrastructure found ✓', es: '→ Infraestructura encontrada ✓' }, type: 'ok', atPercent: 10 },
    ],
  },
  {
    label: { en: 'Provisioning virtual machines...', es: 'Provisionando máquinas virtuales...' },
    duration: 900,
    targetProgress: 38,
    logLines: [
      { text: { en: '→ Provisioning {machineName}...', es: '→ Provisionando {machineName}...' }, type: 'info', atPercent: 18 },
      { text: { en: '→ Allocating resources...', es: '→ Asignando recursos...' }, type: 'info', atPercent: 28 },
      { text: { en: '→ Snapshot applied ✓', es: '→ Snapshot aplicado ✓' }, type: 'ok', atPercent: 35 },
    ],
  },
  {
    label: { en: 'Configuring isolated network...', es: 'Configurando red aislada...' },
    duration: 800,
    targetProgress: 55,
    logLines: [
      { text: { en: '→ Creating isolated virtual network...', es: '→ Creando red virtual aislada...' }, type: 'info', atPercent: 40 },
      { text: { en: '→ IP assigned: {machineIp}', es: '→ IP asignada: {machineIp}' }, type: 'ok', atPercent: 48 },
      { text: { en: '→ Firewall configured ✓', es: '→ Firewall configurado ✓' }, type: 'ok', atPercent: 53 },
    ],
  },
  {
    label: { en: 'Initializing services...', es: 'Inicializando servicios...' },
    duration: 700,
    targetProgress: 72,
    logLines: [
      { text: { en: '→ Detecting OS: {machineOs}', es: '→ Detectando OS: {machineOs}' }, type: 'info', atPercent: 58 },
      { text: { en: '→ Network services starting...', es: '→ Servicios de red arrancando...' }, type: 'info', atPercent: 65 },
      { text: { en: '→ Ports listening ✓', es: '→ Puertos escuchando ✓' }, type: 'ok', atPercent: 70 },
    ],
  },
  {
    label: { en: 'Deploying attack vectors...', es: 'Desplegando vectores de ataque...' },
    duration: 600,
    targetProgress: 88,
    logLines: [
      { text: { en: '→ Loading pentesting tools...', es: '→ Cargando herramientas de pentesting...' }, type: 'info', atPercent: 75 },
      { text: { en: '→ Attack vectors configured ✓', es: '→ Vectores de ataque configurados ✓' }, type: 'ok', atPercent: 85 },
    ],
  },
  {
    label: { en: 'Verifying connectivity...', es: 'Verificando conectividad...' },
    duration: 500,
    targetProgress: 96,
    logLines: [
      { text: { en: '→ Ping to gateway... OK', es: '→ Ping a gateway... OK' }, type: 'ok', atPercent: 92 },
      { text: { en: '→ Connection established ✓', es: '→ Conexión establecida ✓' }, type: 'ok', atPercent: 95 },
    ],
  },
  {
    label: { en: 'Finalizing...', es: 'Finalizando...' },
    duration: 400,
    targetProgress: 100,
    logLines: [
      { text: { en: '→ Lab ready. Access granted.', es: '→ Laboratorio listo. Acceso concedido.' }, type: 'ok', atPercent: 100 },
    ],
  },
];

export const DEFAULT_TOTAL_DURATION = 6500;
export const COUNTDOWN_DURATION = 1500;

export const UI_TEXTS = {
  deploying: { en: 'DEPLOYING LAB', es: 'DESPLEGANDO LABORATORIO' },
  initializing: { en: 'INITIALIZING', es: 'INICIALIZANDO' },
  labActive: { en: 'LAB ACTIVE', es: 'LABORATORIO ACTIVO' },
  ready: { en: 'Ready', es: 'Listo' },
  accessGranted: { en: 'Access granted. Ready for attack.', es: 'Acceso concedido. Ready for attack.' },
  target: { en: 'target', es: 'objetivo' },
  ip: { en: 'ip', es: 'ip' },
  windowTitle: { en: 'ZeroInfra Labs — Deploying lab', es: 'ZeroInfra Labs — Desplegando laboratorio' },
};

export function interpolateLogLine(text: string, machineName: string, machineIp: string, machineOs: string): string {
  return text
    .replace('{machineName}', machineName)
    .replace('{machineIp}', machineIp)
    .replace('{machineOs}', machineOs);
}
