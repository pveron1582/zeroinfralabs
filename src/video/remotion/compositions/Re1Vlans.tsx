// ── video/remotion/compositions/Re1Vlans.tsx ───────────────────────
// Video: VLANs — segmentación por diseño.
// Lección networksI-05 del Academy (Redes I). Guiones: voicebox-scripts/{es,en}/networksI/networksI-05-*.txt
// Audio real cargado: timings de audioTimings.ts; syncs internos alineados
// a silencedetect (-50dB) de voicebox-scripts/{es,en}/networksI/networksI-05-scene*.wav.
// Versión unificada ES/EN con `lang` prop.

import React from 'react';
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { sceneStartFrames, audioTimings, audioBase, hasAudio } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
import { TitleScene } from '../primitives/TitleScene';
import { RevealLine } from '../primitives/RevealLine';
import { TerminalWindow } from '../primitives/TerminalWindow';

const CENTERED: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  textAlign: 'center',
};

// ── COPY ────────────────────────────────────────────────────────────
const COPY = {
  es: {
    s1: {
      title: <>¿QUÉ ES UNA <span style={{ color: THEME.purple }}>VLAN</span>?</>,
      subtitle: 'una red lógica dentro de la física',
      depts: [
        { icon: '💰', name: 'CONTABILIDAD' },
        { icon: '🖥️', name: 'SERVIDORES' },
        { icon: '📹', name: 'CÁMARAS' },
        { icon: '📱', name: 'INVITADOS' },
      ],
      points: [
        'grupo de puertos que se comporta como su propio switch',
        'sin un router que deje cruzar, no se hablan',
      ],
    },
    s2: {
      heading: <>DECIDÍS EL MAPA <span style={{ color: THEME.cyan }}>ANTES</span> DE QUE PASE NADA</>,
      plans: [
        { name: 'VLAN 10', desc: 'empleados' },
        { name: 'VLAN 20', desc: 'servidores' },
        { name: 'VLAN 30', desc: 'cámaras / IoT' },
        { name: 'VLAN 40', desc: 'invitados' },
      ],
      broadcast: 'CADA BROADCAST SE QUEDA EN SU PROPIA VLAN',
      broadcastSub: 'cien equipos por VLAN = cuatro dominios chicos, no uno gigante',
    },
    s3: {
      heading: <>EL <span style={{ color: THEME.purple }}>TAG 802.1Q</span>: 4 BYTES QUE DICEN EL PISO</>,
      vlanRows: [
        { name: '10', label: 'EMPLEADOS', color: THEME.cyan },
        { name: '20', label: 'SERVIDORES', color: THEME.green },
        { name: '30', label: 'CAMARAS', color: THEME.amber },
        { name: '40', label: 'INVITADOS', color: THEME.red },
      ],
      points: [
        'contención: el atacante queda en su propio segmento',
        'segmentación, no cifrado: el VLAN hopping intenta saltar',
      ],
      closeTitle: <>VLAN: <span style={{ color: THEME.purple }}>PAREDES</span> DENTRO DEL SWITCH</>,
      closeSubtitle: 'sin mover un solo cable',
    },
  },
  en: {
    s1: {
      title: <>WHAT IS A <span style={{ color: THEME.purple }}>VLAN</span>?</>,
      subtitle: 'a logical network on top of the physical one',
      depts: [
        { icon: '💰', name: 'ACCOUNTING' },
        { icon: '🖥️', name: 'SERVERS' },
        { icon: '📹', name: 'CAMERAS' },
        { icon: '📱', name: 'GUESTS' },
      ],
      points: [
        'a group of ports that behaves like its own switch',
        "without a router letting traffic cross, they can't talk",
      ],
    },
    s2: {
      heading: <>YOU DECIDE THE MAP <span style={{ color: THEME.cyan }}>BEFORE</span> ANYTHING HAPPENS</>,
      plans: [
        { name: 'VLAN 10', desc: 'employees' },
        { name: 'VLAN 20', desc: 'servers' },
        { name: 'VLAN 30', desc: 'cameras / IoT' },
        { name: 'VLAN 40', desc: 'guests' },
      ],
      broadcast: 'EVERY BROADCAST STAYS INSIDE ITS OWN VLAN',
      broadcastSub: 'a hundred machines per VLAN = four small domains, not one giant one',
    },
    s3: {
      heading: <>THE <span style={{ color: THEME.purple }}>802.1Q TAG</span>: 4 BYTES THAT NAME THE FLOOR</>,
      vlanRows: [
        { name: '10', label: 'EMPLOYEES', color: THEME.cyan },
        { name: '20', label: 'SERVERS', color: THEME.green },
        { name: '30', label: 'CAMERAS', color: THEME.amber },
        { name: '40', label: 'GUESTS', color: THEME.red },
      ],
      points: [
        'containment: the attacker stays in their own segment',
        'segmentation, not encryption: VLAN hopping tries to jump floors',
      ],
      closeTitle: <>VLAN: <span style={{ color: THEME.purple }}>WALLS</span> INSIDE THE SWITCH</>,
      closeSubtitle: 'without moving a single cable',
    },
  },
};

