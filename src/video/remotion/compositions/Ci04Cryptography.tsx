// ── video/remotion/compositions/Ci04Cryptography.tsx ───────────────
// Video: Bases de criptografía — cifrado vs hash, simétrica vs asimétrica
// y dónde se ve todos los días.
// Versión unificada ES/EN con `lang` prop.
// Timings por silencedetect.

import React from 'react';
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { sceneStartFrames, audioTimings, audioBase, hasAudio } from '../audioTimings';
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

// ── COPY ────────────────────────────────────────────────────────────
const COPY = {
  es: {
    s1: {
      title: <>PRIMAS, <span style={{ color: THEME.cyan }}>NO GEMELAS</span></>,
      subtitle: 'cifrado y hash: la base de la criptografía',
      heading: 'EL ALGORITMO ES PÚBLICO · <span style={{ color: THEME.amber }}>LA CLAVE ES EL SECRETO</span>',
      encLabel: 'CIFRADO 🔄',
      encLines: ['reversible: con la clave recuperás el dato', '"si se puede descifrar, es cifrado"'],
      hashLabel: 'HASH 🧬',
      hashLines: ['de un solo sentido: no hay vuelta atrás', '"si no hay vuelta atrás, es hash"'],
      footer: 'sin la clave, el cifrado es solo ruido',
    },
    s2: {
      heading: 'DOS <span style={{ color: THEME.green }}>FAMILIAS</span>',
      symLabel: 'SIMÉTRICA',
      symCapsules: [{ label: 'clave compartida', value: '🔑' }, { label: 'cifrar y descifrar', value: '🔓🔒' }],
      symLines: ['rápida, como AES', 'acordar la clave sin que se filtre'],
      asymLabel: 'ASIMÉTRICA',
      asymCapsules: [{ label: 'pública · cualquiera', value: '🔓' }, { label: 'privada · solo el dueño', value: '🔒' }],
      asymLines: ['lo que cifra una, solo lo descifra la otra', 'más lenta, sin secreto compartido'],
      httpsHeading: 'HTTPS USA <span style={{ color: THEME.amber }}>LAS DOS</span>',
      httpsTerminal: ['ASIMÉTRICA → intercambia la clave al inicio', 'SIMÉTRICA   → lleva todo el tráfico después', 'TLS 1.3 · AES + RSA/ECDHE'],
    },
    s3: {
      heading: 'DÓNDE LA VES <span style={{ color: THEME.green }}>TODOS LOS DÍAS</span>',
      items: [
        { mark: '🔒', text: 'HTTPS: el candado del navegador (AES + RSA)' },
        { mark: '🗝️', text: 'SSH: tu par de claves autentica' },
        { mark: '🧅', text: 'VPN: cifra el túnel completo' },
        { mark: '🧬', text: 'contraseñas: hashes, no cifrado' },
        { mark: '✍️', text: 'firmas: la privada firma, la pública prueba que es genuino' },
      ],
      closeTitle: <>CIFRADO = <span style={{ color: THEME.cyan }}>LEER</span> · HASH = <span style={{ color: THEME.purple }}>VERIFICAR</span></>,
      closeSubtitle: 'primas, no gemelas',
    },
  },
  en: {
    s1: {
      title: <>COUSINS, <span style={{ color: THEME.cyan }}>NOT TWINS</span></>,
      subtitle: 'encryption and hashes: the base of cryptography',
      heading: 'THE ALGORITHM IS PUBLIC · <span style={{ color: THEME.amber }}>THE KEY IS THE SECRET</span>',
      encLabel: 'ENCRYPTION 🔄',
      encLines: ['reversible: with the key you recover the data', '"if it can be decrypted, it\'s encryption"'],
      hashLabel: 'HASH 🧬',
      hashLines: ['one way: there\'s no way back', '"if there\'s no way back, it\'s a hash"'],
      footer: 'can be decrypted = encryption · no way back = hash',
    },
    s2: {
      heading: 'TWO <span style={{ color: THEME.green }}>FAMILIES</span>',
      symLabel: 'SYMMETRIC',
      symCapsules: [{ label: 'shared key', value: '🔑' }, { label: 'encrypt and decrypt', value: '🔓🔒' }],
      symLines: ['fast, like AES', 'both sides must agree on the key without it leaking'],
      asymLabel: 'ASYMMETRIC',
      asymCapsules: [{ label: 'public · anyone', value: '🔓' }, { label: 'private · owner only', value: '🔒' }],
      asymLines: ['what one encrypts, only the other decrypts', 'slower, but no shared secret'],
      httpsHeading: 'HTTPS USES <span style={{ color: THEME.amber }}>BOTH</span>',
      httpsTerminal: ['ASYMMETRIC → exchanges the key at the start', 'SYMMETRIC   → carries all the traffic afterward', 'TLS 1.3 · AES + RSA/ECDHE'],
    },
    s3: {
      heading: 'WHERE YOU SEE IT <span style={{ color: THEME.green }}>EVERY DAY</span>',
      items: [
        { mark: '🔒', text: 'HTTPS: every padlock in the browser (AES + RSA)' },
        { mark: '🗝️', text: 'SSH: your key pair authenticates' },
        { mark: '🧅', text: 'VPN: encrypts the whole tunnel' },
        { mark: '🧬', text: 'passwords: hashes, not encryption' },
        { mark: '✍️', text: 'signatures: the private key signs, the public one proves it' },
      ],
      closeTitle: <>ENCRYPTION = <span style={{ color: THEME.cyan }}>READ LATER</span> · HASH = <span style={{ color: THEME.purple }}>VERIFY</span></>,
      closeSubtitle: 'cousins, not twins',
    },
  },
};

