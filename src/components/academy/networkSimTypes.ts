// ── components/academy/networkSimTypes.ts ─────────────────────────
// Tipos del motor genérico de simulador de red. Extraídos de
// NetworkSimCore.tsx para mantener el componente <300 líneas.

import type { ReactNode } from 'react';

export type SimNodeState = 'internet' | 'lan' | 'blocked' | 'none';

export interface SimCableType {
  id: string;
  icon: string;
  label: string;
  labelEs: string;
  color: string;
  dash?: string; // strokeDasharray del cable cuando está inactivo
}

export interface SimNode {
  id: string;
  icon: string;
  label: string;
  labelEs: string;
  x: number;   // % del ancho del canvas
  y: number;   // % del alto del canvas
  color: string;
  desc: string;
  descEs: string;
  toggleKey?: string; // si existe, el nodo muestra un botón ON/OFF
}

export interface SimCable { a: string; b: string; type?: string; }

export interface SimZone {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  labelEs: string;
  color: string;
  border: string;
  bg: string;
}

export interface SimConfig {
  nodes: SimNode[];
  allowed: [string, string][];
  zones?: SimZone[];
  title: { es: string; en: string };
  subtitle: { es: string; en: string };
  success: { es: string; en: string };
  legend: { symbol: string; color: string; es: string; en: string }[];
  state: (nodeId: string, links: SimCable[], toggles: Record<string, boolean>) => SimNodeState;
  badge?: (nodeId: string, state: SimNodeState, links: SimCable[], toggles: Record<string, boolean>, isEs: boolean) => string;
  winWhen: (links: SimCable[], toggles: Record<string, boolean>) => boolean;
  warning?: (links: SimCable[], toggles: Record<string, boolean>, isEs: boolean) => string | null;
  stats: (links: SimCable[], toggles: Record<string, boolean>, isEs: boolean) => ReactNode;
  port?: (node: SimNode, peer?: SimNode) => { x: number; y: number };
  toggleDefaults?: Record<string, boolean>;
  height?: number;
  /** Si existe, el lab muestra un selector de tipo de cable antes de arrastrar. */
  cableTypes?: SimCableType[];
  /** Reglas: qué tipo de cable acepta cada conexión permitida (con error propio). */
  cableRules?: { a: string; b: string; only: string[]; wrongEs?: string; wrongEn?: string }[];
}
