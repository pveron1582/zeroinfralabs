// ── video/remotion/compositions/Ci05OwaspTopTen.tsx ────────────────
// Video: OWASP Top Ten — los 10 riesgos web más explotados.
// Lección ciber-05 (Fundamentos de Ciberseguridad). Guiones: voicebox-scripts/ci-05-*.txt
// ⚠️ AUDIO PENDIENTE: hasAudio() es false → se renderiza mudo hasta que
// lleguen los wavs y se reemplacen los timings estimados.

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

// ── Escena 1: qué es OWASP ─────────────────────────────────────────
const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(7 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>LA TABLA QUE EL RED TEAM <span style={{ color: THEME.red }}>MEMORIZA</span></>}
          subtitle="OWASP Top Ten — los 10 riesgos web más explotados"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 22, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
            QUIÉN LA USA: <span style={{ color: THEME.cyan }}>TODOS</span>
          </div>
          <div style={{ display: 'flex', gap: 20, width: 1040, justifyContent: 'center' }}>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.cyan}60`, borderRadius: 16, padding: '20px 22px', textAlign: 'left' }}>
              <div style={{ fontSize: 19, fontWeight: 800, color: THEME.cyan, fontFamily: MONO, marginBottom: 12 }}>
                <RevealLine at={9} fps={fps} mark="" color={THEME.cyan}>AUDITORES</RevealLine>
              </div>
              <RevealLine at={11} fps={fps} mark="▸" color={THEME.cyan}>testean contra la lista</RevealLine>
              <RevealLine at={14} fps={fps} mark="▸" color={THEME.cyan}>cada entrada = checklist</RevealLine>
            </div>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 16, padding: '20px 22px', textAlign: 'left' }}>
              <div style={{ fontSize: 19, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 12 }}>
                <RevealLine at={10} fps={fps} mark="" color={THEME.green}>DESARROLLADORES</RevealLine>
              </div>
              <RevealLine at={12} fps={fps} mark="▸" color={THEME.green}>refuerzan contra la lista</RevealLine>
              <RevealLine at={15} fps={fps} mark="▸" color={THEME.green}>cierra el 80% de la puerta</RevealLine>
            </div>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.red}60`, borderRadius: 16, padding: '20px 22px', textAlign: 'left' }}>
              <div style={{ fontSize: 19, fontWeight: 800, color: THEME.red, fontFamily: MONO, marginBottom: 12 }}>
                <RevealLine at={10.5} fps={fps} mark="" color={THEME.red}>ATACANTES</RevealLine>
              </div>
              <RevealLine at={13} fps={fps} mark="▸" color={THEME.red}>cazan dentro de la lista</RevealLine>
              <RevealLine at={16} fps={fps} mark="▸" color={THEME.red}>un ataque clásico por entrada</RevealLine>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 2: top 3 ────────────────────────────────────────────────
const TOP3 = [
  { n: '1', name: 'BROKEN ACCESS CONTROL', desc: 'llegás a lo que no deberías: /admin, datos de otro', color: THEME.red, at: 2.5 },
  { n: '2', name: 'CRYPTOGRAPHIC FAILURES', desc: 'datos sensibles sin proteger: texto plano, hashes débiles', color: THEME.amber, at: 7.0 },
  { n: '3', name: 'INJECTION', desc: "tu input se ejecuta como código: ' OR 1=1--, XSS", color: THEME.cyan, at: 11.5 },
];

