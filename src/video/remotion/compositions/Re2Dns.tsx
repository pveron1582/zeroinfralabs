// ── video/remotion/compositions/Re2Dns.tsx ───────────────────────────
// Video: DNS — cómo busca los nombres la internet.
// Lección network-08 del Academy (Redes II). Guiones: voicebox-scripts/re2-03-*.txt
// Audio real cargado: timings de audioTimings.ts; syncs internos alineados
// a silencedetect (-50dB) de voicebox-scripts/re2-03-scene*.wav.

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

// ── Escena 1: qué hace ─────────────────────────────────────────────
const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(6.74 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>LA AGENDA <span style={{ color: THEME.cyan }}>DE INTERNET</span></>}
          subtitle="DNS — nombres → IPs"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 26 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO }}>google.com</div>
            <span style={{ fontSize: 30, color: THEME.green }}>→</span>
            <div style={{ fontSize: 28, fontWeight: 800, color: THEME.green, fontFamily: MONO }}>142.250.78.78</div>
          </div>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '18px 26px', width: 840, textAlign: 'left' }}>
            <RevealLine at={4.14} fps={fps} mark="▸" color={THEME.cyan}>base de datos mundial y distribuida: nadie sabe todo</RevealLine>
            <RevealLine at={8.45} fps={fps} mark="▸" color={THEME.amber}>UDP puerto 53 · TCP si la respuesta es grande</RevealLine>
            <RevealLine at={14.32} fps={fps} mark="⚠️" color={THEME.red}>si falla, parece que se cayó toda la internet</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 2: la cadena de resolución ──────────────────────────────
const CHAIN = [
  { icon: '🌍', name: 'ROOT', color: THEME.amber, desc: '"no sé google.com, pero los que manejan .com son…"' },
  { icon: '📁', name: 'TLD (.com)', color: THEME.cyan, desc: '"los responsables de google.com son…"' },
  { icon: '🏢', name: 'AUTORITATIVO', color: THEME.green, desc: '"google.com es 142.250.78.78"' },
];

const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
      LA CADENA DE <span style={{ color: THEME.green }}>RESOLUCIÓN</span>
    </div>
    <div style={{ display: 'flex', gap: 18, alignItems: 'center', width: 1080 }}>
      {CHAIN.map((s, i) => {
        const at = [6.43, 15.71, 22.22][i];
        return (
        <React.Fragment key={s.name}>
          {i > 0 && <span style={{ fontSize: 30, color: THEME.green }}>→</span>}
          <div style={{
            flex: 1, background: THEME.panel, border: `1px solid ${s.color}60`, borderRadius: 16, padding: '20px 16px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 30, marginBottom: 6 }}>{s.icon}</div>
            <RevealLine at={at} fps={fps} mark="" color={s.color}>
              <span style={{ fontSize: 18, fontWeight: 800 }}>{s.name}</span>
            </RevealLine>
            <div style={{ fontSize: 12, color: THEME.muted, fontFamily: MONO, marginTop: 10, lineHeight: 1.5 }}>{s.desc}</div>
          </div>
        </React.Fragment>
        );
      })}
    </div>
    <div style={{ marginTop: 24, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
      3 preguntas · y cada respuesta viene con un <span style={{ color: THEME.amber }}>TTL</span> para cachear
    </div>
  </AbsoluteFill>
);

// ── Escena 3: registros + ataques + cierre ─────────────────────────
const RECORDS = [
  { name: 'A', desc: 'nombre → IPv4', color: THEME.cyan },
  { name: 'AAAA', desc: 'nombre → IPv6', color: THEME.cyan },
  { name: 'MX', desc: 'correo del dominio', color: THEME.green },
  { name: 'NS', desc: 'autoritativo', color: THEME.amber },
  { name: 'CNAME', desc: 'alias', color: THEME.purple },
  { name: 'TXT', desc: 'propiedad + anti-spam', color: THEME.green },
];

const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(37.29 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
            LOS <span style={{ color: THEME.cyan }}>REGISTROS</span> PRINCIPALES
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, width: 920, justifyContent: 'center' }}>
            {RECORDS.map((r, i) => {
        const at = [2.32, 3.52, 6.47, 8.32, 10.88, 13.26][i];
        return (
        <RevealLine key={r.name} at={at} fps={fps} mark="" color={r.color}>
          <span style={{
            display: 'inline-flex', alignItems: 'baseline', gap: 10,
            background: THEME.panel, border: `1px solid ${r.color}60`, borderRadius: 10, padding: '8px 14px',
          }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: r.color }}>{r.name}</span>
            <span style={{ fontSize: 13, color: THEME.muted }}>{r.desc}</span>
          </span>
        </RevealLine>
        );
      })}
          </div>
          <TerminalWindow title="kali@attacker-01:~$ dig example.com" width={620} delay={Math.round(15.28 * fps)}>
            <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.7 }}>
              <span style={{ color: THEME.dim }}>;; ANSWER SECTION:</span>
              {'\n'}example.com.  <span style={{ color: THEME.amber }}>86400</span>  IN  A  <span style={{ color: THEME.green }}>93.184.216.34</span>
              {'\n'}<span style={{ color: THEME.dim }}>;; SERVER: 8.8.8.8#53</span>
            </div>
          </TerminalWindow>
          <div style={{ width: 900, textAlign: 'left', marginTop: 14 }}>
            <RevealLine at={18.77} fps={fps} mark="☠️" color={THEME.red}>envenenamiento de caché · hijacking · exfiltración por subdominios</RevealLine>
            <RevealLine at={34.78} fps={fps} mark="🛡️" color={THEME.green}>defensas: DNSSEC · DNS sobre HTTPS/TLS</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>DNS: <span style={{ color: THEME.cyan }}>ORO DE RECON</span></>}
          subtitle="subdominios y registros revelan la estructura antes de atacar"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Re2Dns: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS['re2-03-dns'];
  const starts = sceneStartFrames('re2-03-dns', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const withAudio = hasAudio('re2-03-dns');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        {withAudio && <Audio src={staticFile('videos/audio/re2-03-dns/re2-03-scene1.wav')} />}
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        {withAudio && <Audio src={staticFile('videos/audio/re2-03-dns/re2-03-scene2.wav')} />}
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        {withAudio && <Audio src={staticFile('videos/audio/re2-03-dns/re2-03-scene3.wav')} />}
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};