import React from 'react';
// ── components/fakesites/wordpress/wp01/Dashboard.tsx ────────────
export function WPDashboard({ ip, onNavigate }: { ip: string; onNavigate: (url: string) => void }) {
  return (
    <div className="min-h-full bg-gray-100 flex">
      <div className="w-44 bg-gray-900 text-gray-300 flex flex-col flex-shrink-0">
        <div className="px-3 py-3 bg-gray-800 flex items-center gap-2 border-b border-gray-700">
          <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-white font-bold text-xs">W</div>
          <span className="font-semibold text-white text-xs">Mi Blog</span>
        </div>
        {['Escritorio', 'Entradas', 'Páginas', 'Comentarios', 'Apariencia', 'Plugins', 'Usuarios', 'Ajustes'].map(item => (
          <div key={item} className="px-3 py-2 text-xs hover:bg-gray-700 cursor-pointer border-b border-gray-800/50">{item}</div>
        ))}
      </div>
      <div className="flex-1 flex flex-col">
        <div className="bg-gray-800 text-white px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="text-blue-400">WordPress 6.0</span>
            <button onClick={() => onNavigate(`http://${ip}/`)} className="text-gray-400 hover:text-blue-300">Ver sitio</button>
          </div>
          <span className="text-green-400">● admin</span>
        </div>
        <div className="flex-1 p-5 space-y-4 overflow-auto">
          <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-green-800">
            <strong>🎉 Acceso concedido.</strong> Has comprometido el panel de administración de WordPress.
          </div>
          <h1 className="text-lg font-bold text-gray-800">Escritorio</h1>
          <div className="grid grid-cols-2 gap-3">
            {[{ label: 'Entradas', value: '3' }, { label: 'Páginas', value: '2' }, { label: 'Comentarios', value: '12' }, { label: 'Usuarios', value: '1' }].map(s => (
              <div key={s.label} className="bg-white rounded border border-gray-200 p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-800 font-bold text-sm">{s.value}</div>
                <span className="text-sm text-gray-600">{s.label}</span>
              </div>
            ))}
          </div>
          <div className="bg-gray-900 rounded p-3 font-mono text-xs">
            <div className="text-green-400 mb-1">root@vulnerable-wp-lab:~# cat /home/admin/user.txt</div>
            <div className="text-white">THM&#123;WP_ADMIN_COMPROMISED_GG&#125;</div>
          </div>
        </div>
      </div>
    </div>
  );
}
