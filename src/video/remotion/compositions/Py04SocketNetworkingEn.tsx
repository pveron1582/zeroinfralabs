// ── video/remotion/compositions/Py04SocketNetworkingEn.tsx ─
// English version of py-04-socket-networking. Same visuals; beats
// re-measured against the EN wavs (word-level transcription, 2026-08-30).

import React from 'react';
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { sceneStartFrames, AUDIO_TIMINGS_EN, audioBase } from '../audioTimings';
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

// ── Scene 1: the real case ───────────────────────────────
// EN: port scanner 2.2 · waiting 4.6 · write the script 6.5 ·
// first network script 10.9 · foundation 16.1.
const Scene1: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 32, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 18 }}>
      A <span style={{ color: THEME.red }}>PORT SCANNER</span> IN PYTHON
    </div>
    <div style={{ fontSize: 18, color: THEME.muted, fontFamily: MONO, marginBottom: 28 }}>
      now, for real — the lab target is waiting
    </div>
    <KeyCapsule label="connecting to a port" value="the foundation of everything" accent={THEME.cyan} delay={Math.round(16.1 * fps)} size={24} />
    <div style={{ marginTop: 24, fontSize: 17, color: THEME.muted, fontFamily: MONO, textAlign: 'left', width: 780 }}>
      <RevealLine at={6.5} fps={fps} mark="▸" color={THEME.cyan}>write the script, run it, and see which doors it has open</RevealLine>
      <div style={{ height: 10 }} />
      <RevealLine at={10.9} fps={fps} mark="▸" color={THEME.green}>the first network script every pentester builds</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Scene 2: banner grabbing with s.recv(1024) ───────────
// EN: connecting 0.0 · step two 3.7 · recv 1024 4.8 · banner 7.7 ·
// FTP greets 10.0 · version 12.3 · exploit 18.0.
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 16 }}>
      BANNER GRABBING: <span style={{ color: THEME.green }}>IDENTIFYING SERVICES</span>
    </div>
    <TerminalWindow title="kali@attacker-01:~$ python3 banner.py" width={940} delay={Math.round(0.5 * fps)}>
      <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.65 }}>
        <span style={{ color: THEME.cyan }}>import</span><span style={{ color: THEME.text }}> socket</span>
        {'\n'}<span style={{ color: THEME.text }}>s = socket.socket()</span>
        {'\n'}<span style={{ color: THEME.text }}>s.connect((</span><span style={{ color: THEME.green }}>"10.0.0.11"</span><span style={{ color: THEME.text }}>, </span><span style={{ color: THEME.amber }}>21</span><span style={{ color: THEME.text }}>)) </span><span style={{ color: THEME.dim }}># Step 1: connect to the port</span>
        {'\n'}<span style={{ color: THEME.cyan }}>banner = s.recv(1024).decode()</span><span style={{ color: THEME.dim }}>    # Step 2: read the greeting/version</span>
        {'\n'}<span style={{ color: THEME.text }}>print(f"[+] Banner: {'{'}banner.strip(){'}'}")</span>
        {'\n'}<span style={{ color: THEME.green }}>[+] Banner: 220 ProFTPD 1.3.5 Server ready.</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
      <KeyCapsule label="s.connect((host, port))" value="connect the socket" accent={THEME.cyan} delay={Math.round(0.5 * fps)} size={16} />
      <KeyCapsule label="s.recv(1024)" value="read the banner" accent={THEME.green} delay={Math.round(5.4 * fps)} size={16} />
      <KeyCapsule label="service + version" value="pick an exploit" accent={THEME.red} delay={Math.round(13.3 * fps)} size={16} />
    </div>
    <div style={{ marginTop: 14, fontSize: 15, color: THEME.muted, fontFamily: MONO }}>
      <RevealLine at={10.0} fps={fps} mark="▸" color={THEME.amber}>FTP greets you, SSH sends its version — the data you're after</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Scene 3: robust scanner with try/except and sys.argv ─
// EN: pattern 0.2 · sys argv 2.3 · loop over ports 4.5 · try except
// 7.6 · timeouts 8.6 · set timeout 10.2 · closed port 14.5 · demo
// vs tool 17.3.
const Scene3: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 16 }}>
      A ROBUST SCANNER WITH <span style={{ color: THEME.cyan }}>TRY / EXCEPT</span>
    </div>
    <TerminalWindow title="kali@attacker-01:~$ python3 scan.py 10.0.0.11" width={940} delay={Math.round(1.6 * fps)}>
      <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.65 }}>
        <span style={{ color: THEME.cyan }}>import</span><span style={{ color: THEME.text }}> socket, sys</span>
        {'\n'}<span style={{ color: THEME.text }}>host = sys.argv[1] </span><span style={{ color: THEME.dim }}># the target host argument</span>
        {'\n'}<span style={{ color: THEME.cyan }}>for</span><span style={{ color: THEME.text }}> p </span><span style={{ color: THEME.cyan }}>in</span><span style={{ color: THEME.text }}> [21, 22, 80, 445]:</span>
        {'\n'}<span style={{ color: THEME.cyan }}>    try:</span>
        {'\n'}<span style={{ color: THEME.text }}>        s = socket.socket(); s.settimeout(0.5) </span><span style={{ color: THEME.dim }}># dial in the speed</span>
        {'\n'}<span style={{ color: THEME.text }}>        if s.connect_ex((host, p)) == 0: print(f"[+] {'{'}host{'}'}:{'{'}p{'}'} OPEN")</span>
        {'\n'}<span style={{ color: THEME.text }}>        s.close()</span>
        {'\n'}<span style={{ color: THEME.cyan }}>    except:</span><span style={{ color: THEME.text }}> </span><span style={{ color: THEME.dim }}>pass # the timeout doesn't bring down the run</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
      <KeyCapsule label="sys.argv[1]" value="CLI target" accent={THEME.cyan} delay={Math.round(2.6 * fps)} size={16} />
      <KeyCapsule label="settimeout(0.5)" value="dial in the speed" accent={THEME.amber} delay={Math.round(10.2 * fps)} size={16} />
      <KeyCapsule label="try / except" value="a real tool" accent={THEME.green} delay={Math.round(7.6 * fps)} size={16} />
    </div>
    <div style={{ marginTop: 14, fontSize: 15, color: THEME.muted, fontFamily: MONO }}>
      <RevealLine at={13.3} fps={fps} mark="▸" color={THEME.green}>one closed port doesn't bring down the whole run — that's the difference between a demo and a tool</RevealLine>
    </div>
  </AbsoluteFill>
);

export const Py04SocketNetworkingEn: React.FC = () => {
  const { fps } = useVideoConfig();
  const [s1, s2, s3] = AUDIO_TIMINGS_EN['py-04-socket-networking'];
  const starts = sceneStartFrames('py-04-socket-networking', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />
      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/py-04-socket-networking/py-04-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/py-04-socket-networking/py-04-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/py-04-socket-networking/py-04-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
