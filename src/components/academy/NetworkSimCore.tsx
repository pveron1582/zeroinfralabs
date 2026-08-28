// ── components/academy/NetworkSimCore.tsx ───────────────────────────
// Motor genérico de simulador de red: canvas con drag&drop de cables,
// nodos con estado (internet / LAN / bloqueado / sin conexión), toggles
// ON/OFF (firewall, ARP spoof), animación de paquetes, leyenda, stats,
// banners de éxito/advertencia y reset.
//
// Los labs concretos (NetworkHomeLab, NetworkDMZLab, NetworkMitmLab)
// son wrappers finos que solo aportan la config: nodos, zonas, conexiones
// permitidas, lógica de estado, textos y stats.
//
// Los tipos viven en ./networkSimTypes.ts (mantienen este archivo <300 líneas).

import { useEffect, useRef, useState } from 'react';
import type { SimCable, SimConfig, SimNode, SimNodeState } from './networkSimTypes';
import { SimCanvas } from './SimCanvas';

const MONO_FONT = "'Cascadia Code','Fira Code','Consolas',monospace";

// Re-export de tipos para compatibilidad con los labs que importan desde NetworkSimCore
export type { SimNodeState, SimCable, SimConfig, SimNode, SimCableType, SimZone } from './networkSimTypes';

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
      <SimCanvas
        config={config}
        isEs={isEs}
        zones={zones}
        nodes={nodes}
        links={links}
        byId={byId}
        port={port}
        px={px}
        py={py}
        dragging={dragging}
        cableType={cableType}
        pinging={pinging}
        toggles={toggles}
        setToggles={setToggles}
        nodeState={nodeState}
        activeCable={activeCable}
        badgeText={badgeText}
        displayColor={displayColor}
        handleNodeMouseDown={handleNodeMouseDown}
        handleMouseMove={handleMouseMove}
        handleNodeMouseUp={handleNodeMouseUp}
        handleCanvasMouseUp={handleCanvasMouseUp}
        simulatePing={simulatePing}
        canvasRef={canvasRef}
      />

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
