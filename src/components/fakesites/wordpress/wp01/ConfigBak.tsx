import React from 'react';
// ── components/fakesites/wordpress/wp01/ConfigBak.tsx ────────────
// Simulates the raw file view of /uploads/config.bak
// This file is intentionally left exposed on the vulnerable server.

const getFileLines = (ip: string) => [
  '# WordPress Configuration Backup',
  '# Server: vulnerable-wp-lab',
  '# Generated: 2023-11-01 03:17:42',
  '# DO NOT EXPOSE TO PUBLIC — AUTO-GENERATED',
  '',
  '## WordPress Admin',
  'WP_ADMIN_USER  = admin',
  'WP_ADMIN_PASS  = P@ssw0rd123!',
  'WP_ADMIN_EMAIL = admin@vulnerable-wp-lab.local',
  '',
  '## Paths',
  'WP_ROOT     = /var/www/html',
  'UPLOADS_DIR = /var/www/html/uploads',
  'BACKUP_DIR  = /var/www/html/backup',
];

export function WPConfigBak({ ip, onNavigate }: { ip: string; onNavigate: (url: string) => void }) {
  const FILE_LINES = getFileLines(ip);
  return (
    <div className="min-h-full bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        <span className="text-sm text-gray-600 font-mono">/uploads/config.bak</span>
        <span className="ml-auto text-xs text-gray-400">2.3 KB · text/plain</span>
      </div>

      <div className="mx-6 mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
        <span className="text-amber-500 text-base leading-tight">⚠️</span>
        <div>
          <p className="text-sm font-bold text-amber-800">Archivo de configuración expuesto públicamente</p>
          <p className="text-xs text-amber-700 mt-0.5">Este archivo contiene credenciales en texto plano. Hallazgo crítico de seguridad.</p>
        </div>
      </div>

      <div className="mx-6 mt-4 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
        <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
            </div>
            <span className="text-xs text-gray-400 font-mono ml-1">config.bak — Raw</span>
          </div>
          <span className="text-xs text-amber-400 font-mono">⚠ credentials exposed</span>
        </div>
        <div className="bg-gray-900 overflow-x-auto">
          {FILE_LINES.map((line, i) => {
            const isCredLine = line.includes('PASS') || (line.includes('USER') && line.includes('='));
            return (
              <div key={i} className={`flex font-mono text-xs ${isCredLine ? 'bg-amber-500/10' : ''}`}>
                <span className="w-10 flex-shrink-0 text-right pr-3 py-0.5 text-gray-600 select-none border-r border-gray-800">{i + 1}</span>
                <span className={`pl-4 py-0.5 whitespace-pre ${
                  line.startsWith('##')  ? 'text-blue-400' :
                  line.startsWith('#')   ? 'text-gray-500' :
                  isCredLine             ? 'text-amber-300 font-semibold' :
                  line === ''            ? 'text-gray-700' :
                  'text-gray-300'
                }`}>{line || ' '}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mx-6 mt-3 mb-6">
        <button onClick={() => onNavigate(`http://${ip}/uploads`)} className="text-xs text-blue-500 hover:underline font-mono">
          ← Volver a /uploads
        </button>
      </div>
    </div>
  );
}
