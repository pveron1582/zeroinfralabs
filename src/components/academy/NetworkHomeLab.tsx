// ── components/academy/NetworkHomeLab.tsx ──────────────────────────
// Simulador de red doméstica: drag cables desde cada equipo hasta
// arriba. Roles: equipo → switch → router → [firewall] → internet.
// El firewall puede estar ON (bloquea) u OFF (deja pasar).
// Es un wrapper fino sobre el motor genérico NetworkSimCore.

import { NetworkSimCore } from './NetworkSimCore';
import type { SimConfig, SimNode, SimCable, SimNodeState } from './NetworkSimCore';

type NodeId = 'pc' | 'laptop' | 'server' | 'switch' | 'router' | 'firewall' | 'internet';

const NODES: SimNode[] = [
  { id: 'pc', icon: '🖥️', label: 'Desktop PC', labelEs: 'PC', x: 18, y: 88, color: '#a78bfa', desc: 'A workstation', descEs: 'Una estación de trabajo' },
  { id: 'laptop', icon: '💻', label: 'Laptop', labelEs: 'Laptop', x: 50, y: 90, color: '#a78bfa', desc: 'Portable computer', descEs: 'Compu portátil' },
  { id: 'server', icon: '🗄️', label: 'Server', labelEs: 'Servidor', x: 82, y: 88, color: '#a78bfa', desc: 'Archivos/web server', descEs: 'Servidor archivos/web' },
  { id: 'switch', icon: '🔌', label: 'Switch', labelEs: 'Switch', x: 50, y: 60, color: '#06b6d4', desc: 'Conecta la LAN', descEs: 'Conecta la LAN' },
  { id: 'router', icon: '📡', label: 'Router', labelEs: 'Router', x: 50, y: 28, color: '#10b981', desc: 'Salida a internet (gateway)', descEs: 'Salida a internet (gateway)' },
  { id: 'firewall', icon: '🛡️', label: 'Firewall', labelEs: 'Firewall', x: 72, y: 28, color: '#ef4444', desc: 'Filter: allow or deny', descEs: 'Filtro: permitir o denegar', toggleKey: 'firewall' },
  { id: 'internet', icon: '☁️', label: 'Internet', labelEs: 'Internet', x: 90, y: 28, color: '#f59e0b', desc: 'The world out there', descEs: 'El mundo allá afuera' },
];

const ALLOWED: [NodeId, NodeId][] = [
  ['pc', 'switch'], ['laptop', 'switch'], ['server', 'switch'],
  ['switch', 'router'],
  ['router', 'firewall'],
  ['firewall', 'internet'],
];

const DEVICES: NodeId[] = ['pc', 'laptop', 'server'];

// Lógica transversal: hay cable entre a y b?
const hasLink = (links: SimCable[], a: string, b: string) =>
  links.some((l) => (l.a === a && l.b === b) || (l.a === b && l.b === a));

const homeState = (
  nodeId: string,
  links: SimCable[],
  toggles: Record<string, boolean>,
): SimNodeState => {
  const firewallOn = toggles['firewall'];
  const canReach = hasLink(links, 'router', 'firewall') && hasLink(links, 'firewall', 'internet') && firewallOn;

  switch (nodeId) {
    case 'internet':
      return 'internet';
    case 'firewall':
      return hasLink(links, 'firewall', 'internet') ? (firewallOn ? 'internet' : 'blocked') : 'none';
    case 'router':
      return canReach ? 'internet' : 'none';
    case 'switch':
      return hasLink(links, 'switch', 'router')
        ? (canReach ? 'internet' : 'lan')
        : 'none';
    default:
      if (!hasLink(links, nodeId, 'switch')) return 'none';
      if (canReach && hasLink(links, 'switch', 'router')) return 'internet';
      return 'lan';
  }
};

export function NetworkHomeLab({ isEs }: { isEs: boolean }) {
  const config: SimConfig = {
    nodes: NODES,
    allowed: ALLOWED,
    toggleDefaults: { firewall: true },
    title: { es: 'SIMULADOR DE RED', en: 'NETWORK SIMULATOR' },
    subtitle: {
      es: 'Arrastrá cables de cada equipo hasta la nube. Objetivo: todos con internet y el firewall ON.',
      en: 'Drag cables from each device up to the cloud. Goal: all have internet and the firewall ON.',
    },
    success: {
      es: '¡Toda la red tiene internet y el firewall protege el perímetro!',
      en: 'The whole network has internet AND the firewall protects the perimeter!',
    },
    legend: [
      { symbol: '●', color: '#10b981', es: 'Internet llega', en: 'Internet reaching' },
      { symbol: '●', color: '#f59e0b', es: 'Solo LAN (sin internet)', en: 'LAN only (no internet)' },
      { symbol: '✕', color: '#ef4444', es: 'Firewall bloquea (OFF)', en: 'Firewall blocks (OFF)' },
      { symbol: '○', color: '#4b5563', es: 'Sin cable', en: 'No cable' },
    ],
    // Firewall e internet se conectan por la izquierda; el resto desde abajo
    port: (n) =>
      n.id === 'internet' || n.id === 'firewall'
        ? { x: n.x - 10, y: n.y }
        : { x: n.x, y: n.y + 4 },
    state: homeState,
    badge: (_id, s) => {
      if (_id === 'firewall' && s === 'blocked') return isEs ? '✕ firewall off' : '✕ firewall off';
      return s === 'internet'
        ? '● internet'
        : s === 'lan'
          ? isEs ? '● solo LAN' : '● LAN only'
          : isEs ? '○ sin conexión' : '○ no cable';
    },
    winWhen: (links, toggles) => {
      const fwOn = toggles['firewall'];
      const withInternet = DEVICES.filter((d) => homeState(d, links, toggles) === 'internet').length;
      return withInternet === DEVICES.length && fwOn;
    },
    warning: (links, toggles, es) => {
      // Todo cableado pero el firewall apagado = red expuesta.
      // (Con el firewall OFF los equipos pierden el estado "internet".
      //  Por eso miramos el cableado, no hasInternet()).
      const wired =
        DEVICES.every((d) => hasLink(links, d, 'switch')) &&
        hasLink(links, 'switch', 'router') &&
        hasLink(links, 'router', 'firewall') &&
        hasLink(links, 'firewall', 'internet');
      if (!toggles['firewall'] && wired) {
        return es
          ? 'Tienen internet pero sin firewall — la red está expuesta. Activá el firewall.'
          : 'They have internet but NO firewall — the network is exposed. Turn the firewall ON.';
      }
      return null;
    },
    stats: (links, toggles, es) => {
      const onLan = DEVICES.filter((d) => homeState(d, links, toggles) === 'lan').length;
      const withInternet = DEVICES.filter((d) => homeState(d, links, toggles) === 'internet').length;
      return (
        <>
          <div className="text-gray-400">{es ? 'En LAN' : 'On LAN'}: {onLan}/3</div>
          <div className={withInternet === 3 ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
            {es ? 'Con internet' : 'With internet'}: {withInternet}/3
          </div>
          <div className={toggles['firewall'] ? 'text-red-400' : 'text-gray-500'}>
            {es ? 'Firewall' : 'Firewall'}: {toggles['firewall'] ? 'ON 🔒' : 'OFF ⚠️'}
          </div>
        </>
      );
    },
  };

  return <NetworkSimCore config={config} isEs={isEs} />;
}