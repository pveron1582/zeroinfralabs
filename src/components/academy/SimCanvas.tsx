// ── components/academy/SimCanvas.tsx ───────────────────────────────
// Canvas del simulador de red: zonas (DMZ/LAN), cables SVG con
// animación de paquetes, nodos con drag&drop, toggles ON/OFF y ping.
// Extraído de NetworkSimCore.tsx para mantener el motor <300 líneas.

import type { SimCable, SimConfig, SimNode, SimNodeState, SimZone } from './networkSimTypes';

export interface SimCanvasProps {
  config: SimConfig;
  isEs: boolean;
  zones?: SimZone[];
  nodes: SimNode[];
  links: SimCable[];
  byId: Record<string, SimNode>;
  port: (node: SimNode, peer?: SimNode) => { x: number; y: number };
  px: (v: number) => number;
  py: (v: number) => number;
  dragging: { from: string; x: number; y: number } | null;
  cableType: string;
  pinging: string | null;
  toggles: Record<string, boolean>;
  setToggles: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  nodeState: (id: string) => SimNodeState;
  activeCable: (a: string, b: string) => boolean;
  badgeText: (node: SimNode, s: SimNodeState) => string;
  displayColor: (s: SimNodeState, fallback: string) => string;
  handleNodeMouseDown: (nodeId: string, e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleNodeMouseUp: (nodeId: string) => void;
  handleCanvasMouseUp: () => void;
  simulatePing: (nodeId: string) => void;
  canvasRef: React.RefObject<HTMLDivElement>;
}

export function SimCanvas(props: SimCanvasProps) {
  const {
    config, isEs, zones, nodes, links, byId, port, px, py,
    dragging, cableType, pinging, toggles, setToggles,
    nodeState, activeCable, badgeText, displayColor,
    handleNodeMouseDown, handleMouseMove, handleNodeMouseUp,
    handleCanvasMouseUp, simulatePing, canvasRef,
  } = props;

  return (
    <div
      ref={canvasRef}
      className="relative w-full rounded-lg overflow-hidden"
      style={{
        height: config.height ?? 480,
        background: '#050a08',
        border: '1px solid #1c2a2a',
        cursor: dragging ? 'crosshair' : 'default',
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleCanvasMouseUp}
      onMouseLeave={handleCanvasMouseUp}
    >
      {/* Zonas (DMZ, LAN, etc.) */}
      {zones?.map((z) => (
        <div
          key={z.id}
          className="absolute rounded-lg text-center"
          style={{
            left: `${z.x}%`,
            top: `${z.y}%`,
            width: `${z.w}%`,
            height: `${z.h}%`,
            background: z.bg,
            border: `1px dashed ${z.border}`,
          }}
        >
          <div className="text-[9px] font-bold mt-1" style={{ color: z.color }}>
            {isEs ? z.labelEs : z.label}
          </div>
        </div>
      ))}

      {/* Cables SVG */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
        {links.map((l, i) => {
          const active = activeCable(l.a, l.b);
          const typeColor = config.cableTypes?.find((t) => t.id === l.type)?.color;
          const inactiveColor = typeColor ? `${typeColor}90` : '#4b5563';
          const inactiveDash = config.cableTypes?.find((t) => t.id === l.type)?.dash ?? '5,3';
          return (
            <g key={i}>
              <line
                x1={`${port(byId[l.a], byId[l.b]).x}%`} y1={`${port(byId[l.a], byId[l.b]).y}%`}
                x2={`${port(byId[l.b], byId[l.a]).x}%`} y2={`${port(byId[l.b], byId[l.a]).y}%`}
                stroke={active ? (typeColor ?? '#10b981') : inactiveColor}
                strokeWidth={active ? 2.5 : 1.5}
                strokeDasharray={active ? 'none' : inactiveDash}
                opacity="0.85"
              />
              {active && (
                <circle r="2.5" fill={typeColor ?? '#10b981'}>
                  <animateMotion
                    dur="1.4s"
                    repeatCount="indefinite"
                    path={`M ${px(port(byId[l.a], byId[l.b]).x)},${py(port(byId[l.a], byId[l.b]).y)} L ${px(port(byId[l.b], byId[l.a]).x)},${py(port(byId[l.b], byId[l.a]).y)}`}
                  />
                </circle>
              )}
            </g>
          );
        })}
        {dragging && (
          <line
            x1={`${port(byId[dragging.from]).x}%`}
            y1={`${port(byId[dragging.from]).y}%`}
            x2={`${dragging.x}%`}
            y2={`${dragging.y}%`}
            stroke={config.cableTypes?.find((t) => t.id === cableType)?.color ?? '#06b6d4'}
            strokeWidth={2}
            strokeDasharray="6,4"
            opacity="0.9"
          />
        )}
      </svg>

      {/* Nodos */}
      {nodes.map((node) => {
        const s = nodeState(node.id);
        const pingingThis = pinging === node.id;
        const toggleOn = node.toggleKey ? toggles[node.toggleKey] : true;
        const display = displayColor(s, node.color);

        return (
          <div
            key={node.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 text-center"
            style={{ left: `${node.x}%`, top: `${node.y}%`, pointerEvents: 'auto' }}
            data-testid={`node-${node.id}`}
          >
            <div
              className="rounded-xl p-2.5 cursor-pointer transition-all hover:scale-110 relative"
              data-testid={`handle-${node.id}`}
              style={{
                background: s === 'internet'
                  ? 'rgba(16,185,129,0.15)'
                  : s === 'lan'
                    ? 'rgba(245,158,11,0.10)'
                    : '#0d1117',
                border: `2px solid ${display}`,
                boxShadow: s === 'internet'
                  ? '0 0 18px rgba(16,185,129,0.5), 0 0 4px #10b981'
                  : s === 'lan'
                    ? '0 0 12px rgba(245,158,11,0.3)'
                    : '0 2px 8px rgba(0,0,0,0.4)',
                animation: pingingThis ? 'ping 1s ease-in-out' : undefined,
              }}
              onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
              onMouseUp={() => handleNodeMouseUp(node.id)}
              title={isEs ? node.descEs : node.desc}
            >
              <div style={{ fontSize: 22, lineHeight: 1 }}>{node.icon}</div>
              <div className="text-[9px] font-bold mt-1" style={{ color: display }}>
                {isEs ? node.labelEs : node.label}
              </div>
              <div className="text-[8px] mt-0.5" style={{ color: s === 'none' ? '#4b5563' : display }}>
                {badgeText(node, s)}
              </div>
              {node.toggleKey && (
                <button
                  onClick={(e) => { e.stopPropagation(); setToggles({ ...toggles, [node.toggleKey!]: !toggleOn }); }}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="mt-1 text-[8px] px-1.5 py-0.5 rounded font-bold transition-all"
                  style={{
                    background: toggleOn ? '#ef4444' : '#4b5563',
                    color: '#fff',
                    border: 'none',
                    pointerEvents: 'auto',
                  }}
                >
                  {toggleOn ? 'ON' : 'OFF'}
                </button>
              )}
            </div>
            <button
              onClick={() => simulatePing(node.id)}
              className="mt-0.5 text-[8px] px-1.5 py-0.5 rounded text-gray-500 hover:text-cyan-300"
              style={{ background: 'rgba(13,17,23,0.7)', border: '1px solid #1c2a2a', pointerEvents: 'auto' }}
            >
              ping
            </button>
          </div>
        );
      })}

      <style>{`
        @keyframes ping {
          0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.6); }
          100% { box-shadow: 0 0 0 18px rgba(16,185,129,0); }
        }
      `}</style>

      {/* Instrucción durante drag */}
      {dragging && (
        <div
          className="absolute text-[9px] px-2 py-1 rounded text-cyan-300 pointer-events-none"
          style={{
            left: `${dragging.x}%`,
            top: `calc(${dragging.y}% + 14px)`,
            background: '#0d1117',
            border: '1px solid #06b6d440',
          }}
        >
          {isEs ? 'soltá sobre el destino' : 'drop on target'}
        </div>
      )}
    </div>
  );
}
