// ── video/remotion/compositions/Hk05OfflineCracking.tsx ────────────
// Video: cracking offline — john the ripper + hashcat.
// Lección hacking-05 (Pentesting). Guiones: voicebox-scripts/hk-05-*.txt
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

// ── Escena 1: qué es el cracking offline ────────────────────────────
const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(6 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>YA TENÉS EL HASH: <span style={{ color: THEME.cyan }}>CRACKING OFFLINE</span></>}
          subtitle="en tu máquina, a tu ritmo, sin alertas"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 24, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
            EL ESCENARIO: <span style={{ color: THEME.green }}>TENÉS EL HASH</span>, NO EL SERVIDOR
          </div>
          <div style={{ display: 'flex', gap: 24, width: 1100, justifyContent: 'center' }}>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.cyan}60`, borderRadius: 16, padding: '22px 24px', textAlign: 'left' }}>
              <div style={{ fontSize: 19, fontWeight: 800, color: THEME.cyan, fontFamily: MONO, marginBottom: 12 }}>
                <RevealLine at={8} fps={fps} mark="" color={THEME.cyan}>EN TU PROPIA MÁQUINA</RevealLine>
              </div>
              <RevealLine at={11} fps={fps} mark="▸" color={THEME.cyan}>sin intentos que cuenten</RevealLine>
              <RevealLine at={14} fps={fps} mark="▸" color={THEME.cyan}>sin bloqueos ni alertas</RevealLine>
            </div>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.amber}60`, borderRadius: 16, padding: '22px 24px', textAlign: 'left' }}>
              <div style={{ fontSize: 19, fontWeight: 800, color: THEME.amber, fontFamily: MONO, marginBottom: 12 }}>
                <RevealLine at={9} fps={fps} mark="" color={THEME.amber}>EL LÍMITE ES EL TIEMPO</RevealLine>
              </div>
              <RevealLine at={12} fps={fps} mark="▸" color={THEME.amber}>hash débil → segundos</RevealLine>
              <RevealLine at={15} fps={fps} mark="▸" color={THEME.amber}>hash fuerte → años</RevealLine>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 2: john + rockyou ───────────────────────────────────────
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
      <span style={{ color: THEME.green }}>JOHN THE RIPPER</span>: EL CLÁSICO
    </div>
    <TerminalWindow title="kali@attacker-01:~$ john hash.txt --wordlist=rockyou.txt" width={760} delay={Math.round(3 * fps)}>
      <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.7 }}>
        <span style={{ color: THEME.dim }}>Loaded 1 password hash (sha512crypt)</span>
        {'\n'}password123 <span style={{ color: THEME.green }}>  (admin)</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 16, marginTop: 28 }}>
      <KeyCapsule label="wordlist" value="rockyou" accent={THEME.amber} delay={Math.round(6 * fps)} size={24} />
      <KeyCapsule label="contraseñas reales" value="14M+" accent={THEME.green} delay={Math.round(8 * fps)} size={24} />
      <KeyCapsule label="leak 2009" value="filtradas" accent={THEME.cyan} delay={Math.round(10 * fps)} size={24} />
    </div>
    <div style={{ marginTop: 24, fontSize: 18, color: THEME.muted, fontFamily: MONO, width: 880 }}>
      si la contraseña está en la lista, <span style={{ color: THEME.green }}>cae siempre</span>
    </div>
  </AbsoluteFill>
);

// ── Escena 3: hashcat (GPU + reglas) + cierre ──────────────────────
const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(15 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
            CUANDO JOHN SE QUEDA CORTO: <span style={{ color: THEME.red }}>HASHCAT</span>
          </div>
          <TerminalWindow title="kali@attacker-01:~$ hashcat -m 1800 -a 0 hash.txt rockyou.txt" width={820} delay={Math.round(3 * fps)}>
            <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.7 }}>
              <span style={{ color: THEME.dim }}>Hash-mode 1800 (sha512crypt + salt)</span>
              {'\n'}Session..........: hashcat
              {'\n'}Speed.DEV.#1....: <span style={{ color: THEME.green }}>1234.5 kH/s</span> (GPU)
              {'\n'}password123:admin
            </div>
          </TerminalWindow>
          <div style={{ display: 'flex', gap: 20, width: 1040, marginTop: 26, justifyContent: 'center' }}>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.red}60`, borderRadius: 14, padding: '16px 20px', textAlign: 'left' }}>
              <RevealLine at={8} fps={fps} mark="▸" color={THEME.red}>corre en la GPU: miles de núcleos</RevealLine>
            </div>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.amber}60`, borderRadius: 14, padding: '16px 20px', textAlign: 'left' }}>
              <RevealLine at={10} fps={fps} mark="▸" color={THEME.amber}>reglas: password → Password1</RevealLine>
            </div>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.cyan}60`, borderRadius: 14, padding: '16px 20px', textAlign: 'left' }}>
              <RevealLine at={12} fps={fps} mark="▸" color={THEME.cyan}>métodos: fuerza bruta + diccionario</RevealLine>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>LA <span style={{ color: THEME.amber }}>WORDLIST</span> ES LA MITAD DEL JUEGO</>}
          subtitle="la GPU te da velocidad · la lista, el resultado"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Hk05OfflineCracking: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS['hk-05-offline-cracking'];
  const starts = sceneStartFrames('hk-05-offline-cracking', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const withAudio = hasAudio('hk-05-offline-cracking');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        {withAudio && <Audio src={staticFile('videos/audio/hk-05-offline-cracking/hk-05-scene1.wav')} />}
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        {withAudio && <Audio src={staticFile('videos/audio/hk-05-offline-cracking/hk-05-scene2.wav')} />}
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        {withAudio && <Audio src={staticFile('videos/audio/hk-05-offline-cracking/hk-05-scene3.wav')} />}
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};