// ── components/academy/NetworkMitmLab.tsx ──────────────────────────
// Simulador Man-in-the-Middle (ARP spoofing): sos el atacante. Debés
// meterte en la LAN, darle internet a la víctima y activar el ARP spoof
// para que su tráfico salga por TU máquina en lugar del router real.
// Wrapper fino sobre NetworkSimCore.

import { NetworkSimCore } from './NetworkSimCore';
import type { SimConfig, SimNode, SimCable, SimNodeState } from './NetworkSimCore';

type NodeId = 'internet' | 'router' | 'switch' | 'victim' | 'attacker';

const NODES: SimNode[] = [
  { id: 'internet', icon: '☁️', label: 'Internet', labelEs: 'Internet', x: 50, y: 14, color: '#f59e0b', desc: 'The outside world', descEs: 'El mundo exterior' },
  { id: 'router', icon: '📡', label: 'Router', labelEs: 'Router', x: 50, y: 40, color: '#10b981', desc: 'Real gateway the victim should use', descEs: 'Gateway real que la víctima debería usar' },
  { id: 'switch', icon: '🔌', label: 'Switch (LAN)', labelEs: 'Switch (LAN)', x: 50, y: 66, color: '#06b6d4', desc: 'Connects everyone on the LAN', descEs: 'Conecta a toda la LAN' },
  { id: 'victim', icon: '🖥️', label: 'Victim PC', labelEs: 'PC víctima', x: 28, y: 84, color: '#a78bfa', desc: 'The user you want to intercept', descEs: 'El usuario que querés interceptar' },
  { id: 'attacker', icon: '🕵️', label: 'Attacker', labelEs: 'Atacante', x: 72, y: 84, color: '#ef4444', desc: 'You — the MITM', descEs: 'Vos — el MITM', toggleKey: 'spoof' },
];

const ALLOWED: [NodeId, NodeId][] = [
  ['internet', 'router'],
  ['router', 'switch'],
  ['switch', 'victim'],
  ['switch', 'attacker'],
];

const hasLink = (links: SimCable[], a: string, b: string) =>
  links.some((l) => (l.a === a && l.b === b) || (l.a === b && l.b === a));

const internetUp = (links: SimCable[]) =>
  hasLink(links, 'internet', 'router') && hasLink(links, 'router', 'switch');

const mitmState = (nodeId: string, links: SimCable[], toggles: Record<string, boolean>): SimNodeState => {
  const spoof = toggles['spoof'];
  const attackerOnLan = hasLink(links, 'attacker', 'switch');
  const up = internetUp(links);

  switch (nodeId) {
    case 'internet':
      return 'internet';
    case 'router':
      return hasLink(links, 'router', 'internet') ? 'internet' : 'none';
    case 'switch':
      return up ? 'internet' : 'none';
    case 'victim': {
      if (!hasLink(links, 'victim', 'switch')) return 'none';
      if (spoof && attackerOnLan && up) return 'blocked';
      return up ? 'internet' : 'lan';
    }
    case 'attacker':
      return attackerOnLan ? 'lan' : 'none';
    default:
      return 'none';
  }
};