// ── BEATS (seconds, multiplied by fps at use site) ──────────────────
const BEATS = {
  es: {
    s1: { panelAt: 5.0, encLabel: 1.1, encLines: [15.6, 22.1], hashLabel: 18.6, hashLines: [18.6, 24.2], footer: 10.1 },
    s2: { symLabel: 1.1, symCapsules: [2.4, 3.6], symLines: [0.8, 3.6], asymLabel: 9.6, asymCapsules: [6.6, 9.0], asymLines: [11.2, 13.9], comboAt: 21.4, httpsDelay: 2.2 },
    s3: { items: [2.1, 7.4, 10.8, 13.4, 19.5], closeAt: 25.6 },
  },
  en: {
    s1: { panelAt: 5.4, encLabel: 1.4, encLines: [16.9, 23.0], hashLabel: 2.5, hashLines: [20.4, 25.3], footer: 28.4 },
    s2: { symLabel: 1.7, symCapsules: [2.9, 4.2], symLines: [5.7, 7.7], asymLabel: 11.0, asymCapsules: [12.9, 15.1], asymLines: [17.5, 20.6], comboAt: 23.6, httpsDelay: 2.0 },
    s3: { items: [2.2, 8.1, 11.4, 13.9, 19.3], closeAt: 25.8 },
  },
};

const VID = 'ci-04-cryptography';

// ── Scene 1: qué es + cifrado vs hash ───────────────────────────────
const Scene1: React.FC<{ fps: number; c: typeof COPY.es.s1; b: typeof BEATS.es.s1 }> = ({ fps, c, b }) => {
  const panelAt = Math.round(b.panelAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene title={c.title} subtitle={c.subtitle} />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 22, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }} dangerouslySetInnerHTML={{ __html: c.heading }} />
          <div style={{ display: 'flex', gap: 20, width: 1060, justifyContent: 'center' }}>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.cyan}60`, borderRadius: 16, padding: '20px 22px', textAlign: 'left' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: THEME.cyan, fontFamily: MONO, marginBottom: 12 }}>
                <RevealLine at={b.encLabel} fps={fps} mark="" color={THEME.cyan}>{c.encLabel}</RevealLine>
              </div>
              {c.encLines.map((line, i) => (
                <RevealLine key={i} at={b.encLines[i]} fps={fps} mark="▸" color={THEME.cyan}>{line}</RevealLine>
              ))}
            </div>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.purple}60`, borderRadius: 16, padding: '20px 22px', textAlign: 'left' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: THEME.purple, fontFamily: MONO, marginBottom: 12 }}>
                <RevealLine at={b.hashLabel} fps={fps} mark="" color={THEME.purple}>{c.hashLabel}</RevealLine>
              </div>
              {c.hashLines.map((line, i) => (
                <RevealLine key={i} at={b.hashLines[i]} fps={fps} mark="▸" color={THEME.purple}>{line}</RevealLine>
              ))}
            </div>
          </div>
          <div style={{ width: 900, textAlign: 'left', marginTop: 18 }}>
            <RevealLine at={b.footer} fps={fps} mark="▸" color={THEME.amber}>{c.footer}</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: simétrica vs asimétrica ────────────────────────────────
