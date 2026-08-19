// ── video/remotion/compositions/Ci04Cryptography.tsx ───────────────
// Video: Bases de criptografía — cifrado vs hash, simétrica vs asimétrica
// y dónde se ve todos los días. Lección ciber-04 (Fundamentos de
// Ciberseguridad). Guiones: voicebox-scripts/ci-04-*.txt
// ⚠️ AUDIO PENDIENTE: hasAudio() es false → se renderiza mudo hasta que
// lleguen los wavs y se reemplacen los timings estimados.

import React from 'react';
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { sceneStartFrames, AUDIO_TIMINGS, hasAudio } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
import { TitleScene } from '../primitives/TitleScene';
import { RevealLine } from '../primitives/RevealLine';
import { TerminalWindow } from '../primitives/TerminalWindow';
import { KeyCapsule } from '../primitives/KeyCapsule';

const CENTERED: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  textAlign: 'center',
};

// ── Escena 1: qué es + cifrado vs hash ─────────────────────────────
const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(6 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>PRIMAS, <span style={{ color: THEME.cyan }}>NO GEMELAS</span></>}
          subtitle="cifrado y hash: la base de la criptografía"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 22, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
            EL ALGORITMO ES PÚBLICO · <span style={{ color: THEME.amber }}>LA CLAVE ES EL SECRETO</span>
          </div>
          <div style={{ display: 'flex', gap: 20, width: 1060, justifyContent: 'center' }}>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.cyan}60`, borderRadius: 16, padding: '20px 22px', textAlign: 'left' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: THEME.cyan, fontFamily: MONO, marginBottom: 12 }}>
                <RevealLine at={8} fps={fps} mark="" color={THEME.cyan}>CIFRADO 🔄</RevealLine>
              </div>
              <RevealLine at={10} fps={fps} mark="▸" color={THEME.cyan}>reversible: con la clave recuperás el dato</RevealLine>
              <RevealLine at={14} fps={fps} mark="▸" color={THEME.cyan}>protege datos que vas a leer</RevealLine>
            </div>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.purple}60`, borderRadius: 16, padding: '20px 22px', textAlign: 'left' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: THEME.purple, fontFamily: MONO, marginBottom: 12 }}>
                <RevealLine at={9} fps={fps} mark="" color={THEME.purple}>HASH 🧬</RevealLine>
              </div>
              <RevealLine at={11} fps={fps} mark="▸" color={THEME.purple}>un solo sentido: no se deshashea</RevealLine>
              <RevealLine at={15} fps={fps} mark="▸" color={THEME.purple}>verifica integridad, no guarda el dato</RevealLine>
            </div>
          </div>
          <div style={{ width: 900, textAlign: 'left', marginTop: 18 }}>
            <RevealLine at={18} fps={fps} mark="▸" color={THEME.amber}>si se puede descifrar es cifrado · si no hay vuelta, es hash</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 2: simétrica vs asimétrica ──────────────────────────────
const Scene2: React.FC<{ fps: number }> = ({ fps }) => {
  const comboAt = Math.round(13 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={comboAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 30 }}>
            DOS <span style={{ color: THEME.green }}>FAMILIAS</span>
          </div>
          <div style={{ display: 'flex', gap: 60, width: 1060, justifyContent: 'center' }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 14 }}>
                <RevealLine at={2} fps={fps} mark="" color={THEME.green}>SIMÉTRICA</RevealLine>
              </div>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginBottom: 12 }}>
                <KeyCapsule label="misma clave" value="🔑" accent={THEME.green} delay={Math.round(3 * fps)} size={30} />
                <KeyCapsule label="una para cifrar y descifrar" value="🔓🔒" accent={THEME.green} delay={Math.round(4.5 * fps)} size={30} />
              </div>
              <RevealLine at={7} fps={fps} mark="▸" color={THEME.green}>rápida · AES, ChaCha20</RevealLine>
              <RevealLine at={9} fps={fps} mark="⚠" color={THEME.amber}>hay que acordar la clave sin que se filtre</RevealLine>
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: THEME.cyan, fontFamily: MONO, marginBottom: 14 }}>
                <RevealLine at={3} fps={fps} mark="" color={THEME.cyan}>ASIMÉTRICA</RevealLine>
              </div>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginBottom: 12 }}>
                <KeyCapsule label="pública · cualquiera" value="🔓" accent={THEME.cyan} delay={Math.round(4.5 * fps)} size={30} />
                <KeyCapsule label="privada · solo el dueño" value="🔒" accent={THEME.cyan} delay={Math.round(5.5 * fps)} size={30} />
              </div>
              <RevealLine at={8} fps={fps} mark="▸" color={THEME.cyan}>lo que cifra una, solo lo descifra la otra</RevealLine>
              <RevealLine at={10} fps={fps} mark="▸" color={THEME.cyan}>más lenta · RSA, ECC</RevealLine>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={comboAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
            HTTPS USA <span style={{ color: THEME.amber }}>LAS DOS</span>
          </div>
          <TerminalWindow title="🔒 https://example.com" width={780} delay={Math.round(2 * fps)}>
            <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.8 }}>
              <span style={{ color: THEME.cyan }}>ASIMÉTRICA</span> → intercambia la clave al inicio
              {'\n'}<span style={{ color: THEME.green }}>SIMÉTRICA</span>   → lleva todo el tráfico después
              {'\n'}TLS 1.3 · AES + RSA/ECDHE
            </div>
          </TerminalWindow>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 3: dónde la ves + cierre ────────────────────────────────
const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(12 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
            DÓNDE LA VES <span style={{ color: THEME.green }}>TODOS LOS DÍAS</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, width: 900 }}>
            <RevealLine at={2.5} fps={fps} mark="🔒" color={THEME.cyan}>HTTPS: el candado del navegador</RevealLine>
            <RevealLine at={4.5} fps={fps} mark="🗝️" color={THEME.purple}>SSH: tu par de claves autentica</RevealLine>
            <RevealLine at={6.5} fps={fps} mark="🧅" color={THEME.amber}>VPN: el túnel cifrado (WireGuard, IPsec)</RevealLine>
            <RevealLine at={8.5} fps={fps} mark="🧬" color={THEME.green}>contraseñas: hashes, no cifrado</RevealLine>
            <RevealLine at={10.5} fps={fps} mark="✍️" color={THEME.red}>firmas digitales: privada firma, pública verifica</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>CIFRADO = <span style={{ color: THEME.cyan }}>LEER</span> · HASH = <span style={{ color: THEME.purple }}>VERIFICAR</span></>}
          subtitle="primas, no gemelas"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Ci04Cryptography: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS['ci-04-cryptography'];
  const starts = sceneStartFrames('ci-04-cryptography', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const withAudio = hasAudio('ci-04-cryptography');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        {withAudio && <Audio src={staticFile('videos/audio/ci-04-cryptography/ci-04-scene1.wav')} />}
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        {withAudio && <Audio src={staticFile('videos/audio/ci-04-cryptography/ci-04-scene2.wav')} />}
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        {withAudio && <Audio src={staticFile('videos/audio/ci-04-cryptography/ci-04-scene3.wav')} />}
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};