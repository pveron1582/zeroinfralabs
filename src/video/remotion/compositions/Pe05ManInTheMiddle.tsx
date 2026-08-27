// ── video/remotion/compositions/Pe05ManInTheMiddle.tsx ─────────────
// Video: man-in-the-middle — ARP spoofing en la LAN.
// Clase 5 de Pentesting (lección network-05). Guiones: voicebox-scripts/pe-05-*.txt
// Audios reales en public/videos/audio/pe-05-man-in-the-middle/ (2026-08-25).

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

// ── Escena 1: qué es un MITM ───────────────────────────────────────
// Narración (29s): dos conversan, alguien se para en el medio (~0-8s) →
// el atacante puede leer/modificar/cortar (~19-24s) → metáfora del correo.
const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(6 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>EN EL MEDIO DE LA CONVERSACIÓN: <span style={{ color: THEME.red }}>MAN IN THE MIDDLE</span></>}
          subtitle="todo el tráfico pasa por el atacante… y nadie lo nota"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 24, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
            LA VÍCTIMA HABLA CON SU ROUTER… <span style={{ color: THEME.red }}>PERO TE ESCUCHA A VOS</span>
          </div>
          <div style={{ display: 'flex', gap: 20, width: 1060, justifyContent: 'center' }}>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.cyan}60`, borderRadius: 14, padding: '18px 22px' }}>
              <RevealLine at={19.5} fps={fps} mark="▸" color={THEME.cyan}>LEER el tráfico (sniffing)</RevealLine>
            </div>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.amber}60`, borderRadius: 14, padding: '18px 22px' }}>
              <RevealLine at={21.5} fps={fps} mark="▸" color={THEME.amber}>MODIFICARLO (inyección)</RevealLine>
            </div>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.red}60`, borderRadius: 14, padding: '18px 22px' }}>
              <RevealLine at={23} fps={fps} mark="▸" color={THEME.red}>DESCARTARLO (DoS)</RevealLine>
            </div>
          </div>
          <div style={{ marginTop: 26, fontSize: 18, color: THEME.muted, fontFamily: MONO }}>
            como interceptar el correo: <span style={{ color: THEME.text }}>fotocopiar cada carta</span> y entregarla igual
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 2: ARP spoofing ─────────────────────────────────────────
// Narración (34.3s): la jugada clásica (~0-7s) → qué es ARP (~7-9.5s) →
// respuestas falsas "el router soy yo" (~10-16s) → la víctima cree,
// ip_forward reenvía sin cortar (~17-30s) → arpspoof, un par de comandos.
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
      ARP SPOOFING: <span style={{ color: THEME.amber }}>LA JUGADA CLÁSICA</span>
    </div>
    <TerminalWindow title="kali@attacker-01:~$ sudo arpspoof -i eth0 -t 192.168.1.11 192.168.1.1" width={900} delay={Math.round(4 * fps)}>
      <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.8 }}>
        <span style={{ color: THEME.dim }}>0:c:29:aa:bb:cc 192.168.1.11  is-at 00:11:22:33:44:55</span>
        {'\n'}<span style={{ color: THEME.amber }}># la IP del router ahora apunta a MI MAC</span>
        {'\n'}<span style={{ color: THEME.text }}>kali@attacker-01:~$ echo 1 &gt; /proc/sys/net/ipv4/</span><span style={{ color: THEME.green }}>ip_forward</span>
        {'\n'}<span style={{ color: THEME.dim }}># reenvío al router real: la navegación no se corta</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 16, marginTop: 28 }}>
      <KeyCapsule label="ARP poisoning" value="tabla falsa" accent={THEME.amber} delay={Math.round(12 * fps)} size={24} />
      <KeyCapsule label="ip_forward = 1" value="puente invisible" accent={THEME.green} delay={Math.round(20 * fps)} size={24} />
      <KeyCapsule label="la víctima" value="no nota nada" accent={THEME.red} delay={Math.round(27 * fps)} size={24} />
    </div>
  </AbsoluteFill>
);

// ── Escena 3: detección + defensa + cierre ─────────────────────────
// Narración (29s): ¿cómo se detecta? (~0-9s) → prevención: estáticas,
// port security, TLS (~10-24s) → cosecha de credenciales (~24s+).
const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(25 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
            DETECTARLO Y <span style={{ color: THEME.green }}>FRENARLO</span>
          </div>
          <div style={{ display: 'flex', gap: 20, width: 1120, justifyContent: 'center' }}>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.red}60`, borderRadius: 14, padding: '20px 22px', textAlign: 'left' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: THEME.red, fontFamily: MONO, marginBottom: 10 }}>
                <RevealLine at={2.5} fps={fps} mark="" color={THEME.red}>DETECTAR</RevealLine>
              </div>
              <RevealLine at={4.5} fps={fps} mark="▸" color={THEME.red}>arp -a: dos IPs, misma MAC</RevealLine>
              <RevealLine at={7} fps={fps} mark="▸" color={THEME.red}>proceso arpspoof corriendo</RevealLine>
            </div>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.amber}60`, borderRadius: 14, padding: '20px 22px', textAlign: 'left' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: THEME.amber, fontFamily: MONO, marginBottom: 10 }}>
                <RevealLine at={9.8} fps={fps} mark="" color={THEME.amber}>PREVENIR</RevealLine>
              </div>
              <RevealLine at={11.5} fps={fps} mark="▸" color={THEME.amber}>entradas ARP estáticas</RevealLine>
              <RevealLine at={13} fps={fps} mark="▸" color={THEME.amber}>port security: 1 MAC por puerto</RevealLine>
            </div>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 14, padding: '20px 22px', textAlign: 'left' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 10 }}>
                <RevealLine at={16} fps={fps} mark="" color={THEME.green}>CIFRAR</RevealLine>
              </div>
              <RevealLine at={18} fps={fps} mark="▸" color={THEME.green}>TLS en todas partes</RevealLine>
              <RevealLine at={20} fps={fps} mark="▸" color={THEME.green}>sniffean, pero solo ven ruido</RevealLine>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>DE POSICIÓN SIMPLE A <span style={{ color: THEME.red }}>COSECHA DE CONTRASEÑAS</span></>}
          subtitle="MITM: cookies, sesiones y credenciales completas"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Pe05ManInTheMiddle: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS['pe-05-man-in-the-middle'];
  const starts = sceneStartFrames('pe-05-man-in-the-middle', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const withAudio = hasAudio('pe-05-man-in-the-middle');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        {withAudio && <Audio src={staticFile('videos/audio/pe-05-man-in-the-middle/pe-05-scene1.wav')} />}
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        {withAudio && <Audio src={staticFile('videos/audio/pe-05-man-in-the-middle/pe-05-scene2.wav')} />}
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        {withAudio && <Audio src={staticFile('videos/audio/pe-05-man-in-the-middle/pe-05-scene3.wav')} />}
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
