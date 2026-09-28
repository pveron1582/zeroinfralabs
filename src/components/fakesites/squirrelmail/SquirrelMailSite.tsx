// ── fakesites/squirrelmail/SquirrelMailSite.tsx ───────────────────
// Webmail SquirrelMail 1.4.22 servido por el Apache/PHP del objetivo
// (lab 08). Existe para que el alumno reconozca la versión en la página
// de login: es la entrada al vector CVE-2017-7692 (inyección de la
// opción -C del MTA vía Deliver_SendMail). El módulo de Metasploit y
// este sitio comparten la misma fuente de verdad: el webmail existe si
// y solo si `web_enumeration.cms` dice squirrelmail.

import { useState, type FC } from 'react';
import type { Machine } from '../../../types';

interface SquirrelMailSiteProps {
  machine: Machine;
  currentUrl: string;
  browserIsLoggedIn: boolean;
  onNavigate: (url: string) => void;
}

const INBOX = [
  {
    from: 'IT Service Desk <it-support@corp.local>',
    subject: 'Credenciales del acceso remoto',
    date: 'Lun 09:12',
    body:
      'Hola,\n\n' +
      'Para el escritorio remoto usen la cuenta de soporte:\n\n' +
      '  usuario: helpdesk\n  clave:   Helpdesk2024!\n\n' +
      'La cuenta corre en un escritorio bloqueado, no en el servidor.\n' +
      'Saludos,\nIT',
  },
  {
    from: 'Dpto. Sistemas <sistemas@corp.local>',
    subject: 'Migración del webmail',
    date: 'Dom 18:40',
    body:
      'Actualizamos SquirrelMail a la última versión estable.\n' +
      'Recordatorio: el backup del servidor sigue corriendo con la cuenta ' +
      'de servicio local, no tocan ese servicio.',
  },
  {
    from: 'Seguridad <security@corp.local>',
    subject: 'Re: auditoría interna',
    date: 'Vie 11:03',
    body:
      'Adjunto el informe. Recordamos que las carpetas públicas ' +
      'no deberían tener escritura para el grupo Users.',
  },
];

