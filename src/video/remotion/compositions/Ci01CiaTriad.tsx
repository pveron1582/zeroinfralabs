// ── video/remotion/compositions/Ci01CiaTriad.tsx ───────────────────
// Video: la triada CID — confidencialidad, integridad y disponibilidad
// con ataques reales por cada pata y el ángulo del pentester.
// Con audio de la voz "Miguel" (3 escenas, ~52s).
// ⚠️ TIMINGS ESTIMADOS: se reemplazan con los reales (ffprobe) cuando el
// autor pase los wavs; los syncs internos (RevealLine/KeyCapsule) también.

import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { staticFile } from 'remotion';
import { sceneStartFrames, AUDIO_TIMINGS } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
import { TitleScene } from '../primitives/TitleScene';
import { TerminalWindow } from '../primitives/TerminalWindow';
import { RevealLine } from '../primitives/RevealLine';

const CENTERED: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  textAlign: 'center',
};

// ── Escena 1: las tres patas de la triada ──────────────────────────
const PILLARS = [
  { name: 'CONFIDENCIALIDAD', icon: '🔒', color: THEME.cyan, points: ['solo ojos autorizados leen el dato', 'robar datos = romperla'] },
  { name: 'INTEGRIDAD', icon: '🧾', color: THEME.amber, points: ['el dato no se modifica en silencio', 'tocar logs = romperla'] },
  { name: 'DISPONIBILIDAD', icon: '✅', color: THEME.green, points: ['el sistema funciona cuando se lo necesita', 'DDoS = romperla'] },
];

const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(4 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>LA TRIADA <span style={{ color: THEME.cyan }}>CID</span></>}
          subtitle="confidencialidad · integridad · disponibilidad"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', gap: 24, width: 1120 }}>
            {PILLARS.map(p => (
              <div
                key={p.name}
                style={{
                  flex: 1,
                  background: THEME.panel,
                  border: `1px solid ${p.color}60`,
                  borderRadius: 16,
                  padding: '26px 22px',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontSize: 24, fontWeight: 800, color: p.color, fontFamily: MONO, marginBottom: 12 }}>
                  {p.icon} {p.name}
                </div>
                {p.points.map(pt => (
                  <RevealLine key={pt} at={6 + p.points.indexOf(pt) * 3.5} fps={fps} mark="▸" color={p.color}>{pt}</RevealLine>
                ))}
              </div>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 2: ataques reales por cada pata ─────────────────────────
const ATTACKS = [
  { name: 'CONFIDENCIALIDAD', color: THEME.cyan, attacks: ['robar /etc/shadow', 'SQLi volcando la base'] },
  { name: 'INTEGRIDAD', color: THEME.amber, attacks: ['defacear la web', 'tocar logs para cubrirte'] },
  { name: 'DISPONIBILIDAD', color: THEME.green, attacks: ['DDoS tumba el servicio', 'ransomware pide rescate'] },
];

const Scene2: React.FC<{ fps: number }> = ({ fps }) => {
  return (
    <AbsoluteFill style={CENTERED}>
      <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 30 }}>
        CADA ATAQUE ROMPE <span style={{ color: THEME.red }}>UNA PATA</span>
      </div>
      <div style={{ display: 'flex', gap: 24, width: 1120 }}>
        {ATTACKS.map(a => (
          <div
            key={a.name}
            style={{
              flex: 1,
              background: THEME.panel,
              border: `1px solid ${a.color}60`,
              borderRadius: 16,
              padding: '26px 22px',
              textAlign: 'left',
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 800, color: a.color, fontFamily: MONO, marginBottom: 12 }}>
              {a.name}
            </div>
            {a.attacks.map(at => (
              <RevealLine key={at} at={3 + a.attacks.indexOf(at) * 4} fps={fps} mark="✗" color={THEME.red}>{at}</RevealLine>
            ))}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ── Escena 3: cierre — el ángulo del pentester ─────────────────────
const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(11 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
            LO QUE MÁS VALE ES LA <span style={{ color: THEME.cyan }}>INFORMACIÓN</span>
          </div>
          <TerminalWindow title="kali@attacker-01:~$" width={680} delay={Math.round(3 * fps)}>
            <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.7 }}>
              <span style={{ color: THEME.green }}>kali@attacker-01:~$</span> cat /etc/shadow | head -2
              {'\n'}root:$6$rounds=656000$abcdef$<span style={{ color: THEME.dim }}>...</span>:19100:0:99999:7:::
              {'\n'}admin:$6$rounds=656000$ghijkl$<span style={{ color: THEME.dim }}>...</span>:19100:0:99999:7:::
            </div>
          </TerminalWindow>
          <div style={{ marginTop: 22, fontSize: 18, color: THEME.muted, fontFamily: MONO }}>
            leerlo rompe la confidencialidad: el atacante crackea offline, sin alertas
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>ENUMERÁ: <span style={{ color: THEME.amber }}>¿CUÁL PATA TE CONVIENE ATACAR?</span></>}
          subtitle="y cuando defendés: ¿cuál no podés perder?"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Ci01CiaTriad: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS['ci-01-cia-triad'];
  const starts = sceneStartFrames('ci-01-cia-triad', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      {/* Scene 1: la triada */}
      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile('videos/audio/ci-01-cia-triad/ci-01-scene1.wav')} />
        <Scene1 fps={fps} />
      </Sequence>

      {/* Scene 2: ataques reales */}
      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile('videos/audio/ci-01-cia-triad/ci-01-scene2.wav')} />
        <Scene2 fps={fps} />
      </Sequence>

      {/* Scene 3: cierre */}
      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile('videos/audio/ci-01-cia-triad/ci-01-scene3.wav')} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
