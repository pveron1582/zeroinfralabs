// ── video/remotion/compositions/Re05AddressingDns.tsx ──────────────
// Video: direccionamiento — IP, máscara, gateway y el DNS.
// Lección redes-05 del Academy. Guiones: voicebox-scripts/re-05-*.txt
// Audio real cargado (wavs Voicebox, ffprobe 2026-08-17). Los syncs internos
// (RevealLine/KeyCapsule/TitleScene) están alineados a silencedetect (-50dB).

import React from 'react';
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { sceneStartFrames, AUDIO_TIMINGS, hasAudio } from '../audioTimings';
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

// ── Escena 1: las 3 piezas de la configuración ─────────────────────
const PIECES = [
  { name: 'IP', icon: '🪪', color: THEME.cyan, desc: 'identidad del equipo en la red', ex: '192.168.1.10', at: 3 },
  { name: 'MÁSCARA', icon: '📐', color: THEME.amber, desc: 'qué parte es red, qué parte es equipo', ex: '255.255.255.0', at: 6 },
  { name: 'GATEWAY', icon: '🌉', color: THEME.green, desc: 'la IP del router: el puente hacia afuera', ex: '192.168.1.1', at: 9.5 },
];

const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(5 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>CONFIGURAR UNA RED: <span style={{ color: THEME.cyan }}>3 NÚMEROS</span></>}
          subtitle="IP + máscara + puerta de enlace"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', gap: 24, width: 1140 }}>
            {PIECES.map(p => (
              <div key={p.name} style={{
                flex: 1, background: THEME.panel, border: `1px solid ${p.color}60`,
                borderRadius: 16, padding: '24px 22px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>{p.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: p.color, fontFamily: MONO }}>{p.name}</div>
                <RevealLine at={p.at} fps={fps} mark="▸" color={p.color}>
                  <span style={{ fontSize: 14 }}>{p.desc}</span>
                </RevealLine>
                <div style={{ fontSize: 16, color: THEME.text, fontFamily: MONO, marginTop: 12 }}>{p.ex}</div>
              </div>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 2: clases + CIDR ────────────────────────────────────────
const CLASSES = [
  { name: 'CLASE A', color: THEME.purple, rango: '1–126', desc: 'redes enormes · 10.x.x.x', at: 5 },
  { name: 'CLASE B', color: THEME.cyan, rango: '128–191', desc: 'redes medianas · 172.16–31.x.x', at: 6.5 },
  { name: 'CLASE C', color: THEME.green, rango: '192–223', desc: 'redes chicas · 192.168.x.x', at: 8 },
];

const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 30 }}>
      CLASES POR <span style={{ color: THEME.amber }}>TAMAÑO</span> DE RED
    </div>
    <div style={{ display: 'flex', gap: 24, width: 1140 }}>
      {CLASSES.map(c => (
        <div key={c.name} style={{
          flex: 1, background: THEME.panel, border: `1px solid ${c.color}60`,
          borderRadius: 16, padding: '22px 20px', textAlign: 'center',
        }}>
          <RevealLine at={c.at} fps={fps} mark="◆" color={c.color}>
            <span style={{ fontSize: 20, fontWeight: 800 }}>{c.name}</span>
          </RevealLine>
          <div style={{ fontSize: 15, color: c.color, fontFamily: MONO, marginTop: 10 }}>primer octeto {c.rango}</div>
          <div style={{ fontSize: 13, color: THEME.muted, fontFamily: MONO, marginTop: 10 }}>{c.desc}</div>
        </div>
      ))}
    </div>
    <div style={{ marginTop: 30, fontSize: 18, color: THEME.muted, fontFamily: MONO }}>
      hoy se usa <span style={{ color: THEME.cyan }}>CIDR</span>: 192.168.1.0/24 — pero las clases explican los rangos privados
    </div>
  </AbsoluteFill>
);

// ── Escena 3: DNS + resolv.conf ────────────────────────────────────
const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(12.7 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
            <span style={{ color: THEME.cyan }}>DNS</span>: LA AGENDA DE INTERNET
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 20 }}>
            <span style={{ fontSize: 26, color: THEME.text, fontFamily: MONO }}>google.com</span>
            <span style={{ fontSize: 26, color: THEME.dim }}>→</span>
            <span style={{ fontSize: 26, color: THEME.green, fontFamily: MONO }}>142.250.80.78</span>
          </div>
          <TerminalWindow title="kali@attacker-01:~$" width={620} delay={Math.round(3.5 * fps)}>
            <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.7 }}>
              <span style={{ color: THEME.dim }}># /etc/resolv.conf</span>
              {'\n'}nameserver <span style={{ color: THEME.cyan }}>8.8.8.8</span>
              {'\n'}default via <span style={{ color: THEME.green }}>192.168.1.1</span> dev eth0
            </div>
          </TerminalWindow>
          <div style={{ marginTop: 16, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
            si el DNS falla, "no anda la web" aunque tengas internet
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>CON IP, GATEWAY Y DNS: <span style={{ color: THEME.amber }}>LISTO PARA NAVEGAR</span></>}
          subtitle="y para el pentester: enumerar DNS revela subdominios"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Re05AddressingDns: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS['re-05-addressing-dns'];
  const starts = sceneStartFrames('re-05-addressing-dns', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const withAudio = hasAudio('re-05-addressing-dns');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        {withAudio && <Audio src={staticFile('videos/audio/re-05-addressing-dns/re-05-scene1.wav')} />}
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        {withAudio && <Audio src={staticFile('videos/audio/re-05-addressing-dns/re-05-scene2.wav')} />}
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        {withAudio && <Audio src={staticFile('videos/audio/re-05-addressing-dns/re-05-scene3.wav')} />}
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
