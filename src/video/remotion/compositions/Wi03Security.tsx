// ── video/remotion/compositions/Wi03Security.tsx ──────────────────
// Video: controles de seguridad de Windows — firewall (3 perfiles),
// Defender y UAC, políticas de grupo y las demás defensas (BitLocker,
// Credential Guard, Event Logs...). Para el pentester: leer qué
// configuraron los defensores te dice qué les importa.
// Con audio de la voz "Miguel" (3 escenas, ~70s).

import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { staticFile } from 'remotion';
import { sceneStartFrames, AUDIO_TIMINGS } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
import { TitleScene } from '../primitives/TitleScene';
import { TerminalWindow } from '../primitives/TerminalWindow';
import { KeyCapsule } from '../primitives/KeyCapsule';
import { RevealLine } from '../primitives/RevealLine';

const CENTERED: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  textAlign: 'center',
};

// ── Escena 1: firewall ─────────────────────────────────────────────
// El narrador primero dice "activado por defecto" (6.1s) y después
// "con tres perfiles: dominio, privado y público" (7.6s) — el orden de
// las líneas sigue el orden real del audio (silencedetect -50dB).
// `at` es relativo a la sub-secuencia del panel (arranca en `panelAt` 3.8s).
// En tiempo de escena quedan en 6.1 / 7.6 / 14.4s (silencedetect).
const FW_POINTS = [
  { text: 'activado por defecto', at: 2.3 },
  { text: '3 perfiles: dominio, privado y público', at: 3.8 },
  { text: 'un puerto "cerrado" puede estar abierto solo en la LAN', at: 10.6 },
];

const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(3.8 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>WINDOWS YA VIENE <span style={{ color: THEME.amber }}>BLINDADO</span></>}
          subtitle="firewall, antivirus, UAC y políticas de grupo"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            <div style={{ width: 520, textAlign: 'left' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: THEME.amber, fontFamily: MONO, marginBottom: 16 }}>
                🧱 WINDOWS DEFENDER FIREWALL
              </div>
              {FW_POINTS.map(p => (
                <RevealLine key={p.text} at={p.at} fps={fps} mark="▸" color={THEME.amber}>{p.text}</RevealLine>
              ))}
            </div>
            <TerminalWindow title="C:\\> netsh advfirewall" width={500}>
              <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.6 }}>
                <span style={{ color: THEME.amber }}>Domain Profile:</span> ON
                {'\n'}<span style={{ color: THEME.amber }}>Private Profile:</span> ON
                {'\n'}<span style={{ color: THEME.amber }}>Public Profile:</span> ON
              </div>
            </TerminalWindow>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 2: Defender + UAC ───────────────────────────────────────
const DEFENDER_POINTS = [
  { text: 'antivirus integrado (10 y 11)', at: 2.1 },
  { text: 'escaneo en tiempo real + nube', at: 4.6 },
  { text: 'los payloads modernos tienen que evadirlo', at: 7.1 },
];
const UAC_POINTS = [
  { text: 'aviso cuando algo pide permisos de admin', at: 12.6 },
  { text: 'pide consentimiento o credenciales', at: 14.9 },
  { text: 'no detiene: frena y deja un popup visible', at: 17.9 },
];

const Scene2: React.FC<{ fps: number }> = ({ fps }) => {
  return (
    <AbsoluteFill style={CENTERED}>
      <div style={{ display: 'flex', gap: 26, width: 1100 }}>
        <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 16, padding: '26px 26px', textAlign: 'left' }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 14 }}>🛡️ MICROSOFT DEFENDER</div>
          {DEFENDER_POINTS.map(p => (
            <RevealLine key={p.text} at={p.at} fps={fps} mark="▸" color={THEME.green}>{p.text}</RevealLine>
          ))}
        </div>
        <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.amber}60`, borderRadius: 16, padding: '26px 26px', textAlign: 'left' }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.amber, fontFamily: MONO, marginBottom: 14 }}>🪟 UAC — CONTROL DE CUENTAS</div>
          {UAC_POINTS.map(p => (
            <RevealLine key={p.text} at={p.at} fps={fps} mark="▸" color={THEME.amber}>{p.text}</RevealLine>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Escena 3: GPO + más defensas + cierre ──────────────────────────
const GPO_POINTS = [
  { text: 'configura contraseñas, apps y firewall', at: 2.1 },
  { text: 'en empresas: se aplica desde Active Directory', at: 6.7 },
];
const MORE_DEFENSES = [
  { label: 'BitLocker', desc: 'cifra el disco', at: 11.2 },
  { label: 'Credential Guard', desc: 'protege los hashes en memoria', at: 13.2 },
  { label: 'Secure Boot', desc: 'verifica el arranque', at: 14.3 },
  { label: 'AppLocker', desc: 'lista blanca de apps', at: 15.0 },
  { label: 'Event Logs', desc: 'registran cada acceso', at: 17.1 },
];

const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  return (
    <AbsoluteFill style={CENTERED}>
      <div style={{ background: THEME.panel, border: `1px solid ${THEME.purple}60`, borderRadius: 16, padding: '24px 30px', width: 980, textAlign: 'left', marginBottom: 26 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: THEME.purple, fontFamily: MONO, marginBottom: 12 }}>📋 POLÍTICAS DE GRUPO (GPO)</div>
        {GPO_POINTS.map(p => (
          <RevealLine key={p.text} at={p.at} fps={fps} mark="▸" color={THEME.purple}>{p.text}</RevealLine>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 1000 }}>
        {MORE_DEFENSES.map(d => (
          <KeyCapsule key={d.label} label={d.desc} value={d.label} accent={THEME.amber} delay={Math.round(d.at * fps)} size={18} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const Wi03Security: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS['wi-03-security'];
  const starts = sceneStartFrames('wi-03-security', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      {/* Scene 1: firewall */}
      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile('videos/audio/wi-03-security/wi-03-scene1.wav')} />
        <Scene1 fps={fps} />
      </Sequence>

      {/* Scene 2: Defender + UAC */}
      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile('videos/audio/wi-03-security/wi-03-scene2.wav')} />
        <Scene2 fps={fps} />
      </Sequence>

      {/* Scene 3: GPO + más defensas */}
      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile('videos/audio/wi-03-security/wi-03-scene3.wav')} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
