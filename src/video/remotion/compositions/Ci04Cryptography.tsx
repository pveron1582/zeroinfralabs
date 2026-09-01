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
// Beats reales del wav ES (2026-08-30): dos operaciones 5.0 · cifrar
// 6.1 · descifrar 9.0 · algoritmo público 11.0 · clave 13.5 · ruido
// 15.1 · reversible 20.6 · un solo sentido 23.6 · "es hash" 29.2.
// Panel en 5.0s.
const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(5.0 * fps);
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
                <RevealLine at={1.1} fps={fps} mark="" color={THEME.cyan}>CIFRADO 🔄</RevealLine>
              </div>
              <RevealLine at={15.6} fps={fps} mark="▸" color={THEME.cyan}>reversible: con la clave recuperás el dato</RevealLine>
              <RevealLine at={22.1} fps={fps} mark="▸" color={THEME.cyan}>"si se puede descifrar, es cifrado"</RevealLine>
            </div>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.purple}60`, borderRadius: 16, padding: '20px 22px', textAlign: 'left' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: THEME.purple, fontFamily: MONO, marginBottom: 12 }}>
                <RevealLine at={18.6} fps={fps} mark="" color={THEME.purple}>HASH 🧬</RevealLine>
              </div>
              <RevealLine at={18.6} fps={fps} mark="▸" color={THEME.purple}>de un solo sentido: no hay vuelta atrás</RevealLine>
              <RevealLine at={24.2} fps={fps} mark="▸" color={THEME.purple}>"si no hay vuelta atrás, es hash"</RevealLine>
            </div>
          </div>
          <div style={{ width: 900, textAlign: 'left', marginTop: 18 }}>
            <RevealLine at={10.1} fps={fps} mark="▸" color={THEME.amber}>sin la clave, el cifrado es solo ruido</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 2: simétrica vs asimétrica ──────────────────────────────
// Beats reales: dos familias 0.0 · simétrica 1.1 · AES 5.8 · se
/// filtre 8.6 · asimétrica 9.6 · pública 11.6 · privada 14.0 · cifra
// una 16.2 · lenta 18.8 · HTTPS juntas 21.4. comboAt 21.4.
const Scene2: React.FC<{ fps: number }> = ({ fps }) => {
  const comboAt = Math.round(21.4 * fps);
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
                <RevealLine at={1.1} fps={fps} mark="" color={THEME.green}>SIMÉTRICA</RevealLine>
              </div>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginBottom: 12 }}>
                <KeyCapsule label="clave compartida" value="🔑" accent={THEME.green} delay={Math.round(2.4 * fps)} size={30} />
                <KeyCapsule label="cifrar y descifrar" value="🔓🔒" accent={THEME.green} delay={Math.round(3.6 * fps)} size={30} />
              </div>
              <RevealLine at={0.8} fps={fps} mark="▸" color={THEME.green}>rápida, como AES</RevealLine>
              <RevealLine at={3.6} fps={fps} mark="⚠" color={THEME.amber}>acordar la clave sin que se filtre</RevealLine>
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: THEME.cyan, fontFamily: MONO, marginBottom: 14 }}>
                <RevealLine at={9.6} fps={fps} mark="" color={THEME.cyan}>ASIMÉTRICA</RevealLine>
              </div>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginBottom: 12 }}>
                <KeyCapsule label="pública · cualquiera" value="🔓" accent={THEME.cyan} delay={Math.round(6.6 * fps)} size={30} />
                <KeyCapsule label="privada · solo el dueño" value="🔒" accent={THEME.cyan} delay={Math.round(9.0 * fps)} size={30} />
              </div>
              <RevealLine at={11.2} fps={fps} mark="▸" color={THEME.cyan}>lo que cifra una, solo lo descifra la otra</RevealLine>
              <RevealLine at={13.9} fps={fps} mark="▸" color={THEME.cyan}>más lenta, sin secreto compartido</RevealLine>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={comboAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
            HTTPS USA <span style={{ color: THEME.amber }}>LAS DOS</span>
          </div>
          <TerminalWindow title="🔒 https://example.com" width={780} delay={Math.round(2.2 * fps)}>
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
// Beats reales: HTTPS 2.1 · SSH 7.4 · VPN 10.8 · contraseñas 13.4 ·
// firmas 19.5 · primas 25.6 · verificar 30.6. closeAt 25.6.
const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(25.6 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
            DÓNDE LA VES <span style={{ color: THEME.green }}>TODOS LOS DÍAS</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, width: 900 }}>
            <RevealLine at={2.1} fps={fps} mark="🔒" color={THEME.cyan}>HTTPS: el candado del navegador (AES + RSA)</RevealLine>
            <RevealLine at={7.4} fps={fps} mark="🗝️" color={THEME.purple}>SSH: tu par de claves autentica</RevealLine>
            <RevealLine at={10.8} fps={fps} mark="🧅" color={THEME.amber}>VPN: cifra el túnel completo</RevealLine>
            <RevealLine at={13.4} fps={fps} mark="🧬" color={THEME.green}>contraseñas: hashes, no cifrado</RevealLine>
            <RevealLine at={19.5} fps={fps} mark="✍️" color={THEME.red}>firmas: la privada firma, la pública prueba que es genuino</RevealLine>
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
        {withAudio && <Audio src={staticFile('videos/audio-es/ci-04-cryptography/ci-04-scene1.wav')} />}
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        {withAudio && <Audio src={staticFile('videos/audio-es/ci-04-cryptography/ci-04-scene2.wav')} />}
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        {withAudio && <Audio src={staticFile('videos/audio-es/ci-04-cryptography/ci-04-scene3.wav')} />}
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};