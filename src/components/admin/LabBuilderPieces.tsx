import type { Port } from '../../types';
import type { BuilderState } from './LabBuilder';

export interface PieceDef {
  id: string;
  label: string;
  labelEs: string;
  icon: string;
  port: Port;
  enabled: boolean;
  category: 'service' | 'web' | 'vuln' | 'cred';
}

export const defaultPieces: PieceDef[] = [
  { id: 'ssh', label: 'SSH', labelEs: 'SSH', icon: '🔐', port: { port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH 8.2p1' }, enabled: true, category: 'service' },
  { id: 'ftp', label: 'FTP', labelEs: 'FTP', icon: '📁', port: { port: 21, protocol: 'tcp', state: 'open', service: 'ftp', version: 'vsFTPd 3.0.3' }, enabled: false, category: 'service' },
  { id: 'http', label: 'HTTP', labelEs: 'HTTP', icon: '🌐', port: { port: 80, protocol: 'tcp', state: 'open', service: 'http', version: 'Apache 2.4.41' }, enabled: true, category: 'service' },
  { id: 'https', label: 'HTTPS', labelEs: 'HTTPS', icon: '🔒', port: { port: 443, protocol: 'tcp', state: 'open', service: 'https', version: 'nginx' }, enabled: false, category: 'service' },
  { id: 'mysql', label: 'MySQL', labelEs: 'MySQL', icon: '🗄️', port: { port: 3306, protocol: 'tcp', state: 'open', service: 'mysql', version: 'MySQL 5.7.38' }, enabled: false, category: 'service' },
  { id: 'smb', label: 'SMB', labelEs: 'SMB', icon: '📂', port: { port: 445, protocol: 'tcp', state: 'open', service: 'microsoft-ds', version: 'Windows 7' }, enabled: false, category: 'service' },
  { id: 'rdp', label: 'RDP', labelEs: 'RDP', icon: '🖥️', port: { port: 3389, protocol: 'tcp', state: 'open', service: 'ms-wbt-server', version: 'Terminal Services' }, enabled: false, category: 'service' },
];

const webSites = [
  { id: 'none', label: 'Ninguno', labelEn: 'None', icon: '—' },
  { id: 'wordpress', label: 'WordPress', labelEn: 'WordPress', icon: '📝' },
  { id: 'sqli', label: 'SQL Injection', labelEn: 'SQL Injection', icon: '💉' },
  { id: 'lfi', label: 'LFI / File Inclusion', labelEn: 'LFI / File Inclusion', icon: '📄' },
  { id: 'consultancy', label: 'Sitio Consultoría', labelEn: 'Consultancy Site', icon: '💼' },
] as const;

const vulnPieces = [
  { id: 'sudo-misconfig', label: 'Sudo mal configurado', labelEn: 'Sudo misconfiguration', icon: '⚡' },
  { id: 'suid-find', label: 'SUID find', labelEn: 'SUID find', icon: '🔍' },
  { id: 'suid-vim', label: 'SUID vim', labelEn: 'SUID vim', icon: '📝' },
  { id: 'cron-writable', label: 'Cron escribible', labelEn: 'Writable cron', icon: '⏰' },
  { id: 'writable-etc', label: '/etc/passwd escribible', labelEn: 'Writable /etc/passwd', icon: '✏️' },
  { id: 'kernel-exploit', label: 'Kernel vulnerable', labelEn: 'Vulnerable kernel', icon: '💣' },
] as const;

export function LabBuilderPieces({ state, update, isEs }: {
  state: BuilderState;
  update: <K extends keyof BuilderState>(key: K, value: BuilderState[K]) => void;
  isEs: boolean;
}) {
  const togglePort = (portNum: number) => {
    const has = state.ports.some(p => p.port === portNum);
    if (has) {
      update('ports', state.ports.filter(p => p.port !== portNum));
    } else {
      const def = defaultPieces.find(d => d.port.port === portNum);
      if (def) update('ports', [...state.ports, def.port]);
    }
  };

  const toggleVuln = (id: string) => {
    if (state.vulnerabilities.includes(id)) {
      update('vulnerabilities', state.vulnerabilities.filter(v => v !== id));
    } else {
      update('vulnerabilities', [...state.vulnerabilities, id]);
    }
  };

  const addCred = () => {
    update('credentials', [...state.credentials, { user: '', pass: '', service: 'ssh' }]);
  };

  const updateCred = (idx: number, field: 'user' | 'pass' | 'service', value: string) => {
    const creds = [...state.credentials];
    creds[idx] = { ...creds[idx], [field]: value };
    update('credentials', creds);
  };

  const removeCred = (idx: number) => {
    update('credentials', state.credentials.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-200 mb-1">
        {isEs ? 'Piezas del lab' : 'Lab pieces'}
      </h2>
      <p className="text-xs text-gray-500 mb-4">
        {isEs ? 'Seleccioná los servicios, sitio web, vulnerabilidades y credenciales que tendrá la máquina víctima.' : 'Select the services, website, vulnerabilities and credentials that the target machine will have.'}
      </p>

      {/* Servicios / Puertos */}
      <section>
        <h3 className="text-sm font-bold text-cyan-400 mb-2">{isEs ? 'Servicios y puertos' : 'Services & ports'}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {defaultPieces.map(p => {
            const active = state.ports.some(x => x.port === p.port.port);
            return (
              <button key={p.id} onClick={() => togglePort(p.port.port)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${
                  active ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-gray-900 border-gray-700 text-gray-500 hover:border-gray-600'
                }`}
                style={{ border: '1px solid' }}>
                <span>{p.icon}</span>
                <span className="font-mono">{p.port.port}</span>
                <span>{isEs ? p.labelEs : p.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Sitio web */}
      <section>
        <h3 className="text-sm font-bold text-cyan-400 mb-2">{isEs ? 'Sitio web' : 'Website'}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {webSites.map(w => {
            const active = state.webSite === w.id;
            return (
              <button key={w.id} onClick={() => update('webSite', w.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${
                  active ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' : 'bg-gray-900 border-gray-700 text-gray-500 hover:border-gray-600'
                }`}
                style={{ border: '1px solid' }}>
                <span>{w.icon}</span>
                <span>{isEs ? w.label : w.labelEn}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Credenciales */}
      <section>
        <h3 className="text-sm font-bold text-cyan-400 mb-2">{isEs ? 'Credenciales' : 'Credentials'}</h3>
        {state.credentials.map((c, i) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <input value={c.user} onChange={e => updateCred(i, 'user', e.target.value)}
              placeholder={isEs ? 'usuario' : 'user'}
              className="flex-1 px-2 py-1.5 rounded bg-gray-900 text-gray-300 text-xs border outline-none"
              style={{ borderColor: '#1c2a2a' }} />
            <input value={c.pass} onChange={e => updateCred(i, 'pass', e.target.value)}
              placeholder={isEs ? 'contraseña' : 'password'} type="password"
              className="flex-1 px-2 py-1.5 rounded bg-gray-900 text-gray-300 text-xs border outline-none"
              style={{ borderColor: '#1c2a2a' }} />
            <select value={c.service} onChange={e => updateCred(i, 'service', e.target.value)}
              className="px-2 py-1.5 rounded bg-gray-900 text-gray-300 text-xs border outline-none"
              style={{ borderColor: '#1c2a2a' }}>
              <option value="ssh">SSH</option>
              <option value="ftp">FTP</option>
              <option value="wp-admin">WP-Admin</option>
              <option value="mysql">MySQL</option>
            </select>
            <button onClick={() => removeCred(i)} className="text-red-400 hover:text-red-300 text-xs px-2">✕</button>
          </div>
        ))}
        <button onClick={addCred}
          className="text-xs px-3 py-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-all"
          style={{ border: '1px dashed #1c2a2a' }}>
          + {isEs ? 'Agregar credencial' : 'Add credential'}
        </button>
      </section>

      {/* Vulnerabilidades */}
      <section>
        <h3 className="text-sm font-bold text-cyan-400 mb-2">{isEs ? 'Vulnerabilidades' : 'Vulnerabilities'}</h3>
        <div className="grid grid-cols-2 gap-2">
          {vulnPieces.map(v => {
            const active = state.vulnerabilities.includes(v.id);
            return (
              <button key={v.id} onClick={() => toggleVuln(v.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all text-left ${
                  active ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-gray-900 border-gray-700 text-gray-500 hover:border-gray-600'
                }`}
                style={{ border: '1px solid' }}>
                <span>{v.icon}</span>
                <span>{isEs ? v.label : v.labelEn}</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
