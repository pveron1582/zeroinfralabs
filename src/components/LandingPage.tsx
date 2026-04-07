import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { Scenario } from '../types';
import { useLanguage, useSetLanguage, useT } from '../i18n/translations';
import { SCENARIOS_META } from '../laboratorios/laboratorios';
import { FeedbackModal } from './FeedbackModal';
import { DonationModal } from './DonationModal';

// Dynamic metadata from lab files with SVG illustrations
interface ScenarioMeta { 
  tagline?: string; 
  taglineEs?: string;
  tools?: string[]; 
  accentColor?: string; 
  illustration?: React.ReactNode; 
}

// SVG Illustrations for each scenario
const ILLUSTRATIONS: Record<string, React.ReactNode> = {
  'scenario-01': (
    <svg viewBox="0 0 280 170" fill="none" className="w-full h-full">
      <rect x="30" y="18" width="160" height="105" rx="5" stroke="#22d3ee" strokeWidth="1.2" strokeOpacity="0.45"/>
      <rect x="30" y="18" width="160" height="20" rx="5" fill="#22d3ee" fillOpacity="0.07"/>
      <circle cx="45" cy="28" r="3.5" fill="#22d3ee" fillOpacity="0.3"/><circle cx="57" cy="28" r="3.5" fill="#22d3ee" fillOpacity="0.18"/><circle cx="69" cy="28" r="3.5" fill="#22d3ee" fillOpacity="0.1"/>
      <rect x="82" y="23" width="90" height="10" rx="3" fill="#22d3ee" fillOpacity="0.1"/>
      <circle cx="110" cy="85" r="30" stroke="#22d3ee" strokeWidth="0.8" strokeOpacity="0.2" strokeDasharray="3 3"/>
      <text x="110" y="81" textAnchor="middle" fill="#22d3ee" fillOpacity="0.65" fontSize="20" fontFamily="monospace" fontWeight="bold">W</text>
      <text x="110" y="95" textAnchor="middle" fill="#22d3ee" fillOpacity="0.35" fontSize="8" fontFamily="monospace">WordPress</text>
      <text x="202" y="44" fill="#22d3ee" fillOpacity="0.7" fontSize="8" fontFamily="monospace">/wp-admin</text>
      <text x="202" y="58" fill="#22d3ee" fillOpacity="0.4" fontSize="8" fontFamily="monospace">/uploads</text>
      <text x="202" y="72" fill="#22d3ee" fillOpacity="0.2" fontSize="8" fontFamily="monospace">/backup</text>
      <text x="32" y="158" fill="#22d3ee" fillOpacity="0.45" fontSize="7.5" fontFamily="monospace">gobuster dir -u http://192.168.1.11 -w rockyou.txt</text>
      <line x1="30" y1="148" x2="248" y2="148" stroke="#22d3ee" strokeWidth="0.4" strokeOpacity="0.12"/>
    </svg>
  ),
  'scenario-02': (
    <svg viewBox="0 0 280 170" fill="none" className="w-full h-full">
      <rect x="16" y="48" width="72" height="48" rx="4" stroke="#fbbf24" strokeWidth="1.2" strokeOpacity="0.45"/>
      <rect x="16" y="48" width="72" height="13" rx="4" fill="#fbbf24" fillOpacity="0.07"/>
      <text x="52" y="57" textAnchor="middle" fill="#fbbf24" fillOpacity="0.45" fontSize="7" fontFamily="monospace">KALI</text>
      <text x="22" y="76" fill="#fbbf24" fillOpacity="0.65" fontSize="7" fontFamily="monospace">$ hydra</text>
      <text x="22" y="87" fill="#fbbf24" fillOpacity="0.35" fontSize="6.5" fontFamily="monospace">-l root -P...</text>
      <rect x="192" y="48" width="72" height="48" rx="4" stroke="#fbbf24" strokeWidth="1.2" strokeOpacity="0.45"/>
      <rect x="192" y="48" width="72" height="13" rx="4" fill="#fbbf24" fillOpacity="0.07"/>
      <text x="228" y="57" textAnchor="middle" fill="#fbbf24" fillOpacity="0.45" fontSize="7" fontFamily="monospace">SSH :22</text>
      <circle cx="228" cy="80" r="13" stroke="#fbbf24" strokeWidth="0.8" strokeOpacity="0.3"/>
      {['admin','root','toor','pass','1234'].map((p, i) => (
        <text key={p} x={95 + (i % 2)} y={56 + i * 14} fill="#fbbf24" fillOpacity={i === 2 ? 0.85 : 0.2} fontSize="7.5" fontFamily="monospace">{p}{i === 2 ? ' ✓' : ' ✗'}</text>
      ))}
      <line x1="88" y1="72" x2="192" y2="72" stroke="#fbbf24" strokeWidth="1" strokeOpacity="0.25" strokeDasharray="4 3"/>
      <polygon points="190,69 196,72 190,75" fill="#fbbf24" fillOpacity="0.4"/>
      <text x="30" y="148" fill="#fbbf24" fillOpacity="0.5" fontSize="7.5" fontFamily="monospace">[22][ssh] login: root  password: toor</text>
      <line x1="16" y1="153" x2="264" y2="153" stroke="#fbbf24" strokeWidth="0.4" strokeOpacity="0.12"/>
    </svg>
  ),
  'scenario-03': (
    <svg viewBox="0 0 280 170" fill="none" className="w-full h-full">
      <rect x="10" y="16" width="132" height="98" rx="4" stroke="#f87171" strokeWidth="1" strokeOpacity="0.35"/>
      <rect x="10" y="16" width="132" height="14" rx="4" fill="#f87171" fillOpacity="0.06"/>
      <text x="76" y="26" textAnchor="middle" fill="#f87171" fillOpacity="0.35" fontSize="6.5" fontFamily="monospace">msfconsole</text>
      <text x="16" y="42" fill="#f87171" fillOpacity="0.5" fontSize="7" fontFamily="monospace">{'msf6 > use exploit/windows/'}</text>
      <text x="16" y="53" fill="#f87171" fillOpacity="0.5" fontSize="7" fontFamily="monospace">{'       smb/ms17_010_eternalblue'}</text>
      <text x="16" y="67" fill="#f87171" fillOpacity="0.4" fontSize="7" fontFamily="monospace">{'msf6 exploit(...) >'}</text>
      <text x="16" y="78" fill="#f87171" fillOpacity="0.4" fontSize="7" fontFamily="monospace">set RHOSTS 10.0.0.11</text>
      <text x="16" y="89" fill="#f87171" fillOpacity="0.4" fontSize="7" fontFamily="monospace">set LHOST 10.0.0.10</text>
      <text x="16" y="103" fill="#f87171" fillOpacity="0.8" fontSize="8" fontFamily="monospace" fontWeight="bold">run</text>
      <rect x="175" y="28" width="92" height="68" rx="4" stroke="#f87171" strokeWidth="1.2" strokeOpacity="0.4"/>
      <rect x="183" y="40" width="17" height="15" rx="1.5" fill="#f87171" fillOpacity="0.28"/>
      <rect x="204" y="40" width="17" height="15" rx="1.5" fill="#f87171" fillOpacity="0.18"/>
      <rect x="183" y="58" width="17" height="15" rx="1.5" fill="#f87171" fillOpacity="0.18"/>
      <rect x="204" y="58" width="17" height="15" rx="1.5" fill="#f87171" fillOpacity="0.28"/>
      <text x="233" y="52" fill="#f87171" fillOpacity="0.4" fontSize="6.5" fontFamily="monospace">Win 7</text>
      <text x="233" y="63" fill="#f87171" fillOpacity="0.3" fontSize="6" fontFamily="monospace">SP1 x64</text>
      <text x="233" y="78" fill="#f87171" fillOpacity="0.3" fontSize="6" fontFamily="monospace">SMB :445</text>
      <path d="M142 72 C158 72 162 62 175 62" stroke="#f87171" strokeWidth="1.2" strokeOpacity="0.45" strokeDasharray="3 2"/>
      <polygon points="173,59 179,62 173,65" fill="#f87171" fillOpacity="0.55"/>
      <rect x="10" y="124" width="262" height="34" rx="3" fill="#f87171" fillOpacity="0.04" stroke="#f87171" strokeWidth="0.4" strokeOpacity="0.18"/>
      <text x="16" y="137" fill="#f87171" fillOpacity="0.55" fontSize="6.8" fontFamily="monospace">[+] ETERNALBLUE overwrite completed! (0xC000000D)</text>
      <text x="16" y="150" fill="#f87171" fillOpacity="0.8" fontSize="6.8" fontFamily="monospace">{'meterpreter > getuid  →  NT AUTHORITY\\SYSTEM'}</text>
    </svg>
  ),
  'scenario-04': (
    <svg viewBox="0 0 280 170" fill="none" className="w-full h-full">
      <rect x="20" y="20" width="100" height="130" rx="4" stroke="#a78bfa" strokeWidth="1.2" strokeOpacity="0.45"/>
      <rect x="20" y="20" width="100" height="14" rx="4" fill="#a78bfa" fillOpacity="0.07"/>
      <text x="70" y="30" textAnchor="middle" fill="#a78bfa" fillOpacity="0.45" fontSize="7" fontFamily="monospace">LFI Lab</text>
      <text x="28" y="50" fill="#a78bfa" fillOpacity="0.65" fontSize="7" fontFamily="monospace">?page=...</text>
      <text x="28" y="65" fill="#a78bfa" fillOpacity="0.4" fontSize="6.5" fontFamily="monospace">../../../../etc/</text>
      <text x="28" y="78" fill="#a78bfa" fillOpacity="0.4" fontSize="6.5" fontFamily="monospace">passwd</text>
      <rect x="160" y="35" width="100" height="100" rx="4" stroke="#a78bfa" strokeWidth="1.2" strokeOpacity="0.4"/>
      <rect x="160" y="35" width="100" height="14" rx="4" fill="#a78bfa" fillOpacity="0.07"/>
      <text x="210" y="45" textAnchor="middle" fill="#a78bfa" fillOpacity="0.45" fontSize="7" fontFamily="monospace">upload.php</text>
      <circle cx="210" cy="90" r="20" stroke="#a78bfa" strokeWidth="0.8" strokeOpacity="0.3" strokeDasharray="3 2"/>
      <text x="210" y="94" textAnchor="middle" fill="#a78bfa" fillOpacity="0.5" fontSize="14" fontFamily="monospace">{'<?php'}</text>
      <path d="M120 80 C140 80 145 70 160 70" stroke="#a78bfa" strokeWidth="1" strokeOpacity="0.35" strokeDasharray="4 3"/>
      <polygon points="158,67 164,70 158,73" fill="#a78bfa" fillOpacity="0.5"/>
      <text x="140" y="145" fill="#a78bfa" fillOpacity="0.5" fontSize="7.5" fontFamily="monospace">RCE via file inclusion</text>
    </svg>
  ),
  'scenario-05': (
    <svg viewBox="0 0 280 170" fill="none" className="w-full h-full">
      <rect x="12" y="18" width="120" height="80" rx="4" stroke="#34d399" strokeWidth="1.2" strokeOpacity="0.45"/>
      <rect x="12" y="18" width="120" height="14" rx="4" fill="#34d399" fillOpacity="0.07"/>
      <text x="72" y="28" textAnchor="middle" fill="#34d399" fillOpacity="0.45" fontSize="7" fontFamily="monospace">developer@privesc</text>
      <text x="18" y="46" fill="#34d399" fillOpacity="0.65" fontSize="7" fontFamily="monospace">$ sudo -l</text>
      <text x="18" y="60" fill="#34d399" fillOpacity="0.35" fontSize="6.5" fontFamily="monospace">User developer</text>
      <text x="18" y="72" fill="#34d399" fillOpacity="0.35" fontSize="6.5" fontFamily="monospace">may run:</text>
      <text x="18" y="84" fill="#34d399" fillOpacity="0.7" fontSize="6.5" fontFamily="monospace">(ALL) NOPASSWD: vim</text>
      <rect x="60" y="108" width="60" height="44" rx="3" stroke="#34d399" strokeWidth="1" strokeOpacity="0.35"/>
      <rect x="60" y="108" width="60" height="12" rx="3" fill="#34d399" fillOpacity="0.08"/>
      <text x="90" y="117" textAnchor="middle" fill="#34d399" fillOpacity="0.5" fontSize="6" fontFamily="monospace">vim</text>
      <text x="66" y="132" fill="#34d399" fillOpacity="0.6" fontSize="7" fontFamily="monospace">:!bash</text>
      <text x="66" y="144" fill="#34d399" fillOpacity="0.3" fontSize="6" fontFamily="monospace">→ shell root</text>
      <path d="M132 68 C150 68 155 120 160 120" stroke="#34d399" strokeWidth="1.2" strokeOpacity="0.45" strokeDasharray="3 2"/>
      <polygon points="158,117 164,120 158,123" fill="#34d399" fillOpacity="0.55"/>
      <rect x="155" y="98" width="115" height="60" rx="4" stroke="#34d399" strokeWidth="1.2" strokeOpacity="0.5"/>
      <rect x="155" y="98" width="115" height="14" rx="4" fill="#34d399" fillOpacity="0.1"/>
      <text x="212" y="108" textAnchor="middle" fill="#34d399" fillOpacity="0.6" fontSize="7" fontFamily="monospace" fontWeight="bold">root@privesc</text>
      <text x="161" y="126" fill="#34d399" fillOpacity="0.8" fontSize="7" fontFamily="monospace"># id</text>
      <text x="161" y="138" fill="#34d399" fillOpacity="0.5" fontSize="6.5" fontFamily="monospace">uid=0(root)</text>
      <text x="161" y="150" fill="#34d399" fillOpacity="0.8" fontSize="7" fontFamily="monospace"># cat /root/root.txt</text>
      <rect x="155" y="18" width="115" height="72" rx="4" stroke="#34d399" strokeWidth="0.8" strokeOpacity="0.2" strokeDasharray="3 3"/>
      <text x="212" y="36" textAnchor="middle" fill="#34d399" fillOpacity="0.4" fontSize="7" fontFamily="monospace">sudo vim</text>
      <text x="212" y="50" textAnchor="middle" fill="#34d399" fillOpacity="0.3" fontSize="6" fontFamily="monospace">NOPASSWD</text>
      <circle cx="212" cy="70" r="12" stroke="#34d399" strokeWidth="0.8" strokeOpacity="0.3"/>
      <text x="212" y="74" textAnchor="middle" fill="#34d399" fillOpacity="0.6" fontSize="10" fontFamily="monospace" fontWeight="bold">↑</text>
      <text x="16" y="165" fill="#34d399" fillOpacity="0.45" fontSize="7.5" fontFamily="monospace">sudo vim -c '!bash' → root shell</text>
      <line x1="12" y1="158" x2="268" y2="158" stroke="#34d399" strokeWidth="0.4" strokeOpacity="0.12"/>
    </svg>
  ),
};

