import React from 'react';
// ── components/fakesites/wordpress/wp01/Uploads.tsx ──────────────

interface Props {
  ip: string;
  onNavigate: (url: string) => void;
  onCredentialsFound: (user: string, pass: string, file?: string, service?: string) => void;
}

export function WPUploads({ ip, onNavigate, onCredentialsFound }: Props) {
  const files = [
    { name: 'image-2023-11.jpg', size: '124 KB', date: '2023-11-14' },
    { name: 'screenshot.png',    size: '98 KB',  date: '2023-11-10' },
    { name: 'logo.svg',          size: '4 KB',   date: '2023-10-28' },
    { name: 'config.bak',        size: '2.3 KB', date: '2023-11-01', isLink: true, href: '/uploads/config.bak' },
  ] as const;

  return (
    <div className="min-h-full bg-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-4 flex items-center gap-2">
          <span className="text-amber-600">⚠️</span>
          <div>
            <div className="text-sm font-bold text-amber-800">Directory Listing activo</div>
            <div className="text-xs text-amber-700">Este directorio tiene listado público habilitado.</div>
          </div>
        </div>
        <h1 className="font-mono text-sm text-gray-500 mb-3">Index of /uploads</h1>
        <table className="w-full text-sm border border-gray-200 rounded overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-3 py-2 text-xs text-gray-600 font-semibold">Nombre</th>
              <th className="text-left px-3 py-2 text-xs text-gray-600 font-semibold">Tamaño</th>
              <th className="text-left px-3 py-2 text-xs text-gray-600 font-semibold">Fecha</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-gray-100">
              <td className="px-3 py-2">
                <button onClick={() => onNavigate(`http://${ip}/`)} className="text-blue-600 hover:underline text-xs font-mono">../</button>
              </td>
              <td className="px-3 py-2 text-xs text-gray-400">—</td>
              <td className="px-3 py-2 text-xs text-gray-400">—</td>
            </tr>
            {files.map(f => (
              <tr key={f.name} className={`border-t border-gray-100 ${'isLink' in f && f.isLink ? 'bg-amber-50 hover:bg-amber-100' : 'hover:bg-gray-50'}`}>
                <td className="px-3 py-2">
                  {'isLink' in f && f.isLink
                    ? <button
                        onClick={() => {
                          onCredentialsFound('admin', 'P@ssw0rd123!', '/uploads/config.bak', 'wp-admin');
                          onNavigate(`http://${ip}${f.href}`);
                        }}
                        className="text-blue-600 hover:underline font-mono text-xs flex items-center gap-1">
                        📄 {f.name}
                      </button>
                    : <span className="text-gray-600 font-mono text-xs">{f.name}</span>}
                </td>
                <td className="px-3 py-2 text-xs text-gray-500">{f.size}</td>
                <td className="px-3 py-2 text-xs text-gray-500 font-mono">{f.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
