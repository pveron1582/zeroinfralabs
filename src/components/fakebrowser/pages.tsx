// ── components/fakebrowser/pages.tsx ──────────────────────────────
// Páginas internas del navegador simulado: Google, errores de Chrome
// y easter-eggs. Componentes puramente presentacionales.

import { useState } from 'react';

export function GoogleHome({ onNavigate }: { onNavigate: (url: string) => void }) {
  const [query, setQuery] = useState('');
  const suggestions = ['nmap tutorial', 'wordpress exploit', 'gobuster wordlist', 'ssh brute force'];
  const randomSearches = [
    'how to hack wifi', 'sql injection tutorial', 'metasploit guide',
    'kali linux tools', 'reverse shell payload', 'xss attack example',
    'password cracking methods', 'network scanning techniques',
    'privilege escalation linux', 'buffer overflow exploit'
  ];

  const handleSearch = () => {
    if (query.trim()) {
      onNavigate(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
    } else {
      const randomQuery = randomSearches[Math.floor(Math.random() * randomSearches.length)];
      onNavigate(`https://www.google.com/search?q=${encodeURIComponent(randomQuery)}`);
    }
  };

  return (
    <div className="min-h-full bg-white flex flex-col items-center justify-center gap-6 px-4">
      <div className="flex items-center select-none" style={{ fontSize: '68px', fontFamily: 'Product Sans,Arial,sans-serif', fontWeight: 400 }}>
        <span style={{ color: '#4285F4' }}>G</span><span style={{ color: '#EA4335' }}>o</span>
        <span style={{ color: '#FBBC05' }}>o</span><span style={{ color: '#4285F4' }}>g</span>
        <span style={{ color: '#34A853' }}>l</span><span style={{ color: '#EA4335' }}>e</span>
      </div>
      <div className="w-full max-w-xl">
        <div className="flex items-center gap-3 px-4 py-3 rounded-full border border-gray-300 hover:shadow-md transition-shadow bg-white">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9aa0a6" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search Google or type a URL"
            className="flex-1 outline-none text-sm text-gray-800 bg-transparent"
            onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }} />
        </div>
        <div className="mt-4 flex gap-3 justify-center">
          <button onClick={handleSearch}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded transition-colors">
            Google Search
          </button>
          <button onClick={() => onNavigate('chrome://dino')}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded transition-colors">
            I'm Feeling Lucky
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 justify-center">
          {suggestions.map(s => (
            <button key={s} onClick={() => setQuery(s)}
              className="text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors">{s}</button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2 justify-center border-t border-gray-100 pt-4">
          <button onClick={() => onNavigate('https://zeroinfralabs.vercel.app')}
            className="text-xs text-purple-600 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-full transition-colors font-medium">
            ⚡ zeroinfralabs.vercel.app
          </button>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gray-100 border-t border-gray-200 px-6 py-3 flex justify-between text-xs text-gray-500">
        <span>United States</span>
        <div className="flex gap-4">
          <span className="cursor-default hover:underline">Privacy</span>
          <span className="cursor-default hover:underline">Terms</span>
        </div>
      </div>
    </div>
  );
}

export function GoogleSearch({ url, onNavigate }: { url: string; onNavigate: (url: string) => void }) {
  const params = new URLSearchParams(url.split('?')[1] || '');
  const q = params.get('q') || '';
  const fakeResults = [
    { title: `${q} - Wikipedia`, url: 'https://en.wikipedia.org/wiki/...', desc: 'Wikipedia article about the requested topic.' },
    { title: `Tutorial: ${q} step by step`, url: 'https://www.hacktricks.xyz/...', desc: 'Complete guide with practical examples.' },
  ];
  return (
    <div className="min-h-full bg-white">
      <div className="border-b border-gray-200 px-4 py-3 flex items-center gap-4">
        <button onClick={() => onNavigate('https://www.google.com')} style={{ fontFamily: 'Product Sans,Arial,sans-serif', fontSize: '20px', flexShrink: 0 }}>
          <span style={{ color: '#4285F4' }}>G</span><span style={{ color: '#EA4335' }}>o</span>
          <span style={{ color: '#FBBC05' }}>o</span><span style={{ color: '#4285F4' }}>g</span>
          <span style={{ color: '#34A853' }}>l</span><span style={{ color: '#EA4335' }}>e</span>
        </button>
        <div className="flex-1 max-w-lg flex items-center gap-2 px-3 py-2 rounded-full border border-gray-300 text-sm">{q}</div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="space-y-5">
          {fakeResults.map((r, i) => (
            <div key={i}>
              <p className="text-xs text-gray-500">{r.url}</p>
              <button className="text-lg text-blue-700 hover:underline text-left">{r.title}</button>
              <p className="text-sm text-gray-700 mt-0.5">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HttpSecurityError({ url, onNavigate }: { url: string; onNavigate: (url: string) => void }) {
  const secureUrl = url.replace(/^http:\/\//i, 'https://');
  return (
    <div className="min-h-full bg-white flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <h1 className="text-2xl font-medium text-gray-800 mb-2">Your connection is not private</h1>
        <p className="text-gray-600 mb-2">
          Attackers might be trying to steal your information from <strong>{url.replace(/^http:\/\//i, '')}</strong>
        </p>
        <p className="text-gray-500 text-sm mb-6">
          (for example, passwords, messages, or credit cards).{' '}
          <a href="#" className="text-blue-600 hover:underline">Learn more</a>
        </p>
        <div className="text-red-600 text-sm mb-6 font-mono bg-red-50 p-3 rounded">
          NET::ERR_CERT_AUTHORITY_INVALID
        </div>
        <div className="flex flex-col gap-3">
          <button onClick={() => onNavigate(secureUrl)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors">
            Use secure HTTPS
          </button>
          <button onClick={() => onNavigate('https://www.google.com')}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded transition-colors">
            Back to Google (secure)
          </button>
        </div>
        <p className="mt-6 text-xs text-gray-400">The HTTP protocol is no longer secure. Modern sites use HTTPS.</p>
      </div>
    </div>
  );
}

export function PageNotFound({ url }: { url: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 bg-white">
      <div className="text-6xl font-bold text-gray-200">404</div>
      <div className="text-lg font-semibold text-gray-600">Not Found</div>
      <div className="text-sm text-gray-400 font-mono">{url}</div>
    </div>
  );
}

export function DinoGame() {
  return (
    <div className="min-h-full bg-white flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl mb-6 select-none">🦖</div>
        <h1 className="text-2xl font-medium text-gray-700 mb-2">No hay conexión</h1>
        <p className="text-gray-500 text-sm mb-6">Esto es un simulador, no puedo mostrar nada muy útil desde acá. 😅</p>
        <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
          <div className="w-4 h-4 border-2 border-gray-300 rounded-sm"></div>
          <span>Presiona espacio para jugar</span>
        </div>
        <div className="mt-8 flex gap-1 justify-center">
          {[...Array(20)].map((_, i) => (
            <div key={i} className={`w-3 h-8 ${i % 3 === 0 ? 'bg-gray-300' : 'bg-gray-200'} rounded-sm`}></div>
          ))}
        </div>
        <p className="mt-6 text-xs text-gray-400">ERR_INTERNET_SIMULATOR_MODE</p>
      </div>
    </div>
  );
}