export const SquirrelMailSite: FC<SquirrelMailSiteProps> = ({
  machine,
  currentUrl,
  browserIsLoggedIn,
  onNavigate,
}) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [loggedIn, setLoggedIn] = useState(browserIsLoggedIn);
  const [folder, setFolder] = useState<'INBOX' | 'Sent'>('INBOX');
  const [sent, setSent] = useState(false);
  const [to, setTo] = useState('root@localhost');
  const [emailAddr, setEmailAddr] = useState('usuario@corp.local');
  const [body, setBody] = useState('');

  const base = `http://${machine.machine_info.ip}/webmail`;
  const onPath = (p: string) => onNavigate(`${base}${p}`);

  const submitLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // El webmail acepta cualquier par: las credenciales de un usuario real
    // no hacen falta para el vector, que es post-auth sobre la sesión de
    // correo del propio usuario.
    if (user && pass) {
      setLoggedIn(true);
      onPath('/src/inbox.php');
    }
  };

  return (
    <div className="min-h-full bg-[#dcdcdc] font-sans text-black text-sm">
      {/* Barra superior estilo SquirrelMail */}
      <div className="bg-[#4a6f8a] text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center font-bold">S</div>
          <span className="font-semibold tracking-wide">SquirrelMail Webmail</span>
          <span className="text-[11px] text-white/70">
            {loggedIn ? `Bienvenido, ${user || 'usuario'}@corp.local` : 'No has iniciado sesión'}
          </span>
        </div>
        {loggedIn && (
          <button
            className="text-[11px] underline"
            onClick={() => { setLoggedIn(false); onPath('/src/login.php'); }}
          >
            Salir
          </button>
        )}
      </div>

      {!loggedIn ? (
        <div className="max-w-sm mx-auto mt-16 bg-white border border-[#9a9a9a] shadow">
          <div className="px-4 py-2 bg-[#e8e8e8] border-b border-[#b5b5b5] font-semibold">
            Iniciar sesión
          </div>
          <form onSubmit={submitLogin} className="p-5 space-y-3">
            <label className="block">
              <span className="text-xs text-[#444]">Nombre de usuario</span>
              <input
                className="w-full border border-[#8a8a8a] px-2 py-1 mt-1"
                value={user}
                onChange={e => setUser(e.target.value)}
                placeholder="usuario@corp.local"
              />
            </label>
            <label className="block">
              <span className="text-xs text-[#444]">Contraseña</span>
              <input
                type="password"
                className="w-full border border-[#8a8a8a] px-2 py-1 mt-1"
                value={pass}
                onChange={e => setPass(e.target.value)}
                placeholder="tu clave"
              />
            </label>
            <button className="w-full bg-[#4a6f8a] text-white py-1.5 rounded-sm hover:bg-[#3d5c73]">
              Entrar
            </button>
          </form>
          {/* Versión visible: es lo que el alumno necesita para orientar el escaneo */}
          <div className="px-5 pb-4 text-[11px] text-[#666]">
            SquirrelMail 1.4.22 · PHP/7.4.3 · Apache/2.4.41 (Win32) — en {machine.machine_info.hostname}
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto mt-6 bg-white border border-[#9a9a9a] shadow">
          <div className="flex border-b border-[#b5b5b5]">
            {(['INBOX', 'Sent'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFolder(f)}
                className={`px-4 py-2 text-xs ${folder === f ? 'bg-[#4a6f8a] text-white' : 'bg-[#e8e8e8]'}`}
              >
                {f === 'INBOX' ? 'Bandeja de entrada' : 'Enviados'}
              </button>
            ))}
            <button
              onClick={() => onPath('/src/compose.php')}
              className="px-4 py-2 text-xs bg-[#e8e8e8] ml-auto hover:bg-[#dcdcdc]"
            >
              Redactar
            </button>
          </div>

          {folder === 'INBOX' && !currentUrl.includes('compose.php') && (
            <table className="w-full text-xs">
              <tbody>
                {INBOX.map((m, i) => (
                  <tr key={i} className="border-b border-[#e5e5e5] align-top">
                    <td className="px-3 py-2 w-2 text-[#888]">{i + 1}</td>
                    <td className="px-2 py-2">
                      <div className="font-semibold">{m.from}</div>
                      <div className="text-[#333]">{m.subject}</div>
                      <pre className="whitespace-pre-wrap font-sans text-[#333] mt-1">{m.body}</pre>
                    </td>
                    <td className="px-3 py-2 text-right text-[#666] whitespace-nowrap">{m.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {folder === 'Sent' && (
            <div className="p-4 text-xs text-[#444]">
              {sent ? 'Enviado: 1 mensaje(s).' : 'No hay mensajes enviados.'}
            </div>
          )}

          {currentUrl.includes('compose.php') && (
            <div className="p-4 space-y-3">
              <div className="text-xs text-[#444]">
                Redactar mensaje — <b>Tu dirección de email:</b>{' '}
                <input
                  className="border border-[#8a8a8a] px-1 py-0.5"
                  value={emailAddr}
                  onChange={e => setEmailAddr(e.target.value)}
                />
              </div>
              <div className="text-xs text-[#444]">
                <b>Para:</b>{' '}
                <input
                  className="border border-[#8a8a8a] px-1 py-0.5"
                  value={to}
                  onChange={e => setTo(e.target.value)}
                />
              </div>
              <textarea
                className="w-full border border-[#8a8a8a] p-2 text-xs"
                rows={4}
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Cuerpo del mensaje…"
              />
              <button
                className="bg-[#4a6f8a] text-white px-4 py-1 rounded-sm"
                onClick={() => { setSent(true); setFolder('Sent'); }}
              >
                Enviar
              </button>
            </div>
          )}
        </div>
      )}

      <div className="max-w-3xl mx-auto mt-3 text-[11px] text-[#555]">
        <a className="underline" onClick={() => onPath('/src/right_main.php')}>SquirrelMail</a>{' '}
        · <a className="underline" onClick={() => onPath('/src/configtest.php')}>configtest</a>{' '}
        · <a className="underline" onClick={() => onPath('/src/change_form.php')}>ChangePasswd</a>
      </div>
    </div>
  );
};