function useTypewriter(text: string, active: boolean, speed = 18) {
  const [shown, setShown] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!active) { setShown(''); return; }
    setShown(''); let i = 0;
    const tick = () => { i++; setShown(text.slice(0, i)); if (i < text.length) timer.current = setTimeout(tick, speed); };
    timer.current = setTimeout(tick, speed);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [active, text, speed]);
  return shown;
}

function ScenarioCard({ scenario, index, onSelect }: { scenario: Scenario; index: number; onSelect: (id: string) => void; }) {
  const [hovered, setHovered] = useState(false);
  const language = useLanguage();
  const meta = SCENARIOS_META[index];
  const t = useT();
  const taglineText = language === 'es' ? (meta?.taglineEs || meta?.tagline) : meta?.tagline;
  const descriptionText = language === 'es' ? (meta?.descriptionEs || meta?.description) : meta?.description;
  const tagline = useTypewriter(taglineText ?? '', hovered);
  const accent = meta?.accentColor ?? '#10b981';
  const tools = meta?.tools || [];
  const diffLabel = scenario.difficulty === 'Easy' ? t('easy') : scenario.difficulty === 'Medium' ? t('medium') : t('hard');
  const diffColor = scenario.difficulty === 'Easy' ? '#10b981' : scenario.difficulty === 'Medium' ? '#f59e0b' : '#f87171';

  return (
    <article onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      className="flex flex-col overflow-hidden select-none"
      style={{ background: '#0d1117', border: `1px solid ${hovered ? accent + '70' : '#1e2d2d'}`, borderRadius: '10px',
        boxShadow: hovered ? `0 0 0 1px ${accent}20, 0 16px 48px ${accent}12, inset 0 1px 0 ${accent}15` : '0 2px 10px #00000060',
        transform: hovered ? 'translateY(-4px)' : 'none', transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        animationDelay: `${index * 90}ms`, animation: 'cardIn 0.4s ease-out both' }}
      role="button" tabIndex={0}>
      <div className="relative overflow-hidden" style={{ height: '170px', background: '#090d12' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 3px)', zIndex: 2 }}/>
        <div className="absolute inset-2 transition-opacity duration-300" style={{ opacity: hovered ? 0.18 : 1, zIndex: 1 }}>{ILLUSTRATIONS[scenario.id]}</div>
        <div className="absolute inset-0 flex items-center justify-center px-5 transition-all duration-200" style={{ background: hovered ? `radial-gradient(ellipse at center, ${accent}15, #040608dd 68%)` : 'transparent', zIndex: 3 }}>
          {hovered && (<p className="text-center text-sm leading-relaxed font-mono" style={{ color: accent, textShadow: `0 0 20px ${accent}90` }}>{tagline}<span className="inline-block w-0.5 h-3.5 ml-0.5 align-middle animate-pulse" style={{ background: accent }} /></p>)}
        </div>
        <div className="absolute top-3 left-3 font-mono text-xs font-bold px-2 py-0.5 rounded" style={{ background: '#00000090', color: accent, border: `1px solid ${accent}28`, zIndex: 4 }}>0x0{index + 1}</div>
        <div className="absolute top-3 right-3 font-mono text-xs font-bold px-2 py-0.5 rounded" style={{ background: '#00000090', color: diffColor, border: `1px solid ${diffColor}28`, zIndex: 4 }}>{diffLabel}</div>
        <div className="absolute bottom-0 left-0 right-0 h-px transition-opacity duration-200" style={{ background: `linear-gradient(90deg, transparent 0%, ${accent} 50%, transparent 100%)`, opacity: hovered ? 0.8 : 0, zIndex: 4 }}/>
      </div>
      <div className="p-4 flex flex-col gap-2.5" style={{ minHeight: '220px' }}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: `${accent}12`, color: accent, border: `1px solid ${accent}20` }}>{scenario.category}</span>
          <span className="text-xs font-mono text-gray-600">{scenario.network_range}</span>
        </div>
        <div>
          <h3 className="text-sm font-bold font-mono leading-snug transition-colors duration-200" style={{ color: hovered ? accent : '#d1d5db' }}>{scenario.name}</h3>
          <p className="text-xs font-mono text-gray-500 mt-0.5 leading-relaxed" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '2.7em' }}>{descriptionText || scenario.description}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">{tools.map(tool => (<span key={tool} className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: '#111c1c', color: '#6b7280', border: '1px solid #243030' }}>{tool}</span>))}</div>
        <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid #1e2d2d' }}>
          <span className="text-xs font-mono text-gray-600">{scenario.missions?.length ?? 5} {t('missions')}</span>
          <button 
            onClick={(e) => { e.stopPropagation(); onSelect(scenario.id); }}
            className="flex items-center gap-1.5 text-xs font-mono font-bold transition-colors duration-200 cursor-pointer hover:opacity-80"
            style={{ color: hovered ? accent : '#3d5050', background: 'none', border: 'none', padding: '4px 8px', borderRadius: '4px' }}
          >
            {t('startButton')}
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: hovered ? 'translateX(2px)' : 'none', transition: 'transform 0.2s' }}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>
      </div>
    </article>
  );
}

