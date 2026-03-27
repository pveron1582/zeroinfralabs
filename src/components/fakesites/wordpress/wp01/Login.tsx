// ── components/fakesites/wordpress/wp01/Login.tsx ─────────────────
import React, { useState } from 'react';

interface Props {
  ip: string;
  credentials: { user: string; pass: string } | null;
  onNavigate: (url: string) => void;
  onLoginSuccess: (missionId: number) => void;
}

export function WPLogin({ ip, credentials, onNavigate, onLoginSuccess }: Props) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!user || !pass) { setError('Completa todos los campos.'); return; }
    setLoading(true); setError('');
    setTimeout(() => {
      setLoading(false);
      if (credentials && user === credentials.user && pass === credentials.pass) {
        onLoginSuccess(5);
        // onLoginSuccess (doLogin) already navigates to /wp-admin/dashboard — no extra navigate needed
      } else {
        setError('ERROR: nombre de usuario o contraseña incorrectos.');
      }
    }, 700);
  };

  const handleInputChange = () => {
    if (error) {
      setError('');
    }
  };

  return (
    <div className="min-h-full bg-gray-100 flex flex-col items-center justify-center py-12">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">W</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
            <input id="username" type="text" value={user} onChange={e => { setUser(e.target.value); handleInputChange(); }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
              placeholder="" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input id="password" type="password" value={pass} onChange={e => { setPass(e.target.value); handleInputChange(); }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500" />
          </div>
          {error && <div className="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700">{error}</div>}
          <button onClick={handleLogin} disabled={loading}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded font-medium text-sm transition-colors">
            {loading ? 'Verificando...' : 'Acceder'}
          </button>
          <div className="text-center text-xs text-gray-400">
            <button onClick={() => onNavigate(`http://${ip}/`)} className="text-blue-500 hover:underline">← Volver al sitio</button>
          </div>
        </div>
      </div>
    </div>
  );
}
