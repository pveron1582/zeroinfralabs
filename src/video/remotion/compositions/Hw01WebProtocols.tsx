// ── video/remotion/compositions/Hw01WebProtocols.tsx ─────────────
// Video: protocolos web — HTTP, HTTPS y más.
// Clase 1 de Hacking Web (lección proto-02). Guiones: voicebox-scripts/hw-01-*.txt
// Audios reales en public/videos/audio-es/hw-01-web-protocols/ (2026-08-25).

import React from 'react';
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { sceneStartFrames, AUDIO_TIMINGS, hasAudio } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
import { RevealLine } from '../primitives/RevealLine';
import { KeyCapsule } from '../primitives/KeyCapsule';
import { TerminalWindow } from '../primitives/TerminalWindow';

const CENTERED: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  textAlign: 'center',
};

// ── Escena 1: la web como campo de batalla + HTTP ─────────────────
// Habla: "HTTP…" (2.87) · "GET/POST" (9.03) · "cabeceras/cookies" (13.51)
const Scene1: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      LA WEB: <span style={{ color: THEME.red }}>EL CAMPO DE BATALLA</span>
    </div>
    <div style={{ fontSize: 18, color: THEME.muted, fontFamily: MONO, marginBottom: 28 }}>
      HTTP y HTTPS son sus dos idiomas principales
    </div>
    <KeyCapsule label="HTTP" value="puerto 80 · texto plano" accent={THEME.cyan} delay={Math.round(2.9 * fps)} size={26} />
    <div style={{ marginTop: 18, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
      <RevealLine at={9.0} fps={fps} mark="▸" color={THEME.cyan}>GET pide un recurso · POST envía datos</RevealLine>
      <br />
      <RevealLine at={13.5} fps={fps} mark="▸" color={THEME.cyan}>cabeceras y cookies llevan la sesión</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Escena 2: curl -I al servidor ────────────────────────────────
// Habla: intro (0-6.5) · "Server…" (13.69) · "primer dato" (17.83)
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      A VER QUÉ <span style={{ color: THEME.green }}>CORRE EL SERVIDOR</span>
    </div>
    <TerminalWindow title="kali@attacker-01:~$ curl -I http://10.0.0.11" width={920} delay={Math.round(2.5 * fps)}>
      <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.8 }}>
        <span style={{ color: THEME.dim }}>HTTP/1.1 200 OK</span>
        {'\n'}<span style={{ color: THEME.dim }}>Date: Mon, 10 Aug 2026 14:22:05 GMT</span>
        {'\n'}<span style={{ color: THEME.green }}>Server: Apache/2.4.41 (Ubuntu)</span>
        {'\n'}<span style={{ color: THEME.dim }}>Content-Type: text/html</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 16, marginTop: 26 }}>
      <KeyCapsule label="Server:" value="versión expuesta" accent={THEME.amber} delay={Math.round(13.7 * fps)} size={22} />
      <KeyCapsule label="primer dato" value="elegir exploit" accent={THEME.green} delay={Math.round(17.8 * fps)} size={22} />
    </div>
  </AbsoluteFill>
);

// ── Escena 3: HTTPS + otros protocolos ───────────────────────────
// Habla: "puerto 443" (1.87) · "el cifrado" (8.09) · "WebSocket…" (17.08)
const Scene3: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      HTTPS: <span style={{ color: THEME.green }}>CANAL CIFRADO</span>, APP EXPUESTA
    </div>
    <div style={{ width: 980, textAlign: 'left' }}>
      <RevealLine at={1.9} fps={fps} mark="▸" color={THEME.green}>puerto 443 · TLS cifra el contenido</RevealLine>
      <RevealLine at={8.1} fps={fps} mark="▸" color={THEME.amber}>el cifrado protege el canal, no la app</RevealLine>
      <RevealLine at={17.1} fps={fps} mark="▸" color={THEME.cyan}>WebSocket · WebDAV · REST/API · DNS</RevealLine>
    </div>
    <div style={{ marginTop: 22, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
      el DNS también puede filtrar datos en consultas
    </div>
  </AbsoluteFill>
);

export const Hw01WebProtocols: React.FC = () => {
  const { fps } = useVideoConfig();
  const [s1, s2, s3] = AUDIO_TIMINGS['hw-01-web-protocols'];
  const starts = sceneStartFrames('hw-01-web-protocols', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const withAudio = hasAudio('hw-01-web-protocols');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />
      <Sequence from={starts[0]} durationInFrames={dur1}>
        {withAudio && <Audio src={staticFile('videos/audio-es/hw-01-web-protocols/hw-01-scene1.wav')} />}
        <Scene1 fps={fps} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {withAudio && <Audio src={staticFile('videos/audio-es/hw-01-web-protocols/hw-01-scene2.wav')} />}
        <Scene2 fps={fps} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {withAudio && <Audio src={staticFile('videos/audio-es/hw-01-web-protocols/hw-01-scene3.wav')} />}
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
