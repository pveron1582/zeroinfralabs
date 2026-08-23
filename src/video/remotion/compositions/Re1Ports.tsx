// ── video/remotion/compositions/Re1Ports.tsx ───────────────────────
// Video: puertos — qué son, cuántos hay y los que hay que conocer.
// Lección proto-03 del Academy (Redes I). Guiones: voicebox-scripts/re1-03-*.txt
// Audio real cargado: timings de audioTimings.ts; syncs internos alineados
// a silencedetect (-50dB) de voicebox-scripts/re1-03-scene*.wav.

import React from 'react';
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { sceneStartFrames, AUDIO_TIMINGS, hasAudio } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
import { TitleScene } from '../primitives/TitleScene';
import { RevealLine } from '../primitives/RevealLine';
import { KeyCapsule } from '../primitives/KeyCapsule';

const CENTERED: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  textAlign: 'center',
};

// ── Escena 1: qué es un puerto ─────────────────────────────────────
const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(9.22 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>¿QUÉ ES UN <span style={{ color: THEME.cyan }}>PUERTO</span>?</>}
          subtitle="un número entre 0 y 65535"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', gap: 20, marginBottom: 26 }}>
            <KeyCapsule label="máquina" value="192.168.1.11" accent={THEME.cyan} delay={0} size={26} />
            <span style={{ fontSize: 32, color: THEME.dim, fontFamily: MONO }}>:</span>
            <KeyCapsule label="servicio" value="22" accent={THEME.green} delay={Math.round(1.41 * fps)} size={26} />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
            IP = QUÉ MÁQUINA · PUERTO = <span style={{ color: THEME.green }}>QUÉ SERVICIO</span>
          </div>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '18px 26px', width: 760, textAlign: 'left' }}>
            <RevealLine at={3.68} fps={fps} mark="▸" color={THEME.cyan}>el SO lee el puerto y entrega al programa correcto</RevealLine>
            <RevealLine at={5.2} fps={fps} mark="✓" color={THEME.green}>socket = IP:puerto</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 2: por qué existen + los 3 rangos ───────────────────────
const RANGES = [
  { name: 'BIEN CONOCIDOS', rango: '0–1023', color: THEME.green, desc: 'reservados para los clásicos (HTTP, SSH, DNS, FTP)' },
  { name: 'REGISTRADOS', rango: '1024–49151', color: THEME.cyan, desc: 'servicios de usuario, como MySQL en el 3306' },
  { name: 'DINÁMICOS', rango: '49152–65535', color: THEME.amber, desc: 'efímeros, los asigna el SO a conexiones salientes' },
];

const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
      65.536 PUERTOS EN <span style={{ color: THEME.cyan }}>3 RANGOS</span>
    </div>
    <div style={{ display: 'flex', gap: 22, width: 1120 }}>
      {RANGES.map((r, i) => {
        const at = [16.21, 18.94, 20.54][i];
        return (
        <div key={r.name} style={{
          flex: 1, background: THEME.panel, border: `1px solid ${r.color}60`,
          borderTop: `5px solid ${r.color}`, borderRadius: 12, padding: '22px 20px', textAlign: 'center',
        }}>
          <RevealLine at={at} fps={fps} mark="◆" color={r.color}>
            <span style={{ fontSize: 16, fontWeight: 800 }}>{r.name}</span>
          </RevealLine>
          <div style={{ fontSize: 22, color: r.color, fontFamily: MONO, marginTop: 8 }}>{r.rango}</div>
          <div style={{ fontSize: 13, color: THEME.muted, fontFamily: MONO, marginTop: 10, lineHeight: 1.5 }}>{r.desc}</div>
        </div>
        );
      })}
    </div>
  </AbsoluteFill>
);

// ── Escena 3: los puertos que hay que conocer + cierre ──────────────
const CLASSICS = [
  { p: '21', s: 'FTP', c: THEME.cyan },
  { p: '22', s: 'SSH', c: THEME.green },
  { p: '23', s: 'TELNET', c: THEME.red },
  { p: '25', s: 'SMTP', c: THEME.purple },
  { p: '53', s: 'DNS', c: THEME.amber },
  { p: '80', s: 'HTTP', c: THEME.cyan },
  { p: '110', s: 'POP3', c: THEME.cyan },
  { p: '143', s: 'IMAP', c: THEME.cyan },
  { p: '443', s: 'HTTPS', c: THEME.green },
  { p: '445', s: 'SMB', c: THEME.red },
  { p: '3306', s: 'MYSQL', c: THEME.amber },
  { p: '3389', s: 'RDP', c: THEME.purple },
  { p: '8080', s: 'HTTP ALT', c: THEME.cyan },
];

const CHIP_AT = [2.11, 2.8, 3.37, 5.23, 5.7, 6.37, 7.2, 9.45, 11.02, 13.63, 17.47, 19.8, 21.99];

const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(27.01 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
            LOS QUE VAS A VER <span style={{ color: THEME.green }}>SIEMPRE</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, width: 980, justifyContent: 'center' }}>
            {CLASSICS.map((x, i) => (
              <RevealLine key={x.p + x.s} at={CHIP_AT[i]} fps={fps} mark="" color={x.c}>
                <span style={{
                  display: 'inline-flex', alignItems: 'baseline', gap: 10,
                  background: THEME.panel, border: `1px solid ${x.c}60`, borderRadius: 10, padding: '8px 14px',
                }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: x.c }}>{x.p}</span>
                  <span style={{ fontSize: 14, color: THEME.muted }}>{x.s}</span>
                </span>
              </RevealLine>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>UNO DE ESTOS ABIERTO = <span style={{ color: THEME.amber }}>YA SABÉS QUÉ CORRER</span></>}
          subtitle="el escaneo te abre el mapa"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Re1Ports: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS['re1-03-ports'];
  const starts = sceneStartFrames('re1-03-ports', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const withAudio = hasAudio('re1-03-ports');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        {withAudio && <Audio src={staticFile('videos/audio/re1-03-ports/re1-03-scene1.wav')} />}
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        {withAudio && <Audio src={staticFile('videos/audio/re1-03-ports/re1-03-scene2.wav')} />}
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        {withAudio && <Audio src={staticFile('videos/audio/re1-03-ports/re1-03-scene3.wav')} />}
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
