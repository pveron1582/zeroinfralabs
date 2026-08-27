// ── video/remotion/compositions/Ps01ObjectsPipeline.tsx ──────────
// Video: qué es PowerShell — objetos, no texto.
// Clase 1 de Scripting/PowerShell (lección powershell-01). Guiones: voicebox-scripts/ps-01-*.txt
// Audios reales en public/videos/audio/ps-01-objects-pipeline/ (ffprobe 2026-08-26).

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

// ── Escena 1: objetos, no texto ──────────────────────────────────
const Scene1: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 32, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 18 }}>
      POWERSHELL: <span style={{ color: THEME.red }}>OBJETOS, NO TEXTO</span>
    </div>
    <div style={{ fontSize: 18, color: THEME.muted, fontFamily: MONO, marginBottom: 28 }}>
      La shell oficial de Windows y el lenguaje estándar de post-explotación
    </div>
    <KeyCapsule label="el pipeline" value="pasa objetos con propiedades" accent={THEME.cyan} delay={Math.round(2.5 * fps)} size={24} />
    <div style={{ marginTop: 24, fontSize: 17, color: THEME.muted, fontFamily: MONO, textAlign: 'left', width: 780 }}>
      <RevealLine at={5.5} fps={fps} mark="▸" color={THEME.cyan}>En vez de parsear líneas con grep/awk, accedes a campos</RevealLine>
      <div style={{ height: 10 }} />
      <RevealLine at={10} fps={fps} mark="▸" color={THEME.green}>Manipulación directa de procesos, servicios y registros</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Escena 2: pipeline de cmdlets ────────────────────────────────
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 16 }}>
      CMDLETS: <span style={{ color: THEME.green }}>VERBO-SUSTANTIVO</span>
    </div>
    <TerminalWindow title="PS C:\> Get-Process | Sort-Object CPU -Descending" width={960} delay={Math.round(1.5 * fps)}>
      <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.65 }}>
        <span style={{ color: THEME.dim }}>PS C:\&gt; </span><span style={{ color: THEME.cyan }}>Get-Process</span><span style={{ color: THEME.text }}> | </span><span style={{ color: THEME.cyan }}>Sort-Object</span><span style={{ color: THEME.text }}> CPU -Descending | </span><span style={{ color: THEME.cyan }}>Select-Object</span><span style={{ color: THEME.text }}> -First 3 Name, CPU</span>
        {'\n'}<span style={{ color: THEME.text }}>Name            CPU</span>
        {'\n'}<span style={{ color: THEME.dim }}>----            ---</span>
        {'\n'}<span style={{ color: THEME.amber }}>lsass          142.50</span>
        {'\n'}<span style={{ color: THEME.amber }}>svchost         98.12</span>
        {'\n'}<span style={{ color: THEME.green }}>powershell      45.60</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
      <KeyCapsule label="Get-Process / Get-Service" value="Verbo-Sustantivo" accent={THEME.cyan} delay={Math.round(4 * fps)} size={16} />
      <KeyCapsule label="Sort-Object CPU" value="ordena por propiedad" accent={THEME.amber} delay={Math.round(9 * fps)} size={16} />
      <KeyCapsule label="Where / Select-Object" value="filtra y proyecta" accent={THEME.green} delay={Math.round(14 * fps)} size={16} />
    </div>
  </AbsoluteFill>
);

// ── Escena 3: scripts .ps1 + execution policy ────────────────────
const Scene3: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 16 }}>
      SCRIPTS <span style={{ color: THEME.cyan }}>.PS1</span> Y EXECUTION POLICY
    </div>
    <TerminalWindow title="PS C:\> powershell -ep bypass -File .\recon.ps1" width={960} delay={Math.round(1.5 * fps)}>
      <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.65 }}>
        <span style={{ color: THEME.dim }}>PS C:\&gt; </span><span style={{ color: THEME.text }}>.\recon.ps1</span>
        {'\n'}<span style={{ color: THEME.red }}>File C:\recon.ps1 cannot be loaded because running scripts is disabled.</span>
        {'\n'}<span style={{ color: THEME.dim }}># Saltear restricción en ejecución de pentest:</span>
        {'\n'}<span style={{ color: THEME.dim }}>PS C:\&gt; </span><span style={{ color: THEME.green }}>powershell -ep bypass -File .\recon.ps1</span>
        {'\n'}<span style={{ color: THEME.green }}>[*] Script ejecutado exitosamente con privilegios del usuario</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
      <KeyCapsule label=".\script.ps1" value="script de PowerShell" accent={THEME.cyan} delay={Math.round(3.5 * fps)} size={16} />
      <KeyCapsule label="Execution Policy" value="bloqueo por defecto" accent={THEME.red} delay={Math.round(7.5 * fps)} size={16} />
      <KeyCapsule label="-ep bypass" value="flag clave en pentest" accent={THEME.green} delay={Math.round(12 * fps)} size={16} />
    </div>
  </AbsoluteFill>
);

export const Ps01ObjectsPipeline: React.FC = () => {
  const { fps } = useVideoConfig();
  const [s1, s2, s3] = AUDIO_TIMINGS['ps-01-objects-pipeline'];
  const starts = sceneStartFrames('ps-01-objects-pipeline', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const withAudio = hasAudio('ps-01-objects-pipeline');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />
      <Sequence from={starts[0]} durationInFrames={dur1}>
        {withAudio && <Audio src={staticFile('videos/audio/ps-01-objects-pipeline/ps-01-scene1.wav')} />}
        <Scene1 fps={fps} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {withAudio && <Audio src={staticFile('videos/audio/ps-01-objects-pipeline/ps-01-scene2.wav')} />}
        <Scene2 fps={fps} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {withAudio && <Audio src={staticFile('videos/audio/ps-01-objects-pipeline/ps-01-scene3.wav')} />}
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
