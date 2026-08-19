// ── components/academy/NetworkTopologyLab.tsx ──────────────────────
// Simulador de topologías estilo packet-tracer: se elige el tipo de
// cable (cobre / fibra / WiFi) y se arrastra entre equipos. Reglas
// reales: la PC va al switch por cobre, el servidor por fibra, el AP
// cuelga del switch y da WiFi a laptop y celular. Wrapper fino sobre
// el motor genérico NetworkSimCore.

import { NetworkSimCore } from './NetworkSimCore';
import type { SimConfig, SimNode, SimCable, SimCableType, SimNodeState } from './NetworkSimCore';

type NodeId = 'internet' | 'router' | 'switch' | 'ap' | 'pc' | 'laptop' | 'server' | 'phone';

const CABLE_TYPES: SimCableType[] = [
  { id: 'copper', icon: '🟧', label: 'Copper (RJ45)', labelEs: 'Cobre (RJ45)', color: '#f59e0b' },
  { id: 'fiber', icon: '🟦', label: 'Fiber optic', labelEs: 'Fibra óptica', color: '#06b6d4' },
  { id: 'wifi', icon: '📶', label: 'WiFi', labelEs: 'WiFi', color: '#a78bfa', dash: '4,4' },
];

const NODES: SimNode[] = [
  { id: 'internet', icon: '☁️', label: 'Internet', labelEs: 'Internet', x: 12, y: 12, color: '#f59e0b', desc: 'The world out there', descEs: 'El mundo allá afuera' },
  { id: 'router', icon: '📡', label: 'Router', labelEs: 'Router', x: 50, y: 12, color: '#10b981', desc: 'Layer 3: joins networks', descEs: 'Capa 3: une redes' },
  { id: 'switch', icon: '🔌', label: 'Switch', labelEs: 'Switch', x: 50, y: 44, color: '#06b6d4', desc: 'Layer 2: builds the LAN', descEs: 'Capa 2: arma la LAN' },
  { id: 'ap', icon: '📶', label: 'AP WiFi', labelEs: 'AP WiFi', x: 86, y: 44, color: '#a78bfa', desc: 'Wireless access point', descEs: 'Punto de acceso inalámbrico' },
  { id: 'pc', icon: '🖥️', label: 'PC', labelEs: 'PC', x: 14, y: 86, color: '#a78bfa', desc: 'Desktop workstation (RJ45)', descEs: 'Escritorio (RJ45)' },
  { id: 'laptop', icon: '💻', label: 'Laptop', labelEs: 'Laptop', x: 38, y: 86, color: '#a78bfa', desc: 'Cable or WiFi', descEs: 'Cable o WiFi' },
  { id: 'server', icon: '🗄️', label: 'Server', labelEs: 'Servidor', x: 62, y: 86, color: '#a78bfa', desc: 'Fiber SFP card', descEs: 'Placa de fibra SFP' },
  { id: 'phone', icon: '📱', label: 'Phone', labelEs: 'Celular', x: 86, y: 86, color: '#a78bfa', desc: 'WiFi only', descEs: 'Solo WiFi' },
];

const ALLOWED: [NodeId, NodeId][] = [
  ['internet', 'router'],
  ['router', 'switch'],
  ['switch', 'ap'],
  ['pc', 'switch'],
  ['laptop', 'switch'],
  ['server', 'switch'],
  ['laptop', 'ap'],
  ['phone', 'ap'],
];

// Cada conexión permitida acepta solo ciertos tipos de cable.
const CABLE_RULES: SimConfig['cableRules'] = [
  { a: 'internet', b: 'router', only: ['copper'], wrongEs: 'La conexión del proveedor llega al puerto WAN del router por cable de cobre.', wrongEn: "The provider's link reaches the router's WAN port over copper." },
  { a: 'router', b: 'switch', only: ['copper', 'fiber'] },
  { a: 'switch', b: 'ap', only: ['copper'], wrongEs: 'El AP se cuelga del switch con cobre UTP (normalmente PoE: el cable lo alimenta).', wrongEn: 'The AP hangs off the switch over copper UTP (usually PoE: the cable powers it).' },
  { a: 'pc', b: 'switch', only: ['copper'], wrongEs: 'La PC tiene una placa con puerto RJ45: va con cable de cobre.', wrongEn: 'The PC has an RJ45 network card: it goes over copper.' },
  { a: 'laptop', b: 'switch', only: ['copper'], wrongEs: 'Al switch se llega por cable de cobre; el WiFi lo da el AP.', wrongEn: 'You reach the switch over copper; WiFi comes from the AP.' },
  { a: 'server', b: 'switch', only: ['fiber'], wrongEs: 'El servidor del lab usa placa de fibra SFP: más velocidad, más distancia.', wrongEn: 'The lab server uses a fiber SFP card: more speed, more distance.' },
  { a: 'laptop', b: 'ap', only: ['wifi'], wrongEs: 'La laptop se asocia al AP por WiFi, sin cable.', wrongEn: 'The laptop associates to the AP over WiFi, no cable.' },
  { a: 'phone', b: 'ap', only: ['wifi'], wrongEs: 'El celular no tiene puerto de red: solo entra por WiFi.', wrongEn: 'The phone has no network port: it joins over WiFi only.' },
];

