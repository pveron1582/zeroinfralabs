// ── video/remotion/compositions/Wi02CurrentVersions.tsx ────────────
// Video: versiones actuales de Windows — 10 (2015/LTSC), 11 (TPM 2.0,
// Secure Boot) y Server (AD, IIS, DNS, SMB, Core + WinRM). Cierre: el
// controlador de dominio = la empresa entera.
// Con audio de la voz "Miguel" (3 escenas, ~77s).

import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { staticFile } from 'remotion';
import { sceneStartFrames, AUDIO_TIMINGS } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
import { TitleScene } from '../primitives/TitleScene';
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

// ── Escena 1: Windows 10 ───────────────────────────────────────────
// `at` es relativo a la sub-secuencia de la card (arranca en `cardAt` 4.0s).
// En tiempo de escena quedan en 5.4 / 7.9 / 9.7 / 13.1s (silencedetect).
const WIN10_POINTS = [
  { text: '2015: unificó PCs, tablets y consolas', at: 1.4 },
  { text: 'soporte termina en octubre de 2025', at: 3.9 },
  { text: 'millones de máquinas sin actualizar', at: 5.7 },
  { text: 'LTSC: años en la misma versión (bancos, industria)', at: 9.1 },
];

const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const cardAt = Math.round(4.0 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={cardAt}>
        <TitleScene
          title={<><span style={{ color: THEME.cyan }}>TRES WINDOWS</span>, TRES ROLES</>}
          subtitle="lo que vas a encontrar en una empresa"
        />
      </Sequence>
      <Sequence from={cardAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.cyan}60`, borderRadius: 16, padding: '30px 36px', width: 860, textAlign: 'left' }}>
            <div style={{ fontSize: 30, fontWeight: 800, color: THEME.cyan, fontFamily: MONO, marginBottom: 8 }}>
              🪟 WINDOWS 10
            </div>
            <div style={{ fontSize: 17, color: THEME.muted, fontFamily: MONO, marginBottom: 18 }}>
              la versión de escritorio más extendida
            </div>
            {WIN10_POINTS.map(p => (
              <RevealLine key={p.text} at={p.at} fps={fps} mark="▸" color={THEME.cyan}>{p.text}</RevealLine>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 2: Windows 11 y Windows Server ──────────────────────────
const WIN11_CHIPS = [
  { label: 'TPM 2.0', at: 7.0 },
  { label: 'Secure Boot', at: 7.9 },
  { label: 'kernel NT', at: 10.2 },
];
const SERVER_CHIPS = [
  { label: 'Active Directory', at: 17.9 },
  { label: 'IIS + DNS', at: 19.2 },
  { label: 'shares SMB', at: 20.6 },
  { label: 'Core: PowerShell + WinRM', at: 25.9 },
];

const Scene2: React.FC<{ fps: number }> = ({ fps }) => {
  return (
    <AbsoluteFill style={CENTERED}>
      <div style={{ display: 'flex', gap: 26, width: 1100 }}>
        {/* Windows 11 */}
        <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.cyan}60`, borderRadius: 16, padding: '28px 26px', textAlign: 'left' }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.cyan, fontFamily: MONO, marginBottom: 8 }}>🪟 WINDOWS 11</div>
          <div style={{ fontSize: 16, color: THEME.muted, fontFamily: MONO, marginBottom: 16 }}>la actual: requisitos de hardware estrictos</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {WIN11_CHIPS.map(c => (
              <KeyCapsule key={c.label} label="endurece la máquina" value={c.label} accent={THEME.cyan} delay={Math.round(c.at * fps)} size={18} />
            ))}
          </div>
        </div>
        {/* Windows Server */}
        <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.amber}60`, borderRadius: 16, padding: '28px 26px', textAlign: 'left' }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.amber, fontFamily: MONO, marginBottom: 8 }}>🖥️ WINDOWS SERVER</div>
          <div style={{ fontSize: 16, color: THEME.muted, fontFamily: MONO, marginBottom: 16 }}>la identidad de toda la empresa</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {SERVER_CHIPS.map(c => (
              <KeyCapsule key={c.label} label="servicios corporativos" value={c.label} accent={THEME.amber} delay={Math.round(c.at * fps)} size={18} />
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Escena 3: por qué importa + cierre ─────────────────────────────
const WHY_POINTS = [
  { text: 'Windows 10 y 11: estaciones de trabajo', at: 5.0 },
  { text: 'los servidores guardan la identidad de la empresa', at: 7.4 },
  { text: 'comprometés un controlador de dominio → empresa entera', at: 10.5 },
];

const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(13.6 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 30 }}>
            ¿POR QUÉ TE IMPORTA?
          </div>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.amber}60`, borderRadius: 16, padding: '26px 32px', width: 920, textAlign: 'left' }}>
            {WHY_POINTS.map(p => (
              <RevealLine key={p.text} at={p.at} fps={fps} mark="⚠" color={THEME.amber}>{p.text}</RevealLine>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>CADA WINDOWS TIENE SU <span style={{ color: THEME.cyan }}>PERSONALIDAD</span></>}
          subtitle="distinguir qué mirás te dice por dónde empezar"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Wi02CurrentVersions: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS['wi-02-current-versions'];
  const starts = sceneStartFrames('wi-02-current-versions', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      {/* Scene 1: Windows 10 */}
      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile('videos/audio/wi-02-current-versions/wi-02-scene1.wav')} />
        <Scene1 fps={fps} />
      </Sequence>

      {/* Scene 2: Windows 11 y Server */}
      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile('videos/audio/wi-02-current-versions/wi-02-scene2.wav')} />
        <Scene2 fps={fps} />
      </Sequence>

      {/* Scene 3: por qué importa + cierre */}
      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile('videos/audio/wi-02-current-versions/wi-02-scene3.wav')} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
