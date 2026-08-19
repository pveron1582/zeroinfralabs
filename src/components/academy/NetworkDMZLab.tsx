// ── components/academy/NetworkDMZLab.tsx ───────────────────────────
// Simulador de topología DMZ: la DMZ es la zona pública expuesta al mundo
// (web y correo), separada de la LAN privada (PC y base de datos).
// Todo entra y sale por el firewall: a la DMZ se le permite tráfico
// entrante, a la LAN no. Wrapper fino sobre NetworkSimCore.

import { NetworkSimCore } from './NetworkSimCore';
import type { SimConfig, SimNode, SimCable, SimNodeState } from './NetworkSimCore';

type NodeId = 'internet' | 'firewall' | 'web' | 'mail' | 'pc' | 'db';

const NODES: SimNode[] = [
  { id: 'internet', icon: '☁️', label: 'Internet', labelEs: 'Internet', x: 78, y: 16, color: '#f59e0b', desc: 'The outside world', descEs: 'El mundo exterior' },
  { id: 'firewall', icon: '🛡️', label: 'Firewall', labelEs: 'Firewall', x: 78, y: 42, color: '#ef4444', desc: 'DMZ firewall: allows inbound to DMZ, blocks inbound to LAN', descEs: 'Firewall DMZ: permite entrante a DMZ, bloquea entrante a LAN' },
  { id: 'web', icon: '🌐', label: 'Web server', labelEs: 'Servidor web', x: 25, y: 78, color: '#06b6d4', desc: 'Public web (port 80/443) — lives in the DMZ', descEs: 'Web pública (puerto 80/443) — vive en la DMZ' },
  { id: 'mail', icon: '📧', label: 'Mail server', labelEs: 'Servidor de correo', x: 45, y: 78, color: '#06b6d4', desc: 'Public mail (port 25) — lives in the DMZ', descEs: 'Correo público (puerto 25) — vive en la DMZ' },
  { id: 'pc', icon: '🖥️', label: 'Workstation', labelEs: 'PC', x: 70, y: 78, color: '#a78bfa', desc: 'Internal workstation — LAN only', descEs: 'Estación de trabajo interna — solo LAN' },
  { id: 'db', icon: '🗄️', label: 'Database', labelEs: 'Base de datos', x: 88, y: 78, color: '#a78bfa', desc: 'Database (port 3306) — NEVER exposed, stays in the LAN', descEs: 'Base de datos (puerto 3306) — NUNCA expuesta, queda en la LAN' },
];

const ALLOWED: [NodeId, NodeId][] = [
  ['internet', 'firewall'],
  ['firewall', 'web'], ['firewall', 'mail'],
  ['firewall', 'pc'], ['firewall', 'db'],
];

const DMZ_NODES: NodeId[] = ['web', 'mail'];
const LAN_NODES: NodeId[] = ['pc', 'db'];

const hasLink = (links: SimCable[], a: string, b: string) =>
  links.some((l) => (l.a === a && l.b === b) || (l.a === b && l.b === a));

const dmzState = (nodeId: string, links: SimCable[], _toggles: Record<string, boolean>): SimNodeState => {
  const firewallUp = hasLink(links, 'firewall', 'internet');
  switch (nodeId) {
    case 'internet':
      return 'internet';
    case 'firewall':
      return firewallUp ? 'internet' : 'none';
    default:
      if (!hasLink(links, 'firewall', nodeId)) return 'none';
      return firewallUp ? 'internet' : 'lan';
  }
};

