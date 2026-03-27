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
          <article className="border border-gray-200 rounded p-4">
            <h2 className="font-bold text-lg text-blue-600 mb-1">Claude 4: La nueva generación de IA de Anthropic revoluciona el mercado</h2>
            <p className="text-xs text-gray-400 mb-2">Publicado el {new Date(Date.now() - 0 * 86400000).toLocaleDateString()}</p>
            <p className="text-sm text-gray-600">Anthropic ha lanzado Claude 4, su modelo de inteligencia artificial más avanzado hasta la fecha. Con capacidades mejoradas de razonamiento, análisis de código y procesamiento de contexto extendido, Claude 4 establece un nuevo estándar en asistentes de IA. El modelo destaca por su capacidad para manejar tareas complejas de programación, análisis de seguridad y generación de contenido técnico con mayor precisión y coherencia que sus predecesores.</p>
          </article>
          <article className="border border-gray-200 rounded p-4">
            <h2 className="font-bold text-lg text-blue-600 mb-1">Ciberseguridad e IA: Cómo la inteligencia artificial está transformando la defensa digital</h2>
            <p className="text-xs text-gray-400 mb-2">Publicado el {new Date(Date.now() - 1 * 86400000).toLocaleDateString()}</p>
            <p className="text-sm text-gray-600">La integración de inteligencia artificial en ciberseguridad está marcando un antes y un después en la protección de sistemas. Las empresas están adoptando soluciones basadas en IA para detectar amenazas en tiempo real, analizar patrones de ataque y automatizar respuestas a incidentes. Sin embargo, los atacantes también aprovechan estas tecnologías para crear malware más sofisticado y ataques de phishing difíciles de detectar, generando una carrera armamentística digital sin precedentes.</p>
          </article>
          <article className="border border-gray-200 rounded p-4">
            <h2 className="font-bold text-lg text-blue-600 mb-1">Nueva vulnerabilidad crítica reportada en WordPress afecta a millones de sitios</h2>
            <p className="text-xs text-gray-400 mb-2">Publicado el {new Date(Date.now() - 2 * 86400000).toLocaleDateString()}</p>
            <p className="text-sm text-gray-600">Investigadores de seguridad han descubierto una vulnerabilidad de ejecución remota de código (RCE) en WordPress que afecta a versiones anteriores a la 6.4.3. La falla, catalogada como CVE-2024-XXXX, permite a atacantes no autenticados ejecutar código malicioso en servidores afectados. Se recomienda actualizar inmediatamente a la última versión y revisar los logs del servidor en busca de actividad sospechosa. Los plugins de seguridad como Wordfence ya han lanzado parches de protección.</p>
          </article>
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
