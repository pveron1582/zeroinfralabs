// ── components/admin/LoginScreen.tsx ────────────────────────────
// Pantalla de login del panel de administración

import { MONO_FONT, ShieldIcon } from './shared';

interface Props {
  isEs: boolean;
  user: string;
  pass: string;
  loginError: string;
  setUser: (v: string) => void;
  setPass: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBackHome: () => void;
}

export function LoginScreen({ isEs, user, pass, loginError, setUser, setPass, onSubmit, onBackHome }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0b1015', fontFamily: MONO_FONT }}>
      <form onSubmit={onSubmit} className="p-8 rounded-2xl w-full max-w-sm" style={{ background: '#0d1117', border: '1px solid #1c2a2a' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#10b981', boxShadow: '0 0 14px #10b98138' }}>
            <ShieldIcon />
          </div>
          <span className="text-lg font-bold text-gray-200">Admin Panel</span>
        </div>
        <div className="mb-4">
          <label className="text-xs text-gray-500 mb-1 block">{isEs ? 'Usuario' : 'Username'}</label>
          <input type="text" value={user} onChange={e => setUser(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm bg-gray-900 text-gray-200 border outline-none"
            style={{ borderColor: '#1c2a2a' }} placeholder="admin" />
        </div>
        <div className="mb-4">
          <label className="text-xs text-gray-500 mb-1 block">{isEs ? 'Contraseña' : 'Password'}</label>
          <input type="password" value={pass} onChange={e => setPass(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm bg-gray-900 text-gray-200 border outline-none"
            style={{ borderColor: '#1c2a2a' }} placeholder="admin" />
        </div>
        {loginError && <p className="text-red-400 text-xs mb-4">{loginError}</p>}
        <button type="submit"
          className="w-full py-2.5 rounded-xl text-sm font-bold transition-all"
          style={{ background: '#10b981', color: '#fff' }}>
          {isEs ? 'Ingresar' : 'Login'}
        </button>
        <button type="button" onClick={onBackHome}
          className="w-full mt-2 py-2 rounded-lg text-xs text-gray-500 hover:text-gray-300 transition-all">
          ← {isEs ? 'Volver al inicio' : 'Back to home'}
        </button>
      </form>
    </div>
  );
}
