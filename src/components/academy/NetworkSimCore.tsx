// ── components/academy/NetworkSimCore.tsx ───────────────────────────
// Motor genérico de simulador de red: canvas con drag&drop de cables,
// nodos con estado (internet / LAN / bloqueado / sin conexión), toggles
// ON/OFF (firewall, ARP spoof), animación de paquetes, leyenda, stats,
// banners de éxito/advertencia y reset.
//
// Los labs concretos (NetworkHomeLab, NetworkDMZLab, NetworkMitmLab)
// son wrappers finos que solo aportan la config: nodos, zonas, conexiones
// permitidas, lógica de estado, textos y stats.

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

const MONO_FONT = "'Cascadia Code','Fira Code','Consolas',monospace";

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

export function NetworkSimCore({ config, isEs }: { config: SimConfig; isEs: boolean }) {
  const { nodes, allowed, zones } = config;
  const byId: Record<string, SimNode> = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const port = config.port ?? ((n: SimNode) => ({ x: n.x, y: n.y + 4 }));
  const [links, setLinks] = useState<SimCable[]>([]);
  const [cableType, setCableType] = useState<string>(() => config.cableTypes?.[0]?.id ?? '');
  const [toggles, setToggles] = useState<Record<string, boolean>>(() => {
    const t: Record<string, boolean> = {};
    for (const n of nodes) if (n.toggleKey) t[n.toggleKey] = config.toggleDefaults?.[n.toggleKey] ?? true;
    return t;
  });
  const [dragging, setDragging] = useState<{ from: string; x: number; y: number } | null>(null);
  const [message, setMessage] = useState<{ es: string; en: string } | null>(null);
  const [pinging, setPinging] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 640, h: 480 });

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const has = (a: string, b: string) =>
    links.some((l) => (l.a === a && l.b === b) || (l.a === b && l.b === a));

  const nodeState = (id: string) => config.state(id, links, toggles);
  const activeCable = (a: string, b: string) =>
    nodeState(a) === 'internet' && nodeState(b) === 'internet';

  const badgeText = (n: SimNode, s: SimNodeState) =>
    config.badge
      ? config.badge(n.id, s, links, toggles, isEs)
      : s === 'internet'
        ? '● internet'
        : s === 'lan'
          ? isEs ? '● solo LAN' : '● LAN only'
          : s === 'blocked'
            ? isEs ? '✕ bloqueado' : '✕ blocked'
            : isEs ? '○ sin conexión' : '○ no cable';

  const displayColor = (s: SimNodeState, fallback: string) =>
    s === 'internet' ? '#10b981' : s === 'lan' ? '#f59e0b' : s === 'blocked' ? '#ef4444' : fallback;

  const handleNodeMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    const fallback = byId[nodeId];
    const rawX = rect ? ((e.clientX - rect.left) / rect.width) * 100 : NaN;
    const rawY = rect ? ((e.clientY - rect.top) / rect.height) * 100 : NaN;
    setDragging({
      from: nodeId,
      x: Number.isFinite(rawX) ? Math.min(100, Math.max(0, rawX)) : fallback.x,
      y: Number.isFinite(rawY) ? Math.min(100, Math.max(0, rawY)) : fallback.y,
    });
    setMessage(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * 100;
    const rawY = ((e.clientY - rect.top) / rect.height) * 100;
    setDragging({
      ...dragging,
      x: Number.isFinite(rawX) ? Math.min(100, Math.max(0, rawX)) : dragging.x,
      y: Number.isFinite(rawY) ? Math.min(100, Math.max(0, rawY)) : dragging.y,
    });
  };

  const handleNodeMouseUp = (nodeId: string) => {
    if (!dragging) return;
    const from = dragging.from;
    setDragging(null);
    if (from === nodeId) return;

    const isAllowed = allowed.some(([a, b]) =>
      (a === from && b === nodeId) || (a === nodeId && b === from)
    );
    if (!isAllowed) {
      setMessage({
        es: `No podés conectar ${byId[from].labelEs} directamente a ${byId[nodeId].labelEs}. Seguí la topología que muestra el simulador.`,
        en: `You can't connect ${byId[from].label} directly to ${byId[nodeId].label}. Follow the topology shown in the simulator.`,
      });
      return;
    }

    // Con selector de cables activo: validar el tipo elegido para esta conexión.
    if (config.cableRules && config.cableTypes) {
      const rule = config.cableRules.find(
        (r) => (r.a === from && r.b === nodeId) || (r.a === nodeId && r.b === from)
      );
      if (rule && !rule.only.includes(cableType)) {
        const chosen = config.cableTypes.find((t) => t.id === cableType);
        setMessage({
          es: rule.wrongEs ?? `${byId[from].labelEs} no se puede unir a ${byId[nodeId].labelEs} con ${chosen?.labelEs ?? 'ese cable'}. Probá el cable correcto.`,
          en: rule.wrongEn ?? `You can't join ${byId[from].label} to ${byId[nodeId].label} with ${chosen?.label ?? 'that cable'}. Try the right cable.`,
        });
        return;
      }
    }

    if (has(from, nodeId)) {
      setLinks(links.filter((l) => !((l.a === from && l.b === nodeId) || (l.a === nodeId && l.b === from))));
    } else {
      setLinks([...links, { a: from, b: nodeId, type: config.cableTypes ? cableType : undefined }]);
    }
  };

  const handleCanvasMouseUp = () => { if (dragging) setDragging(null); };
  const simulatePing = (nodeId: string) => { setPinging(nodeId); setTimeout(() => setPinging(null), 2000); };

  const won = config.winWhen(links, toggles);
  const warning = config.warning?.(links, toggles, isEs) ?? null;

  const reset = () => {
    setLinks([]);
    setMessage(null);
    const t: Record<string, boolean> = {};
    for (const n of nodes) if (n.toggleKey) t[n.toggleKey] = config.toggleDefaults?.[n.toggleKey] ?? true;
    setToggles(t);
  };

  const px = (v: number) => (size.w * v) / 100;
  const py = (v: number) => (size.h * v) / 100;

  return (
    <div
      className="rounded-xl overflow-hidden border shadow-2xl select-none"
      style={{ borderColor: '#1e293b', background: '#0a0f16', fontFamily: MONO_FONT }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 gap-3 flex-wrap bg-slate-900/95 border-b border-slate-800/80">
        <div>
          <div className="text-xs font-bold tracking-widest uppercase text-emerald-400">🧪 {isEs ? config.title.es : config.title.en}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {isEs ? config.subtitle.es : config.subtitle.en}
          </p>
        </div>
        <div className="text-right text-[11px] space-y-0.5">
          {config.stats(links, toggles, isEs)}
        </div>
      </div>

      <div className="p-4">

      {/* Selector de cable (labs tipo packet-tracer) */}
      {config.cableTypes && (
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-[9px] uppercase tracking-widest" style={{ color: '#6b7280' }}>
            {isEs ? 'Cable elegido:' : 'Chosen cable:'}
          </span>
          {config.cableTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => setCableType(t.id)}
              data-testid={`cable-${t.id}`}
              className="text-[10px] px-2.5 py-1 rounded-lg font-bold transition-all"
              style={{
                background: cableType === t.id ? `${t.color}26` : '#0d1117',
                color: cableType === t.id ? t.color : '#6b7280',
                border: `1px solid ${cableType === t.id ? t.color : '#1c2a2a'}`,
              }}
            >
              {t.icon} {isEs ? t.labelEs : t.label}
            </button>
          ))}
        </div>
      )}

      {/* Canvas */}
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

      {/* Leyenda */}
      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-0.5 text-[9px]" style={{ color: '#6b7280' }}>
        {config.legend.map((item) => (
          <div key={`${item.symbol}-${item.color}`}>
            <span style={{ color: item.color }}>{item.symbol}</span> {isEs ? item.es : item.en}
          </div>
        ))}
      </div>

      {/* Mensaje de error */}
      {message && (
        <div className="mt-2 p-2 rounded-lg text-xs" style={{ background: '#f59e0b10', border: '1px solid #f59e0b30', color: '#f59e0b' }}>
          {isEs ? message.es : message.en}
        </div>
      )}

      {/* Éxito / advertencia */}
      {won && (
        <div className="mt-2 p-3 rounded-lg text-sm text-center font-bold" style={{ background: '#10b98120', border: '1px solid #10b98150', color: '#10b981' }}>
          🎉 {isEs ? config.success.es : config.success.en}
        </div>
      )}
      {!won && warning && (
        <div className="mt-2 p-3 rounded-lg text-xs text-center" style={{ background: '#f59e0b10', border: '1px solid #f59e0b30', color: '#f59e0b' }}>
          ⚠️ {warning}
        </div>
      )}

      {/* Botón reset */}
      <button
        onClick={reset}
        className="mt-3 text-[10px] px-3 py-1.5 rounded text-gray-500 hover:text-gray-300 transition-all"
        style={{ border: '1px solid #1c2a2a' }}
      >
        {isEs ? '↺ Reiniciar topología' : '↺ Reset topology'}
      </button>
      </div>
    </div>
  );
}