interface Props { scenarios: Scenario[]; onSelect: (id: string) => void; }

export function LandingPage({ scenarios, onSelect }: Props) {
  const [ready, setReady] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showDonation, setShowDonation] = useState(false);
  const language = useLanguage();
  const setLanguage = useSetLanguage();
  const t = useT();
  useEffect(() => { const timer = setTimeout(() => setReady(true), 50); return () => clearTimeout(timer); }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0b1015', fontFamily: "'Cascadia Code','Fira Code','Consolas',monospace" }}>
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #243030 1px, transparent 1px)', backgroundSize: '30px 30px', opacity: 0.7 }}/>
      <div className="fixed pointer-events-none" style={{ inset: 0, background: 'radial-gradient(ellipse 55% 35% at 50% 42%, #10b98118 0%, transparent 70%)' }}/>
      <header className="relative z-10 flex items-center justify-between px-8 py-4" style={{ borderBottom: '1px solid #1c2a2a' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #047857)', boxShadow: '0 0 14px #10b98138' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
          </div>
          <span className="text-sm font-bold text-gray-200 tracking-tight">ZI Labs</span>
          <span className="text-xs text-gray-500">v4.5</span>
        </div>
        <div className="flex items-center gap-4">
          {/* Language selector */}
          <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1 border border-gray-700">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-2 text-sm font-mono rounded transition-all flex items-center gap-1.5 ${language === 'en' ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-500 hover:text-gray-300'} `}
            >
              <span className="text-base leading-none">🇺🇸</span>
              EN
            </button>
            <button
              onClick={() => setLanguage('es')}
              className={`px-3 py-2 text-sm font-mono rounded transition-all flex items-center gap-1.5 ${language === 'es' ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-500 hover:text-gray-300'} `}
            >
              <span className="text-base leading-none">🇪🇸</span>
              ES
            </button>
          </div>
          
          {/* Blog button */}
          <Link
            to={`/${language}/blog`}
            className="flex items-center gap-2 px-3 py-2 text-sm font-mono rounded-lg border border-gray-700 text-gray-400 hover:text-emerald-400 hover:border-emerald-500/50 transition-all"
            title={language === 'es' ? 'Ir al blog' : 'Go to blog'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            <span>{language === 'es' ? 'Blog' : 'Blog'}</span>
          </Link>

          {/* Feedback button */}
          <button
            onClick={() => setShowFeedback(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-mono rounded-lg border border-gray-700 text-gray-400 hover:text-violet-400 hover:border-violet-500/50 transition-all"
            title={language === 'es' ? 'Enviar comentarios' : 'Send feedback'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span>Feedback</span>
          </button>

          {/* Donation button */}
          <button
            onClick={() => setShowDonation(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-mono rounded-lg border border-gray-700 text-gray-400 hover:text-amber-400 hover:border-amber-500/50 transition-all"
            title={language === 'es' ? 'Apoyar el proyecto' : 'Support the project'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span>{language === 'es' ? 'Apoyar' : 'Support'}</span>
          </button>
          
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" style={{ boxShadow: '0 0 6px #10b981' }}/>
            {scenarios.length} {t('missions')}
          </div>
        </div>
      </header>
      <section className="relative z-10 px-8 pt-16 pb-10 text-center" style={{ opacity: ready ? 1 : 0, transform: ready ? 'none' : 'translateY(10px)', transition: 'opacity 0.5s ease-out, transform 0.5s ease-out' }}>
        <div className="flex items-center justify-center gap-3 mb-7">
          <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, transparent, #2d3f3f)' }}/>
          <span className="text-xs font-mono text-gray-500 tracking-widest uppercase">{t('pentestingLabSimulator')}</span>
          <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, #2d3f3f, transparent)' }}/>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-6" style={{ lineHeight: 1.1 }}>
          <span style={{ background: 'linear-gradient(100deg, #10b981 0%, #22d3ee 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t('heroValueProp')}</span>
        </h1>
        {/* Value badges */}
        <div className="flex items-center justify-center gap-4 mb-8 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium" style={{ background: '#10b98112', color: '#10b981', border: '1px solid #10b98128' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/><line x1="4" y1="4" x2="20" y2="20" strokeWidth="2.5"/></svg>
            {t('badgeNoDownloads')}
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium" style={{ background: '#22d3ee12', color: '#22d3ee', border: '1px solid #22d3ee28' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><line x1="4" y1="4" x2="20" y2="20" strokeWidth="2.5"/></svg>
            {t('badgeNoRegistration')}
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium" style={{ background: '#a78bfa12', color: '#a78bfa', border: '1px solid #a78bfa28' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            {t('badgeSafeEnv')}
          </div>
        </div>
        <h2 className="text-lg font-semibold mb-2" style={{ color: '#d1d5db' }}>
          {t('chooseLab')} <span style={{ background: 'linear-gradient(100deg, #10b981 0%, #22d3ee 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>lab</span>
        </h2>
        <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">{t('hoverHint')}</p>
      </section>
      <main className="relative z-10 flex-1 px-6 pb-14">
        <div className="w-full grid grid-cols-5 gap-4 justify-items-center">
          {scenarios.map((s, i) => (<ScenarioCard key={s.id} scenario={s} index={i} onSelect={onSelect} />))}
        </div>
      </main>
      <footer className="relative z-10 py-4 text-center text-xs text-gray-600" style={{ borderTop: '1px solid #1c2a2a' }}>
        <div className="mb-1 text-gray-500">{t('privacyNotice')}</div>
        ZI Labs · Controlled practice environment · All scenarios are fictional
        <div className="mt-1 text-gray-500">Designed &amp; Developed by <span className="text-violet-400">@pabloveron</span></div>
      </footer>
      
      <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} />
      <DonationModal isOpen={showDonation} onClose={() => setShowDonation(false)} />
      
      <style>{`@keyframes cardIn { from { opacity: 0; transform: translateY(16px) scale(0.98); } to { opacity: 1; transform: none; } }`}</style>
    </div>
  );
}