// ── BEATS ───────────────────────────────────────────────────────────
const BEATS = {
  es: {
    s1: { panelAt: 1.63, deptAt: [0, 0, 0, 0], points: [7.16, 12.42] },
    s2: { plans: [5.11, 7.74, 11.68, 14.07] },
    s3: { closeAt: 31.53, vlanDelay: 8.57, trunkDelay: 9.4, topologyStart: 9, nodes: [9.5, 11, 12.5, 14], points: [21.01, 30.6] },
  },
  en: {
    s1: { panelAt: 3.4, deptAt: [0.1, 0.9, 1.7, 2.4], points: [9.6, 14.5] },
    s2: { plans: [9.7, 10.9, 12.0, 13.8] },
    s3: { closeAt: 31.2, vlanDelay: 4.5, trunkDelay: 10.8, topologyStart: 11, nodes: [12.5, 14.5, 17.0, 19.5], points: [24.1, 31.2] },
  },
};

const DEPT_COLORS = [THEME.cyan, THEME.green, THEME.amber, THEME.purple];
const PLAN_COLORS = [THEME.cyan, THEME.green, THEME.amber, THEME.purple];
const VID = 'networksI-05-vlans';

const NODES_CONFIG = [
  { label: 'PC', color: THEME.cyan },
  { label: 'PC', color: THEME.cyan },
  { label: 'SRV', color: THEME.green },
  { label: 'CAM', color: THEME.amber },
];

const SWITCH_W = 110;
const SWITCH_Y = 120;
const NODE_Y = 28;
const NODE_R = 26;
const W = NODES_CONFIG.length * 130 + SWITCH_W;

const VlanTopology: React.FC<{ fps: number; b: typeof BEATS.es.s3 }> = ({ fps, b }) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame - Math.round(b.topologyStart * fps), [0, 14], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const cx = W / 2;
  return (
    <div style={{ opacity: enter, transform: `translateY(${(1 - enter) * 12}px)`, display: 'flex', justifyContent: 'center' }}>
      <svg width={W} height={SWITCH_Y + NODE_R + 30} viewBox={`0 0 ${W} ${SWITCH_Y + NODE_R + 30}`}>
        {NODES_CONFIG.map((d, i) => {
          const nx = i * 130 + 65;
          const t = interpolate(frame - Math.round(b.nodes[i] * fps), [0, 10], [0, 1], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          });
          return (
            <React.Fragment key={i}>
              <line x1={nx} y1={NODE_Y + NODE_R} x2={nx + (cx - nx) * t} y2={NODE_Y + NODE_R + (SWITCH_Y - NODE_Y - NODE_R) * t}
                stroke={d.color} strokeWidth={4} strokeLinecap="round" />
              <circle cx={nx} cy={NODE_Y} r={NODE_R} fill={THEME.panel} stroke={d.color} strokeWidth={1.5} />
              <text x={nx} y={NODE_Y + 5} textAnchor="middle" fill={d.color} fontFamily={MONO} fontSize={13} fontWeight={800}>{d.label}</text>
            </React.Fragment>
          );
        })}
        <rect x={cx - SWITCH_W / 2} y={SWITCH_Y} width={SWITCH_W} height={26} rx={6} fill={THEME.panel} stroke={THEME.text} strokeWidth={1.5} />
        {[0, 1, 2, 3, 4, 5].map(i => (
          <rect key={i} x={cx - 46 + i * 13} y={SWITCH_Y + 9} width={8} height={8} rx={1} fill={THEME.purple} opacity={0.8} />
        ))}
        <text x={cx} y={SWITCH_Y + 40} textAnchor="middle" fill={THEME.muted} fontFamily={MONO} fontSize={13}>switch</text>
      </svg>
    </div>
  );
};

