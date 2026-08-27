// ── video/remotion/compositions/Ps03LoopsCmdlets.tsx ─────────────
// Video: bucles, funciones y cmdlets útiles.
// Clase 3 de Scripting/PowerShell (lección powershell-03). Guiones: voicebox-scripts/ps-03-*.txt
// Audios reales en public/videos/audio/ps-03-loops-cmdlets/ (ffprobe 2026-08-26).

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

// ── Escena 1: automatizar casi todo ──────────────────────────────
const Scene1: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 32, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 18 }}>
      BUCLES, <span style={{ color: THEME.red }}>FUNCIONES Y CMDLETS</span>
    </div>
    <div style={{ fontSize: 18, color: THEME.muted, fontFamily: MONO, marginBottom: 28 }}>
      Automatización de tareas de administración y vectores de ataque
    </div>
    <KeyCapsule label="potencia de objetos" value="filtrar y transformar en el pipe" accent={THEME.cyan} delay={Math.round(2.5 * fps)} size={24} />
    <div style={{ marginTop: 24, fontSize: 17, color: THEME.muted, fontFamily: MONO, textAlign: 'left', width: 780 }}>
      <RevealLine at={5} fps={fps} mark="▸" color={THEME.cyan}>Cada elemento del pipeline es un objeto con propiedades</RevealLine>
      <div style={{ height: 10 }} />
      <RevealLine at={9} fps={fps} mark="▸" color={THEME.green}>Las piezas fundamentales que más vas a usar en scripts</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Escena 2: foreach, ForEach-Object con $_, for, while ─────────
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 16 }}>
      BUCLES Y <span style={{ color: THEME.green }}>$_ (OBJETO ACTUAL)</span>
    </div>
    <TerminalWindow title="PS C:\> .\bucles.ps1" width={940} delay={Math.round(1.5 * fps)}>
      <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.65 }}>
        <span style={{ color: THEME.dim }}># 1. Bucle foreach sobre una lista</span>
        {'\n'}<span style={{ color: THEME.cyan }}>foreach</span><span style={{ color: THEME.text }}> ($p </span><span style={{ color: THEME.cyan }}>in</span><span style={{ color: THEME.text }}> @(21, 22, 80, 445)) {`{`} </span><span style={{ color: THEME.green }}>"Puerto: $p"</span><span style={{ color: THEME.text }}> {`}`}</span>
        {'\n'}<span style={{ color: THEME.dim }}># 2. Pipeline ForEach-Object con $_ (la estrella)</span>
        {'\n'}<span style={{ color: THEME.cyan }}>Get-Process</span><span style={{ color: THEME.text }}> | </span><span style={{ color: THEME.cyan }}>ForEach-Object</span><span style={{ color: THEME.text }}> {`{`} </span><span style={{ color: THEME.amber }}>$_.Name</span><span style={{ color: THEME.text }}> {`}`} </span><span style={{ color: THEME.dim }}># extrae el nombre de cada proceso</span>
        {'\n'}<span style={{ color: THEME.dim }}># 3. For numérico y While con condición</span>
        {'\n'}<span style={{ color: THEME.cyan }}>for</span><span style={{ color: THEME.text }}> ($i=1; $i -le 254; $i++) {`{`} </span><span style={{ color: THEME.green }}>"192.168.1.$i"</span><span style={{ color: THEME.text }}> {`}`}</span>
        {'\n'}<span style={{ color: THEME.cyan }}>while</span><span style={{ color: THEME.text }}> ($true) {`{`} $res = Escuchar(); </span><span style={{ color: THEME.cyan }}>if</span><span style={{ color: THEME.text }}> ($res) {`{`} </span><span style={{ color: THEME.red }}>break</span><span style={{ color: THEME.text }}> {`}`} {`}`}</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
      <KeyCapsule label="foreach ($x in $list)" value="itera colección" accent={THEME.cyan} delay={Math.round(4 * fps)} size={16} />
      <KeyCapsule label="ForEach-Object { $_ }" value="objeto actual en pipe" accent={THEME.green} delay={Math.round(8.5 * fps)} size={16} />
      <KeyCapsule label="for / while ($cond)" value="rangos y control" accent={THEME.amber} delay={Math.round(14 * fps)} size={16} />
    </div>
  </AbsoluteFill>
);

// ── Escena 3: funciones + I/O + Web/JSON ──────────────────────────
const Scene3: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 16 }}>
      FUNCIONES Y <span style={{ color: THEME.cyan }}>CMDLETS ESENCIALES</span>
    </div>
    <TerminalWindow title="PS C:\> .\funciones.ps1" width={940} delay={Math.round(1.5 * fps)}>
      <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.65 }}>
        <span style={{ color: THEME.cyan }}>function</span><span style={{ color: THEME.green }}> Escanear</span><span style={{ color: THEME.text }}> {`{`}</span>
        {'\n'}<span style={{ color: THEME.cyan }}>    param</span><span style={{ color: THEME.text }}>($host, $puerto)</span>
        {'\n'}<span style={{ color: THEME.dim }}>    # I/O: Get-Content lee | Out-File escribe | Add-Content agrega</span>
        {'\n'}<span style={{ color: THEME.dim }}>    # HTTP y APIs: Invoke-WebRequest (iwr) y ConvertTo/From-Json</span>
        {'\n'}<span style={{ color: THEME.text }}>    $api = </span><span style={{ color: THEME.cyan }}>Invoke-WebRequest</span><span style={{ color: THEME.green }}> "http://$host/api"</span><span style={{ color: THEME.text }}> | </span><span style={{ color: THEME.cyan }}>ConvertFrom-Json</span>
        {'\n'}<span style={{ color: THEME.text }}>{`}`}</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
      <KeyCapsule label="function F { param() }" value="define funciones" accent={THEME.cyan} delay={Math.round(4 * fps)} size={16} />
      <KeyCapsule label="Get-Content / Out-File" value="lectura y escritura" accent={THEME.green} delay={Math.round(8 * fps)} size={16} />
      <KeyCapsule label="iwr / ConvertTo-Json" value="HTTP y serialización" accent={THEME.purple} delay={Math.round(13 * fps)} size={16} />
    </div>
  </AbsoluteFill>
);

export const Ps03LoopsCmdlets: React.FC = () => {
  const { fps } = useVideoConfig();
  const [s1, s2, s3] = AUDIO_TIMINGS['ps-03-loops-cmdlets'];
  const starts = sceneStartFrames('ps-03-loops-cmdlets', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const withAudio = hasAudio('ps-03-loops-cmdlets');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />
      <Sequence from={starts[0]} durationInFrames={dur1}>
        {withAudio && <Audio src={staticFile('videos/audio/ps-03-loops-cmdlets/ps-03-scene1.wav')} />}
        <Scene1 fps={fps} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {withAudio && <Audio src={staticFile('videos/audio/ps-03-loops-cmdlets/ps-03-scene2.wav')} />}
        <Scene2 fps={fps} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {withAudio && <Audio src={staticFile('videos/audio/ps-03-loops-cmdlets/ps-03-scene3.wav')} />}
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