const DEVICES: NodeId[] = ['pc', 'server', 'laptop', 'phone'];

const hasLink = (links: SimCable[], a: string, b: string) =>
  links.some((l) => (l.a === a && l.b === b) || (l.a === b && l.b === a));

const topologyState = (nodeId: string, links: SimCable[]): SimNodeState => {
  const internetUp = hasLink(links, 'router', 'internet');
  const switchUp = internetUp && hasLink(links, 'switch', 'router');
  const apUp = switchUp && hasLink(links, 'ap', 'switch');

  switch (nodeId) {
    case 'internet':
      return 'internet';
    case 'router':
      return internetUp ? 'internet' : 'none';
    case 'switch':
      return hasLink(links, 'switch', 'router') ? (switchUp ? 'internet' : 'lan') : 'none';
    case 'ap':
      return hasLink(links, 'ap', 'switch') ? (apUp ? 'internet' : 'lan') : 'none';
    case 'laptop': {
      if (hasLink(links, 'laptop', 'ap') && apUp) return 'internet';
      const wired = hasLink(links, 'laptop', 'switch');
      if (wired) return switchUp ? 'internet' : 'lan';
      if (hasLink(links, 'laptop', 'ap')) return 'lan';
      return 'none';
    }
    case 'phone':
      return hasLink(links, 'phone', 'ap') ? (apUp ? 'internet' : 'lan') : 'none';
    default: // pc, server
      return hasLink(links, nodeId, 'switch') ? (switchUp ? 'internet' : 'lan') : 'none';
  }
};

export function NetworkTopologyLab({ isEs }: { isEs: boolean }) {
  const config: SimConfig = {
    nodes: NODES,
    allowed: ALLOWED,
    cableTypes: CABLE_TYPES,
    cableRules: CABLE_RULES,
    height: 440,
    title: { es: 'ARMÁ LA TOPOLOGÍA', en: 'BUILD THE TOPOLOGY' },
    subtitle: {
      es: 'Elegí el cable correcto (cobre, fibra o WiFi) y arrastrá entre equipos hasta que todos tengan internet.',
      en: 'Pick the right cable (copper, fiber or WiFi) and drag between devices until everyone has internet.',
    },
    success: {
      es: '¡Topología perfecta! Cobre para los equipos, fibra para el servidor, y WiFi para lo que se mueve.',
      en: 'Perfect topology! Copper for the devices, fiber for the server, and WiFi for what moves.',
    },
    legend: [
      { symbol: '—', color: '#f59e0b', es: 'Cable de cobre', en: 'Copper cable' },
      { symbol: '—', color: '#06b6d4', es: 'Fibra óptica', en: 'Fiber optic' },
      { symbol: '~', color: '#a78bfa', es: 'WiFi', en: 'WiFi' },
      { symbol: '●', color: '#10b981', es: 'Con internet', en: 'Has internet' },
      { symbol: '●', color: '#f59e0b', es: 'Solo LAN', en: 'LAN only' },
      { symbol: '○', color: '#4b5563', es: 'Sin conexión', en: 'Not connected' },
    ],
    port: (n) => {
      if (n.id === 'internet') return { x: n.x + 9, y: n.y };
      if (n.id === 'ap') return { x: n.x - 9, y: n.y };
      return { x: n.x, y: n.y + 4 };
    },
    state: topologyState,
    winWhen: (links) => DEVICES.every((d) => topologyState(d, links) === 'internet'),
    stats: (links, _toggles, es) => {
      const wired = DEVICES.filter((d) => hasLink(links, d, 'switch')).length;
      const wireless = DEVICES.filter((d) => hasLink(links, d, 'ap')).length;
      const online = DEVICES.filter((d) => topologyState(d, links) === 'internet').length;
      return (
        <>
          <div className="text-gray-400">{es ? 'Por cable' : 'Wired'}: {wired}</div>
          <div className="text-gray-400">WiFi: {wireless}</div>
          <div className={online === DEVICES.length ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
            {es ? 'Con internet' : 'With internet'}: {online}/{DEVICES.length}
          </div>
        </>
      );
    },
  };

  return <NetworkSimCore config={config} isEs={isEs} />;
}
