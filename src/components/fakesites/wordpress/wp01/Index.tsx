import React from 'react';
// ── components/fakesites/wordpress/wp01/Index.tsx ─────────────────
export function WPIndex({ ip, onNavigate }: { ip: string; onNavigate: (url: string) => void }) {
  return (
    <div className="min-h-full bg-white text-gray-800">
      <header className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold text-sm">W</div>
          <span className="font-semibold text-sm">My WordPress Blog</span>
        </div>
        <nav className="flex gap-4 text-xs text-gray-300">
          <button onClick={() => onNavigate(`http://${ip}/`)} className="hover:text-white">Inicio</button>
          <button onClick={() => onNavigate(`http://${ip}/wp-admin`)} className="hover:text-white">Admin</button>
        </nav>
      </header>
      <div className="bg-blue-600 text-white px-6 py-10">
        <h1 className="text-2xl font-bold mb-2">Bienvenidos a Mi Blog</h1>
        <p className="text-blue-200 text-sm">Corriendo WordPress 6.0 en Apache/2.4.41</p>
        <div className="mt-3 text-xs text-blue-300 font-mono">Server: {ip}:80</div>
      </div>
      <div className="flex gap-6 p-6 max-w-4xl">
        <main className="flex-1 space-y-6">
          {['Hello World!', 'Sample Post', 'Another Entry'].map((title, i) => (
            <article key={i} className="border border-gray-200 rounded p-4">
              <h2 className="font-bold text-lg text-blue-600 mb-1">{title}</h2>
              <p className="text-xs text-gray-400 mb-2">Publicado el {new Date(Date.now() - i * 86400000).toLocaleDateString()}</p>
              <p className="text-sm text-gray-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum vehicula lorem...</p>
            </article>
          ))}
        </main>
        <aside className="w-48 space-y-4 text-sm">
          <div className="border border-gray-200 rounded p-3">
            <h3 className="font-bold mb-2 text-gray-700 text-sm">Meta</h3>
            <ul className="space-y-1 text-xs">
              <li><button onClick={() => onNavigate(`http://${ip}/wp-admin`)} className="text-blue-600 hover:underline">Acceder</button></li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