export function NetworkMitmLab({ isEs }: { isEs: boolean }) {
  const config: SimConfig = {
    nodes: NODES,
    allowed: ALLOWED,
    toggleDefaults: { spoof: false },
    title: { es: 'SIMULADOR MITM (ARP SPOOF)', en: 'MITM SIMULATOR (ARP SPOOF)' },
    subtitle: {
      es: 'Vos sos el atacante: metete en la LAN, dale internet a la víctima y activá el ARP spoof para meter tu máquina en el medio.',
      en: "You're the attacker: get on the LAN, give the victim internet and flip the ARP spoof ON to step into the middle.",
    },
    success: {
      es: '¡Man-in-the-Middle logrado! El tráfico de la víctima sale por TU máquina. Sos el router para ella — podés leerlo y modificarlo.',
      en: 'Man-in-the-Middle achieved! The victim\'s traffic flows through YOUR machine. You are the router for her — you can read and modify it.',
    },
    legend: [
      { symbol: '●', color: '#10b981', es: 'Con internet (tráfico normal)', en: 'Has internet (normal traffic)' },
      { symbol: '⚠️', color: '#ef4444', es: 'Tráfico interceptado', en: 'Traffic intercepted' },
      { symbol: '🕵️', color: '#f59e0b', es: 'Atacante en la LAN', en: 'Attacker on the LAN' },
      { symbol: '○', color: '#4b5563', es: 'Sin cable', en: 'No cable' },
    ],
    // Cadena vertical: cada nodo se conecta con el vecino sin atravesar íconos
    port: (n, peer) => {
      if (n.id === 'internet') return { x: n.x, y: n.y + 4 };
      if (n.id === 'router') return peer?.id === 'internet' ? { x: n.x, y: n.y - 6 } : { x: n.x, y: n.y + 6 };
      if (n.id === 'switch') return peer?.id === 'router' ? { x: n.x, y: n.y - 6 } : { x: n.x, y: n.y + 4 };
      return { x: n.x, y: n.y - 6 };
    },
    state: mitmState,
    badge: (id, s, _links, toggles, es) => {
      const spoof = toggles['spoof'];
      if (id === 'victim') {
        if (s === 'blocked') return es ? '⚠️ vía atacante' : '⚠️ via attacker';
        if (s === 'internet') return '● internet';
        return s === 'lan' ? (es ? '● solo LAN' : '● LAN only') : (es ? '○ sin conexión' : '○ no cable');
      }
      if (id === 'attacker') {
        if (s === 'none') return es ? '○ fuera de la LAN' : '○ off the LAN';
        return spoof ? (es ? '🕵️ interceptando' : '🕵️ intercepting') : (es ? '🕵️ en la LAN' : '🕵️ on the LAN');
      }
      return s === 'internet'
        ? '● internet'
        : es ? '○ sin conexión' : '○ no cable';
    },
    winWhen: (links, toggles) => mitmState('victim', links, toggles) === 'blocked',
    warning: (links, toggles, es) => {
      const spoof = toggles['spoof'];
      const attackerOnLan = hasLink(links, 'attacker', 'switch');
      const victimOnline = mitmState('victim', links, toggles) === 'internet';
      if (spoof && !attackerOnLan) {
        return es
          ? 'El atacante no está en la LAN. Conectalo al switch — el ARP spoof solo funciona en la misma red que la víctima.'
          : 'The attacker is not on the LAN. Connect them to the switch — ARP spoofing only works on the same network as the victim.';
      }
      if (attackerOnLan && spoof && !victimOnline) {
        return es
          ? 'Activaste el spoof pero la víctima todavía no tiene internet. Dale al tráfico un camino que robar.'
          : 'Spoof is ON but the victim has no internet yet. Give the traffic a path to steal.';
      }
      if (attackerOnLan && !spoof && victimOnline) {
        return es
          ? 'Víctima online y atacante en la LAN. Activá el ARP spoof (botón ON) para robar el tráfico.'
          : 'Victim is online and the attacker is on the LAN. Flip the ARP spoof ON to hijack the traffic.';
      }
      return null;
    },
    stats: (links, toggles, es) => {
      const v = mitmState('victim', links, toggles);
      const a = mitmState('attacker', links, toggles);
      const victimLabel =
        v === 'blocked' ? (es ? '⚠️ interceptada' : '⚠️ intercepted')
        : v === 'internet' ? (es ? '✅ navega' : '✅ online')
        : v === 'lan' ? (es ? 'LAN only' : 'LAN only')
        : (es ? 'sin conexión' : 'no cable');
      return (
        <>
          <div className={v === 'blocked' ? 'text-red-400 font-bold' : v === 'internet' ? 'text-emerald-400' : 'text-gray-400'}>
            {es ? 'Víctima' : 'Victim'}: {victimLabel}
          </div>
          <div className={a === 'lan' ? 'text-amber-400' : 'text-gray-500'}>
            {es ? 'Atacante' : 'Attacker'}: {a === 'lan' ? (es ? '🕵️ en medio' : '🕵️ in the middle') : (es ? 'sin conexión' : 'no cable')}
          </div>
        </>
      );
    },
  };

  return <NetworkSimCore config={config} isEs={isEs} />;
}