export function NetworkDMZLab({ isEs }: { isEs: boolean }) {
  const config: SimConfig = {
    nodes: NODES,
    allowed: ALLOWED,
    zones: [
      {
        id: 'dmz',
        x: 6, y: 56, w: 43, h: 38,
        label: 'DMZ — ZONE DÉMILITARISÉE (PUBLIC)',
        labelEs: 'DMZ — ZONA DESMILITARIZADA (PÚBLICA)',
        color: '#06b6d4',
        border: '#06b6d4',
        bg: 'rgba(6,182,212,0.05)',
      },
      {
        id: 'lan',
        x: 51, y: 56, w: 44, h: 38,
        label: 'LAN — INTERNAL PRIVATE NETWORK',
        labelEs: 'LAN — RED INTERNA PRIVADA',
        color: '#a78bfa',
        border: '#a78bfa',
        bg: 'rgba(167,139,250,0.05)',
      },
    ],
    title: { es: 'SIMULADOR DMZ', en: 'DMZ SIMULATOR' },
    subtitle: {
      es: 'Conectá internet al firewall y colgá cada servidor donde corresponde: web y correo en la DMZ pública, PC y base de datos en la LAN privada.',
      en: 'Connect internet to the firewall and hang each server where it belongs: web and mail in the public DMZ, workstation and database in the private LAN.',
    },
    success: {
      es: '¡Topología DMZ perfecta! Web y correo son públicos en la DMZ; la PC y la base de datos están protegidas por el firewall en la LAN.',
      en: 'Perfect DMZ topology! Web and mail are public in the DMZ; the workstation and the database are protected by the firewall in the LAN.',
    },
    legend: [
      { symbol: '●', color: '#10b981', es: 'Con internet y acceso a salida', en: 'Has internet and outbound access' },
      { symbol: '●', color: '#f59e0b', es: 'Conectado pero sin internet', en: 'Connected but no internet' },
      { symbol: '○', color: '#4b5563', es: 'Sin cable', en: 'No cable' },
    ],
    // El firewall se conecta por arriba hacia internet y por abajo hacia los servidores
    port: (n, peer) => {
      if (n.id === 'firewall') return peer?.id === 'internet' ? { x: n.x, y: n.y - 6 } : { x: n.x, y: n.y + 4 };
      if (n.id === 'internet') return { x: n.x, y: n.y + 4 };
      return { x: n.x, y: n.y - 6 };
    },
    state: dmzState,
    badge: (id, s) => {
      if (id === 'web' || id === 'mail') {
        return s === 'internet'
          ? isEs ? '⚡ público' : '⚡ public'
          : s === 'lan'
            ? isEs ? '● DMZ sin internet' : '● DMZ, no internet'
            : isEs ? '○ sin cable' : '○ no cable';
      }
      if (id === 'pc' || id === 'db') {
        return s === 'internet'
          ? isEs ? '🛡️ protegido + internet' : '🛡️ protected + internet'
          : s === 'lan'
            ? isEs ? '● LAN sin internet' : '● LAN, no internet'
            : isEs ? '○ sin cable' : '○ no cable';
      }
      return s === 'internet'
        ? '● internet'
        : isEs ? '○ sin conexión' : '○ no cable';
    },
    winWhen: (links, _toggles) => {
      const fwUp = hasLink(links, 'firewall', 'internet');
      return fwUp && [...DMZ_NODES, ...LAN_NODES].every((d) => dmzState(d, links, {}) === 'internet');
    },
    warning: (links, _toggles, es) => {
      const fwUp = hasLink(links, 'firewall', 'internet');
      const anyServer = [...DMZ_NODES, ...LAN_NODES].some((d) => hasLink(links, 'firewall', d));
      if (fwUp && !anyServer) {
        return es
          ? 'El firewall tiene internet, pero todavía no hay servidores conectados. Colgá web y correo en la DMZ, y PC y base de datos en la LAN.'
          : 'The firewall has internet, but no servers are connected yet. Hang web and mail in the DMZ, and the workstation and database in the LAN.';
      }
      return null;
    },
    stats: (links, _toggles, es) => {
      const dmzOk = DMZ_NODES.filter((d) => dmzState(d, links, {}) === 'internet').length;
      const lanOk = LAN_NODES.filter((d) => dmzState(d, links, {}) === 'internet').length;
      return (
        <>
          <div className="text-gray-400">{es ? 'DMZ (pública)' : 'DMZ (public)'}: {dmzOk}/{DMZ_NODES.length}</div>
          <div className={lanOk === LAN_NODES.length ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
            {es ? 'LAN (protegida)' : 'LAN (protected)'}: {lanOk}/{LAN_NODES.length}
          </div>
        </>
      );
    },
  };

  return <NetworkSimCore config={config} isEs={isEs} />;
}