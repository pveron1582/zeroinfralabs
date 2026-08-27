// ── video/remotion/compositions/Py02TypesConditions.tsx ──────────
// Video: variables, tipos y condiciones.
// Clase 2 de Scripting/Python (lección python-02). Guiones: voicebox-scripts/py-02-*.txt
// Audios reales en public/videos/audio/py-02-types-conditions/ (ffprobe 2026-08-26).

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

// ── Escena 1: pocos tipos, intuitivos ────────────────────────────
const Scene1: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 32, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 18 }}>
      TIPOS Y <span style={{ color: THEME.red }}>CONDICIONES</span>
    </div>
    <div style={{ fontSize: 18, color: THEME.muted, fontFamily: MONO, marginBottom: 28 }}>
      Números, textos, listas y diccionarios para modelar ataques
    </div>
    <KeyCapsule label="4 tipos y un if" value="modelás cualquier pentest" accent={THEME.cyan} delay={Math.round(2.5 * fps)} size={24} />
    <div style={{ marginTop: 24, fontSize: 17, color: THEME.muted, fontFamily: MONO, textAlign: 'left', width: 780 }}>
      <RevealLine at={5} fps={fps} mark="▸" color={THEME.cyan}>Estructuras claras para IPs, puertos y respuestas</RevealLine>
      <div style={{ height: 10 }} />
      <RevealLine at={9} fps={fps} mark="▸" color={THEME.green}>La parte del lenguaje que más vas a usar en scripts</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Escena 2: los 4 tipos básicos + f-strings ────────────────────
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 16 }}>
      LOS CUATRO <span style={{ color: THEME.green }}>TIPOS BÁSICOS</span>
    </div>
    <TerminalWindow title="kali@attacker-01:~$ python3 -i tipos.py" width={940} delay={Math.round(1.5 * fps)}>
      <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.65 }}>
        <span style={{ color: THEME.text }}>texto = </span><span style={{ color: THEME.green }}>"10.0.0.11"</span><span style={{ color: THEME.dim }}>{`            # str (texto entre comillas)`}</span>
        {'\n'}<span style={{ color: THEME.text }}>puerto = </span><span style={{ color: THEME.amber }}>80</span><span style={{ color: THEME.dim }}>{`                   # int (número entero)`}</span>
        {'\n'}<span style={{ color: THEME.text }}>abiertos = [</span><span style={{ color: THEME.amber }}>22</span><span style={{ color: THEME.text }}>, </span><span style={{ color: THEME.amber }}>80</span><span style={{ color: THEME.text }}>, </span><span style={{ color: THEME.amber }}>445</span><span style={{ color: THEME.text }}>]</span><span style={{ color: THEME.dim }}>{`         # list -> abiertos[0] es 22`}</span>
        {'\n'}<span style={{ color: THEME.text }}>servidor = {`{"os": "Linux", "web": "Apache"}`}</span><span style={{ color: THEME.dim }}>{` # dict -> servidor["os"]`}</span>
        {'\n'}<span style={{ color: THEME.cyan }}>info = f"{'{'}texto{'}'}:{'{'}puerto{'}'} activo"</span><span style={{ color: THEME.dim }}>{`      # f-string con variables`}</span>
        {'\n'}<span style={{ color: THEME.dim }}>{`# len(abiertos) es 3  |  80 in abiertos es True`}</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
      <KeyCapsule label="abiertos[0]" value="índice de lista" accent={THEME.cyan} delay={Math.round(8 * fps)} size={16} />
      <KeyCapsule label='servidor["os"]' value="clave de dict" accent={THEME.green} delay={Math.round(11 * fps)} size={16} />
      <KeyCapsule label='f"{var}"' value="f-string dinámico" accent={THEME.amber} delay={Math.round(14 * fps)} size={16} />
      <KeyCapsule label="len() / in" value="tamaño y pertenencia" accent={THEME.purple} delay={Math.round(17.5 * fps)} size={16} />
    </div>
  </AbsoluteFill>
);

// ── Escena 3: if, elif, else + int(input()) ─────────────────────
const Scene3: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 16 }}>
      CONDICIONALES: <span style={{ color: THEME.cyan }}>IF, ELIF, ELSE</span>
    </div>
    <TerminalWindow title="kali@attacker-01:~$ python3 decision.py" width={940} delay={Math.round(1.5 * fps)}>
      <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.65 }}>
        <span style={{ color: THEME.text }}>puerto = </span><span style={{ color: THEME.green }}>int</span><span style={{ color: THEME.text }}>(</span><span style={{ color: THEME.green }}>input</span><span style={{ color: THEME.text }}>("Puerto a probar: ")) </span><span style={{ color: THEME.dim }}>{`# input() da str -> convertí a int`}</span>
        {'\n'}<span style={{ color: THEME.cyan }}>if</span><span style={{ color: THEME.text }}> puerto == </span><span style={{ color: THEME.amber }}>22</span><span style={{ color: THEME.cyan }}>:</span>
        {'\n'}<span style={{ color: THEME.text }}>    print("[+] Servicio seguro: SSH") </span><span style={{ color: THEME.dim }}># bloque indentado</span>
        {'\n'}<span style={{ color: THEME.cyan }}>elif</span><span style={{ color: THEME.text }}> puerto == </span><span style={{ color: THEME.amber }}>80</span><span style={{ color: THEME.cyan }}> or</span><span style={{ color: THEME.text }}> puerto == </span><span style={{ color: THEME.amber }}>443</span><span style={{ color: THEME.cyan }}>:</span>
        {'\n'}<span style={{ color: THEME.text }}>    print("[+] Servicio Web activo")</span>
        {'\n'}<span style={{ color: THEME.cyan }}>else:</span>
        {'\n'}<span style={{ color: THEME.text }}>    print("[-] Servicio no catalogado")</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
      <KeyCapsule label="if / elif / else:" value="dos puntos y sangría" accent={THEME.cyan} delay={Math.round(4 * fps)} size={17} />
      <KeyCapsule label="== != < > and or not" value="comparaciones" accent={THEME.green} delay={Math.round(9 * fps)} size={17} />
      <KeyCapsule label="int(input())" value="texto a número" accent={THEME.amber} delay={Math.round(14 * fps)} size={17} />
    </div>
  </AbsoluteFill>
);

export const Py02TypesConditions: React.FC = () => {
  const { fps } = useVideoConfig();
  const [s1, s2, s3] = AUDIO_TIMINGS['py-02-types-conditions'];
  const starts = sceneStartFrames('py-02-types-conditions', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const withAudio = hasAudio('py-02-types-conditions');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />
      <Sequence from={starts[0]} durationInFrames={dur1}>
        {withAudio && <Audio src={staticFile('videos/audio/py-02-types-conditions/py-02-scene1.wav')} />}
        <Scene1 fps={fps} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {withAudio && <Audio src={staticFile('videos/audio/py-02-types-conditions/py-02-scene2.wav')} />}
        <Scene2 fps={fps} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {withAudio && <Audio src={staticFile('videos/audio/py-02-types-conditions/py-02-scene3.wav')} />}
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
