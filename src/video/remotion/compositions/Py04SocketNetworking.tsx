// ── video/remotion/compositions/Py04SocketNetworking.tsx ─────────
// Video: pentesting I — redes con socket (scanner de puertos).
// Clase 4 de Scripting/Python (lección python-04). Guiones: voicebox-scripts/py-04-*.txt
// Audios reales en public/videos/audio/py-04-socket-networking/ (ffprobe 2026-08-26).

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

// ── Escena 1: el caso real ───────────────────────────────────────
const Scene1: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 32, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 18 }}>
      UN SCANNER <span style={{ color: THEME.red }}>DE PUERTOS</span> EN PYTHON
    </div>
    <div style={{ fontSize: 18, color: THEME.muted, fontFamily: MONO, marginBottom: 28 }}>
      El primer script de red de todo pentester: objetivo 10.0.0.11
    </div>
    <KeyCapsule label="conexión directa" value="conectar es la base de todo" accent={THEME.cyan} delay={Math.round(2.5 * fps)} size={24} />
    <div style={{ marginTop: 24, fontSize: 17, color: THEME.muted, fontFamily: MONO, textAlign: 'left', width: 780 }}>
      <RevealLine at={5} fps={fps} mark="▸" color={THEME.cyan}>Escribís el script y descubrís qué puertos están abiertos</RevealLine>
      <div style={{ height: 10 }} />
      <RevealLine at={9} fps={fps} mark="▸" color={THEME.green}>Entender sockets TCP/UDP te permite programar tus propias herramientas</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Escena 2: banner grabbing con s.recv(1024) ────────────────────
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 16 }}>
      BANNER GRABBING: <span style={{ color: THEME.green }}>IDENTIFICAR SERVICIOS</span>
    </div>
    <TerminalWindow title="kali@attacker-01:~$ python3 banner.py" width={940} delay={Math.round(1.5 * fps)}>
      <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.65 }}>
        <span style={{ color: THEME.cyan }}>import</span><span style={{ color: THEME.text }}> socket</span>
        {'\n'}<span style={{ color: THEME.text }}>s = socket.socket()</span>
        {'\n'}<span style={{ color: THEME.text }}>s.connect((</span><span style={{ color: THEME.green }}>"10.0.0.11"</span><span style={{ color: THEME.text }}>, </span><span style={{ color: THEME.amber }}>21</span><span style={{ color: THEME.text }}>)) </span><span style={{ color: THEME.dim }}># Paso 1: Conectar al puerto</span>
        {'\n'}<span style={{ color: THEME.cyan }}>banner = s.recv(1024).decode()</span><span style={{ color: THEME.dim }}>    # Paso 2: Leer el saludo/versión</span>
        {'\n'}<span style={{ color: THEME.text }}>print(f"[+] Banner: {'{'}banner.strip(){'}'}")</span>
        {'\n'}<span style={{ color: THEME.green }}>[+] Banner: 220 ProFTPD 1.3.5 Server ready.</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
      <KeyCapsule label="s.connect((host, port))" value="conectar socket" accent={THEME.cyan} delay={Math.round(4 * fps)} size={16} />
      <KeyCapsule label="s.recv(1024)" value="leer banner" accent={THEME.green} delay={Math.round(7.5 * fps)} size={16} />
      <KeyCapsule label="servicio y versión" value="elegir exploit" accent={THEME.red} delay={Math.round(11 * fps)} size={16} />
    </div>
  </AbsoluteFill>
);

// ── Escena 3: escáner robusto con try/except y sys.argv ───────────
const Scene3: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 16 }}>
      ESCÁNER ROBUSTO CON <span style={{ color: THEME.cyan }}>TRY / EXCEPT</span>
    </div>
    <TerminalWindow title="kali@attacker-01:~$ python3 scan.py 10.0.0.11" width={940} delay={Math.round(1.5 * fps)}>
      <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.65 }}>
        <span style={{ color: THEME.cyan }}>import</span><span style={{ color: THEME.text }}> socket, sys</span>
        {'\n'}<span style={{ color: THEME.text }}>host = sys.argv[1] </span><span style={{ color: THEME.dim }}># Argumento del host objetivo</span>
        {'\n'}<span style={{ color: THEME.cyan }}>for</span><span style={{ color: THEME.text }}> p </span><span style={{ color: THEME.cyan }}>in</span><span style={{ color: THEME.text }}> [21, 22, 80, 445]:</span>
        {'\n'}<span style={{ color: THEME.cyan }}>    try:</span>
        {'\n'}<span style={{ color: THEME.text }}>        s = socket.socket(); s.settimeout(0.5) </span><span style={{ color: THEME.dim }}># Velocidad sin bloqueos</span>
        {'\n'}<span style={{ color: THEME.text }}>        if s.connect_ex((host, p)) == 0: print(f"[+] {'{'}host{'}'}:{'{'}p{'}'} ABIERTO")</span>
        {'\n'}<span style={{ color: THEME.text }}>        s.close()</span>
        {'\n'}<span style={{ color: THEME.cyan }}>    except:</span><span style={{ color: THEME.text }}> </span><span style={{ color: THEME.dim }}>pass # El timeout no tumba toda la corrida</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
      <KeyCapsule label="sys.argv[1]" value="objetivo CLI" accent={THEME.cyan} delay={Math.round(3.5 * fps)} size={16} />
      <KeyCapsule label="settimeout(0.5)" value="alta velocidad" accent={THEME.amber} delay={Math.round(7.5 * fps)} size={16} />
      <KeyCapsule label="try / except" value="herramienta real" accent={THEME.green} delay={Math.round(11.5 * fps)} size={16} />
    </div>
  </AbsoluteFill>
);

export const Py04SocketNetworking: React.FC = () => {
  const { fps } = useVideoConfig();
  const [s1, s2, s3] = AUDIO_TIMINGS['py-04-socket-networking'];
  const starts = sceneStartFrames('py-04-socket-networking', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const withAudio = hasAudio('py-04-socket-networking');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />
      <Sequence from={starts[0]} durationInFrames={dur1}>
        {withAudio && <Audio src={staticFile('videos/audio/py-04-socket-networking/py-04-scene1.wav')} />}
        <Scene1 fps={fps} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {withAudio && <Audio src={staticFile('videos/audio/py-04-socket-networking/py-04-scene2.wav')} />}
        <Scene2 fps={fps} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {withAudio && <Audio src={staticFile('videos/audio/py-04-socket-networking/py-04-scene3.wav')} />}
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