const Scene2: React.FC<{ fps: number }> = ({ fps }) => {
  const sumAt = Math.round(15 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={sumAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 32 }}>
            EL <span style={{ color: THEME.red }}>TOP 3</span>, LOS QUE MÁS IMPORTAN
          </div>
          <div style={{ display: 'flex', gap: 20, width: 1100, justifyContent: 'center' }}>
            {TOP3.map(t => (
              <div key={t.n} style={{
                flex: 1, background: THEME.panel, border: `1px solid ${t.color}60`, borderRadius: 16,
                padding: '20px 16px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 38, fontWeight: 800, color: t.color, fontFamily: MONO, marginBottom: 6 }}>
                  <RevealLine at={t.at} fps={fps} mark="" color={t.color}>{t.n}</RevealLine>
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: THEME.text, fontFamily: MONO }}>{t.name}</div>
                <div style={{ fontSize: 13, color: THEME.muted, fontFamily: MONO, marginTop: 8, lineHeight: 1.5 }}>{t.desc}</div>
              </div>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={sumAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO }}>
            <RevealLine at={1} fps={fps} mark="▸" color={THEME.red}>juntos, estos tres cubren la mayoría de las brechas reales</RevealLine>
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 26 }}>
            {['Access', 'Crypto', 'Injection'].map((x, i) => (
              <KeyCapsule key={x} label="dónde apuntar" value={x} accent={[THEME.red, THEME.amber, THEME.cyan][i]} delay={Math.round((3 + i * 2) * fps)} size={24} />
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 3: los otros 7 + red/blue team + cierre ─────────────────
const OTHER7 = [
  { n: '4', name: 'Insecure Design', color: THEME.purple },
  { n: '5', name: 'Security Misconfiguration', color: THEME.amber },
  { n: '6', name: 'Vulnerable Components', color: THEME.red },
  { n: '7', name: 'Auth Failures', color: THEME.cyan },
  { n: '8', name: 'Integrity Failures', color: THEME.green },
  { n: '9', name: 'Logging & Monitoring', color: THEME.purple },
  { n: '10', name: 'SSRF', color: THEME.amber },
];

const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const playbookAt = Math.round(10 * fps);
  const closeAt = Math.round(16 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={playbookAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
            LOS OTROS <span style={{ color: THEME.purple }}>SIETE</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14, width: 1080 }}>
            {OTHER7.map(o => (
              <div key={o.n} style={{
                background: THEME.panel, border: `1px solid ${o.color}50`, borderRadius: 12,
                padding: '14px 12px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: o.color, fontFamily: MONO }}>
                  <RevealLine at={2 + (Number(o.n) - 4) * 0.8} fps={fps} mark="" color={o.color}>{o.n}</RevealLine>
                </div>
                <div style={{ fontSize: 13, color: THEME.muted, fontFamily: MONO, marginTop: 4 }}>{o.name}</div>
              </div>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={playbookAt} durationInFrames={closeAt - playbookAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
            EL TOP TEN COMO <span style={{ color: THEME.red }}>PLAYBOOK</span>
          </div>
          <div style={{ display: 'flex', gap: 20, width: 1040, justifyContent: 'center' }}>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.red}60`, borderRadius: 16, padding: '18px 20px', textAlign: 'left' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: THEME.red, fontFamily: MONO, marginBottom: 10 }}>
                <RevealLine at={1} fps={fps} mark="" color={THEME.red}>RED TEAM ⚔️</RevealLine>
              </div>
              <RevealLine at={3} fps={fps} mark="▸" color={THEME.red}>Injection → payloads en cada input</RevealLine>
              <RevealLine at={5} fps={fps} mark="▸" color={THEME.red}>Access Control → forzar URLs, enumerar IDs</RevealLine>
              <RevealLine at={7} fps={fps} mark="▸" color={THEME.red}>Components → searchsploit a la versión</RevealLine>
            </div>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 16, padding: '18px 20px', textAlign: 'left' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 10 }}>
                <RevealLine at={2} fps={fps} mark="" color={THEME.green}>BLUE TEAM 🛡️</RevealLine>
              </div>
              <RevealLine at={4} fps={fps} mark="▸" color={THEME.green}>arreglá los mismos diez</RevealLine>
              <RevealLine at={6} fps={fps} mark="▸" color={THEME.green}>cerrás el 80% de la puerta</RevealLine>
              <RevealLine at={8} fps={fps} mark="▸" color={THEME.green}>chequeo en cada release</RevealLine>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>NO ES UNA LISTA PARA <span style={{ color: THEME.red }}>MEMORIZAR</span></>}
          subtitle="es un menú de ideas de ataque · y, invertido, de arreglos de defensa"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Ci05OwaspTopTen: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS['ci-05-owasp-top-ten'];
  const starts = sceneStartFrames('ci-05-owasp-top-ten', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const withAudio = hasAudio('ci-05-owasp-top-ten');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        {withAudio && <Audio src={staticFile('videos/audio/ci-05-owasp-top-ten/ci-05-scene1.wav')} />}
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        {withAudio && <Audio src={staticFile('videos/audio/ci-05-owasp-top-ten/ci-05-scene2.wav')} />}
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        {withAudio && <Audio src={staticFile('videos/audio/ci-05-owasp-top-ten/ci-05-scene3.wav')} />}
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};