const Scene2: React.FC<{ fps: number; c: typeof COPY.es.s2; b: typeof BEATS.es.s2 }> = ({ fps, c, b }) => {
  const comboAt = Math.round(b.comboAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={comboAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 30 }} dangerouslySetInnerHTML={{ __html: c.heading }} />
          <div style={{ display: 'flex', gap: 60, width: 1060, justifyContent: 'center' }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 14 }}>
                <RevealLine at={b.symLabel} fps={fps} mark="" color={THEME.green}>{c.symLabel}</RevealLine>
              </div>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginBottom: 12 }}>
                {c.symCapsules.map((cap, i) => (
                  <KeyCapsule key={i} label={cap.label} value={cap.value} accent={THEME.green} delay={Math.round(b.symCapsules[i] * fps)} size={30} />
                ))}
              </div>
              {c.symLines.map((line, i) => (
                <RevealLine key={i} at={b.symLines[i]} fps={fps} mark={i === 0 ? '▸' : '⚠'} color={i === 0 ? THEME.green : THEME.amber}>{line}</RevealLine>
              ))}
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: THEME.cyan, fontFamily: MONO, marginBottom: 14 }}>
                <RevealLine at={b.asymLabel} fps={fps} mark="" color={THEME.cyan}>{c.asymLabel}</RevealLine>
              </div>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginBottom: 12 }}>
                {c.asymCapsules.map((cap, i) => (
                  <KeyCapsule key={i} label={cap.label} value={cap.value} accent={THEME.cyan} delay={Math.round(b.asymCapsules[i] * fps)} size={30} />
                ))}
              </div>
              {c.asymLines.map((line, i) => (
                <RevealLine key={i} at={b.asymLines[i]} fps={fps} mark="▸" color={THEME.cyan}>{line}</RevealLine>
              ))}
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={comboAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }} dangerouslySetInnerHTML={{ __html: c.httpsHeading }} />
          <TerminalWindow title="🔒 https://example.com" width={780} delay={Math.round(b.httpsDelay * fps)}>
            <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.8 }}>
              {c.httpsTerminal.map((line, i) => (
                <React.Fragment key={i}>
                  {i > 0 && '\n'}
                  <span style={{ color: i === 0 ? THEME.cyan : i === 1 ? THEME.green : THEME.text }}>{line}</span>
                </React.Fragment>
              ))}
            </div>
          </TerminalWindow>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 3: dónde la ves + cierre ──────────────────────────────────
const Scene3: React.FC<{ fps: number; c: typeof COPY.es.s3; b: typeof BEATS.es.s3 }> = ({ fps, c, b }) => {
  const closeAt = Math.round(b.closeAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }} dangerouslySetInnerHTML={{ __html: c.heading }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, width: 900 }}>
            {c.items.map((item, i) => (
              <RevealLine key={i} at={b.items[i]} fps={fps} mark={item.mark} color={THEME.cyan}>{item.text}</RevealLine>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene title={c.closeTitle} subtitle={c.closeSubtitle} />
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Componente principal ────────────────────────────────────────────
export const Ci04Cryptography: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
  const { fps } = useVideoConfig();
  const c = COPY[lang];
  const b = BEATS[lang];

  const [s1, s2, s3] = audioTimings(VID, lang);
  const starts = sceneStartFrames(VID, fps, lang);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase(lang);
  const withAudio = hasAudio(VID);

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        {withAudio && <Audio src={staticFile(`${base}/${VID}/ci-04-scene1.wav`)} />}
        <Scene1 fps={fps} c={c.s1} b={b.s1} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        {withAudio && <Audio src={staticFile(`${base}/${VID}/ci-04-scene2.wav`)} />}
        <Scene2 fps={fps} c={c.s2} b={b.s2} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        {withAudio && <Audio src={staticFile(`${base}/${VID}/ci-04-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3} b={b.s3} />
      </Sequence>
    </AbsoluteFill>
  );
};