// ── Scene 1 ──────────────────────────────────────────────────────
const Scene1: React.FC<{ fps: number; c: typeof COPY.es.s1; b: typeof BEATS.es.s1 }> = ({ fps, c, b }) => {
  const panelAt = Math.round(b.panelAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene title={c.title} subtitle={c.subtitle} />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
            {c.depts.map((v, i) => (
              <div key={v.name} style={{
                background: THEME.panel, border: `1px solid ${DEPT_COLORS[i]}60`, borderRadius: 14, padding: '18px 20px', textAlign: 'center', width: 180,
              }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{v.icon}</div>
                <RevealLine at={b.deptAt[i]} fps={fps} mark="◆" color={DEPT_COLORS[i]}>
                  <span style={{ fontSize: 14, fontWeight: 800 }}>{v.name}</span>
                </RevealLine>
              </div>
            ))}
          </div>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '18px 26px', width: 840, textAlign: 'left' }}>
            <RevealLine at={b.points[0]} fps={fps} mark="▸" color={THEME.purple}>{c.points[0]}</RevealLine>
            <RevealLine at={b.points[1]} fps={fps} mark="✗" color={THEME.red}>{c.points[1]}</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2 ──────────────────────────────────────────────────────
const Scene2: React.FC<{ fps: number; c: typeof COPY.es.s2; b: typeof BEATS.es.s2 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
      {c.heading}
    </div>
    <div style={{ display: 'flex', gap: 20, width: 1000 }}>
      {c.plans.map((v, i) => (
        <div key={v.name} style={{
          flex: 1, background: THEME.panel, border: `1px solid ${PLAN_COLORS[i]}60`,
          borderTop: `5px solid ${PLAN_COLORS[i]}`, borderRadius: 12, padding: '20px 16px', textAlign: 'center',
        }}>
          <RevealLine at={b.plans[i]} fps={fps} mark="◆" color={PLAN_COLORS[i]}>
            <span style={{ fontSize: 18, fontWeight: 800 }}>{v.name}</span>
          </RevealLine>
          <div style={{ fontSize: 14, color: THEME.muted, fontFamily: MONO, marginTop: 10 }}>{v.desc}</div>
        </div>
      ))}
    </div>
    <div style={{ marginTop: 28, fontSize: 20, color: THEME.green, fontFamily: MONO, fontWeight: 800 }}>
      {c.broadcast}
    </div>
    <div style={{ marginTop: 10, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
      {c.broadcastSub}
    </div>
  </AbsoluteFill>
);

// ── Scene 3 ──────────────────────────────────────────────────────
const Scene3: React.FC<{ fps: number; c: typeof COPY.es.s3; b: typeof BEATS.es.s3 }> = ({ fps, c, b }) => {
  const closeAt = Math.round(b.closeAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 14 }}>
            {c.heading}
          </div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
            <TerminalWindow title="switch# show vlan brief" width={540} delay={Math.round(b.vlanDelay * fps)}>
              <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.8 }}>
                <span style={{ color: THEME.amber }}>VLAN  Name        Status  Ports</span>
                {'\n'}<span style={{ color: THEME.dim }}>----  ----------  ------  ----------</span>
                {c.vlanRows.map(r => (
                  <React.Fragment key={r.name}>
                    {'\n'}<span style={{ color: r.color }}>{r.name}    {r.label}   active  Fa0/{r.name === '10' ? '1-8' : r.name === '20' ? '9-10' : r.name === '30' ? '11-16' : '17-24'}</span>
                  </React.Fragment>
                ))}
              </div>
            </TerminalWindow>
            <TerminalWindow title="switch# show interfaces trunk" width={540} delay={Math.round(b.trunkDelay * fps)}>
              <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.8 }}>
                <span style={{ color: THEME.amber }}>Port   Mode  Encapsulation  Status     Native</span>
                {'\n'}<span style={{ color: THEME.green }}>Fa0/24 on    802.1q         trunking   1</span>
                {'\n'}
                {'\n'}<span style={{ color: THEME.amber }}>Port   Vlans allowed on trunk</span>
                {'\n'}<span style={{ color: THEME.green }}>Fa0/24 10,20,30</span>
              </div>
            </TerminalWindow>
          </div>
          <VlanTopology fps={fps} b={b} />
          <div style={{ position: 'absolute', bottom: 34, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <RevealLine at={b.points[0]} fps={fps} mark="🔒" color={THEME.green}>{c.points[0]}</RevealLine>
            <RevealLine at={b.points[1]} fps={fps} mark="✗" color={THEME.red}>{c.points[1]}</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene title={c.closeTitle} subtitle={c.closeSubtitle} />
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Componente principal ────────────────────────────────────────────
export const Re1Vlans: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
  const { fps } = useVideoConfig();
  const c = COPY[lang];
  const b = BEATS[lang];

  const [s1, s2, s3] = audioTimings(VID, lang);
  const starts = sceneStartFrames(VID, fps, lang);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase(lang);

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/networksI-05-scene1.wav`)} />}
        <Scene1 fps={fps} c={c.s1} b={b.s1} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/networksI-05-scene2.wav`)} />}
        <Scene2 fps={fps} c={c.s2} b={b.s2} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/networksI-05-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3} b={b.s3} />
      </Sequence>
    </AbsoluteFill>
  );
};
