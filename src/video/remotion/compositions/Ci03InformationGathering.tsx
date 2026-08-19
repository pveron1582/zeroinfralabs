// ── video/remotion/compositions/Ci03InformationGathering.tsx ───────
// Video: Information Gathering — la fase 1 del pentesting.
// Lección ciber-03 del Academy (Fundamentos de Ciberseguridad).
// Guiones: voicebox-scripts/ci-03-*.txt
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

const CENTERED: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  textAlign: 'center',
};

// ── Escena 1: qué es + pasivo vs activo ────────────────────────────
const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(7 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>SABER ANTES DE <span style={{ color: THEME.cyan }}>TOCAR</span></>}
          subtitle="Information gathering — la fase 1 del pentesting"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 24, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
            DOS MODOS: <span style={{ color: THEME.green }}>PASIVO</span> Y <span style={{ color: THEME.amber }}>ACTIVO</span>
          </div>
          <div style={{ display: 'flex', gap: 20, width: 1040, justifyContent: 'center' }}>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 16, padding: '20px 22px', textAlign: 'left' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 12 }}>
                <RevealLine at={9} fps={fps} mark="" color={THEME.green}>PASIVO · OSINT</RevealLine>
              </div>
              <RevealLine at={11} fps={fps} mark="◻" color={THEME.green}>solo observás: Google, redes, WHOIS</RevealLine>
              <RevealLine at={14} fps={fps} mark="◻" color={THEME.green}>no tocás el objetivo</RevealLine>
              <RevealLine at={17} fps={fps} mark="▸" color={THEME.green}>no deja rastro</RevealLine>
            </div>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.amber}60`, borderRadius: 16, padding: '20px 22px', textAlign: 'left' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: THEME.amber, fontFamily: MONO, marginBottom: 12 }}>
                <RevealLine at={10} fps={fps} mark="" color={THEME.amber}>ACTIVO</RevealLine>
              </div>
              <RevealLine at={12} fps={fps} mark="◻" color={THEME.amber}>le hablás a la máquina: DNS, puertos, banners</RevealLine>
              <RevealLine at={15} fps={fps} mark="◻" color={THEME.amber}>escaneos, fingerprints</RevealLine>
              <RevealLine at={18} fps={fps} mark="⚠" color={THEME.amber}>sí deja logs</RevealLine>
            </div>
          </div>
          <div style={{ width: 900, textAlign: 'left', marginTop: 20 }}>
            <RevealLine at={20} fps={fps} mark="▸" color={THEME.cyan}>cuanto más sabés, menos fuerza bruta necesitás</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 2: legalidad ────────────────────────────────────────────
const Scene2: React.FC<{ fps: number }> = ({ fps }) => {
  const flowAt = Math.round(12 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={flowAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
            ¿ES <span style={{ color: THEME.green }}>LEGAL</span>?
          </div>
          <div style={{ display: 'flex', gap: 20, width: 1040, justifyContent: 'center' }}>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 16, padding: '20px 22px', textAlign: 'left' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: THEME.green, fontFamily: MONO }}>
                <RevealLine at={3} fps={fps} mark="✓" color={THEME.green}>OSINT pasivo sobre datos públicos</RevealLine>
              </div>
              <RevealLine at={5} fps={fps} mark="▸" color={THEME.green}>cualquiera puede leer un sitio o un WHOIS</RevealLine>
              <RevealLine at={8} fps={fps} mark="▸" color={THEME.green}>en general, legal</RevealLine>
            </div>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.red}60`, borderRadius: 16, padding: '20px 22px', textAlign: 'left' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: THEME.red, fontFamily: MONO }}>
                <RevealLine at={4} fps={fps} mark="✗" color={THEME.red}>activo SIN autorización</RevealLine>
              </div>
              <RevealLine at={6} fps={fps} mark="▸" color={THEME.red}>escaneos, exploits: NO</RevealLine>
              <RevealLine at={9} fps={fps} mark="▸" color={THEME.red}>requiere permiso escrito (rules of engagement)</RevealLine>
              <RevealLine at={11} fps={fps} mark="⚠" color={THEME.red}>usar datos contra un sistema ajeno = delito</RevealLine>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={flowAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
            LA METODOLOGÍA: UN <span style={{ color: THEME.cyan }}>EMBUDO</span>
          </div>
          <div style={{ display: 'flex', gap: 16, width: 1040 }}>
            {[
              { n: '1', name: 'FOOTPRINTING', desc: 'mapa: dominios, IPs, emails, tecnología', color: THEME.green },
              { n: '2', name: 'ENUMERACIÓN', desc: 'DNS, subdominios, puertos, servicios', color: THEME.cyan },
              { n: '3', name: 'FINGERPRINTING', desc: 'Apache 2.4.41, WP 6.2 → exploit', color: THEME.amber },
            ].map((s, i) => (
              <div key={s.n} style={{
                flex: 1, background: THEME.panel, border: `1px solid ${s.color}60`, borderRadius: 16,
                padding: '18px 16px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 34, fontWeight: 800, color: s.color, fontFamily: MONO, marginBottom: 4 }}>
                  <RevealLine at={2 + i * 2.5} fps={fps} mark="" color={s.color}>{s.n}</RevealLine>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: THEME.text, fontFamily: MONO }}>{s.name}</div>
                <div style={{ fontSize: 13, color: THEME.muted, fontFamily: MONO, marginTop: 8, lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 22, fontSize: 17, color: THEME.muted, fontFamily: MONO }}>
            de "toda la internet" a <span style={{ color: THEME.red }}>un solo servicio vulnerable</span>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 3: herramientas + cierre ────────────────────────────────
const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(14 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 18 }}>
            EL SET DE <span style={{ color: THEME.cyan }}>HERRAMIENTAS</span>
          </div>
          <TerminalWindow title="kali@attacker-01:~$" width={820} delay={Math.round(2 * fps)}>
            <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.8 }}>
              <span style={{ color: THEME.green }}>whois</span> example.com         <span style={{ color: THEME.dim }}># dueño del dominio</span>
              {'\n'}<span style={{ color: THEME.green }}>dig</span> example.com ANY   <span style={{ color: THEME.dim }}># IP y registros DNS</span>
              {'\n'}<span style={{ color: THEME.green }}>nmap</span> -sV 192.168.1.11 <span style={{ color: THEME.dim }}># fingerprinting</span>
              {'\n'}<span style={{ color: THEME.green }}>gobuster</span> dir -u http://... <span style={{ color: THEME.dim }}># directorios</span>
              {'\n'}<span style={{ color: THEME.green }}>curl</span> -I http://...    <span style={{ color: THEME.dim }}># banners</span>
            </div>
          </TerminalWindow>
          <div style={{ width: 900, textAlign: 'left', marginTop: 18 }}>
            <RevealLine at={9} fps={fps} mark="◻" color={THEME.purple}>pasivas: whois, dig, Google dorking, Shodan, theHarvester</RevealLine>
            <RevealLine at={12} fps={fps} mark="◻" color={THEME.cyan}>activas: nmap, masscan, gobuster, ffuf, curl</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>INFORMACIÓN = <span style={{ color: THEME.cyan }}>SUPERPODER</span></>}
          subtitle="la mejor herramienta es la que te da la versión"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Ci03InformationGathering: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS['ci-03-information-gathering'];
  const starts = sceneStartFrames('ci-03-information-gathering', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const withAudio = hasAudio('ci-03-information-gathering');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        {withAudio && <Audio src={staticFile('videos/audio/ci-03-information-gathering/ci-03-scene1.wav')} />}
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        {withAudio && <Audio src={staticFile('videos/audio/ci-03-information-gathering/ci-03-scene2.wav')} />}
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        {withAudio && <Audio src={staticFile('videos/audio/ci-03-information-gathering/ci-03-scene3.wav')} />}
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};