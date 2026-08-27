// ── video/remotion/compositions/Ps02VariablesConditions.tsx ──────
// Video: variables, arrays y condiciones.
// Clase 2 de Scripting/PowerShell (lección powershell-02). Guiones: voicebox-scripts/ps-02-*.txt
// Audios reales en public/videos/audio/ps-02-variables-conditionals/ (ffprobe 2026-08-26).

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

// ── Escena 1: la lógica de tus scripts ───────────────────────────
const Scene1: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 32, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 18 }}>
      VARIABLES, <span style={{ color: THEME.red }}>ARRAYS Y CONDICIONES</span>
    </div>
    <div style={{ fontSize: 18, color: THEME.muted, fontFamily: MONO, marginBottom: 28 }}>
      Sintaxis orientada a objetos nacida directamente para la consola
    </div>
    <KeyCapsule label="$nombre = 'kali'" value="variables siempre con $" accent={THEME.cyan} delay={Math.round(2.5 * fps)} size={24} />
    <div style={{ marginTop: 24, fontSize: 17, color: THEME.muted, fontFamily: MONO, textAlign: 'left', width: 780 }}>
      <RevealLine at={5} fps={fps} mark="▸" color={THEME.cyan}>Arrays y Hashtables para modelar objetivos y credenciales</RevealLine>
      <div style={{ height: 10 }} />
      <RevealLine at={9} fps={fps} mark="▸" color={THEME.green}>Condicionales potentes para bifurcar la ejecución</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Escena 2: arrays + hashtables + interpolación ────────────────
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 16 }}>
      ARRAYS, HASHTABLES E <span style={{ color: THEME.green }}>INTERPOLACIÓN</span>
    </div>
    <TerminalWindow title="PS C:\> .\estructuras.ps1" width={940} delay={Math.round(1.5 * fps)}>
      <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.65 }}>
        <span style={{ color: THEME.text }}>$puertos = @(22, 80, 445) </span><span style={{ color: THEME.dim }}>{`# array explícito @(...)`}</span>
        {'\n'}<span style={{ color: THEME.text }}>$rango = 22..80 </span><span style={{ color: THEME.dim }}>{`            # rango numérico rápido`}</span>
        {'\n'}<span style={{ color: THEME.text }}>$servidor = @{`{ ip = "10.0.0.11"; port = 445 }`} </span><span style={{ color: THEME.dim }}>{`# hashtable clave/valor`}</span>
        {'\n'}<span style={{ color: THEME.cyan }}>$servidor.ip</span><span style={{ color: THEME.dim }}>              # 10.0.0.11 (acceso directo a propiedad)</span>
        {'\n'}<span style={{ color: THEME.green }}>"Conectando a $($servidor.ip) en puerto $($servidor.port)"</span>
        {'\n'}<span style={{ color: THEME.amber }}>Conectando a 10.0.0.11 en puerto 445</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
      <KeyCapsule label="@(22, 80, 445) / 22..80" value="arrays y rangos" accent={THEME.cyan} delay={Math.round(4 * fps)} size={16} />
      <KeyCapsule label="@{ ip=... }" value="hashtable clave:valor" accent={THEME.green} delay={Math.round(10 * fps)} size={16} />
      <KeyCapsule label="$($obj.prop)" value="interpolación" accent={THEME.amber} delay={Math.round(15 * fps)} size={16} />
    </div>
  </AbsoluteFill>
);

// ── Escena 3: if, elseif, else + operadores palabra ──────────────
const Scene3: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 16 }}>
      CONDICIONES Y <span style={{ color: THEME.cyan }}>OPERADORES PALABRA</span>
    </div>
    <TerminalWindow title="PS C:\> .\evaluar.ps1" width={940} delay={Math.round(1.5 * fps)}>
      <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.65 }}>
        <span style={{ color: THEME.text }}>$cuenta = "CORP\admin_pablo"</span>
        {'\n'}<span style={{ color: THEME.cyan }}>if</span><span style={{ color: THEME.text }}> ($cuenta </span><span style={{ color: THEME.green }}>-like</span><span style={{ color: THEME.amber }}> "*admin*"</span><span style={{ color: THEME.text }}>) {`{`}</span>
        {'\n'}<span style={{ color: THEME.text }}>    Write-Host "[+] Cuenta administrativa detectada"</span>
        {'\n'}<span style={{ color: THEME.cyan }}>{`}`} elseif</span><span style={{ color: THEME.text }}> ($cuenta </span><span style={{ color: THEME.green }}>-eq</span><span style={{ color: THEME.amber }}> "CORP\guest"</span><span style={{ color: THEME.cyan }}> -or</span><span style={{ color: THEME.text }}> $cuenta </span><span style={{ color: THEME.green }}>-match</span><span style={{ color: THEME.amber }}> "^test"</span><span style={{ color: THEME.text }}>) {`{`}</span>
        {'\n'}<span style={{ color: THEME.text }}>    Write-Host "[-] Cuenta restringida o temporal"</span>
        {'\n'}<span style={{ color: THEME.cyan }}>{`}`} else {`{`}</span>
        {'\n'}<span style={{ color: THEME.text }}>    Write-Host "[*] Usuario de dominio estándar"</span>
        {'\n'}<span style={{ color: THEME.cyan }}>{`}`}</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
      <KeyCapsule label="-eq / -ne / -gt / -lt" value="comparación" accent={THEME.cyan} delay={Math.round(4 * fps)} size={16} />
      <KeyCapsule label="-and / -or / -not" value="lógicos" accent={THEME.amber} delay={Math.round(9 * fps)} size={16} />
      <KeyCapsule label="-like / -match" value="comodines y regex" accent={THEME.green} delay={Math.round(14 * fps)} size={16} />
    </div>
  </AbsoluteFill>
);

export const Ps02VariablesConditions: React.FC = () => {
  const { fps } = useVideoConfig();
  const [s1, s2, s3] = AUDIO_TIMINGS['ps-02-variables-conditionals'];
  const starts = sceneStartFrames('ps-02-variables-conditionals', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const withAudio = hasAudio('ps-02-variables-conditionals');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />
      <Sequence from={starts[0]} durationInFrames={dur1}>
        {withAudio && <Audio src={staticFile('videos/audio/ps-02-variables-conditionals/ps-02-scene1.wav')} />}
        <Scene1 fps={fps} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {withAudio && <Audio src={staticFile('videos/audio/ps-02-variables-conditionals/ps-02-scene2.wav')} />}
        <Scene2 fps={fps} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {withAudio && <Audio src={staticFile('videos/audio/ps-02-variables-conditionals/ps-02-scene3.wav')} />}
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
