import React from 'react';

export const ZeroInfraLabs: React.FC = () => {
  return (
    <div className="min-h-full bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white font-sans">
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="mb-8">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-purple-400/30">
            <span className="text-2xl">⚡</span>
            <span className="text-sm font-mono text-purple-300">zeroinfralabs.vercel.app</span>
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
          ZeroInfra Labs
        </h1>
        <p className="text-xl text-gray-300 mb-4 max-w-2xl mx-auto">
          La infraestructura que no existe, funciona mejor.
        </p>
        <p className="text-gray-500 text-sm mb-12 italic">
          "If you have zero infrastructure, you have zero problems." — algún ingeniero en producción
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-16 text-left">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-purple-400/40 transition-all">
            <div className="text-3xl mb-3">☁️</div>
            <h3 className="font-bold mb-2">Cloud Null</h3>
            <p className="text-sm text-gray-400">Tu código corre en servidores que no existen. Latencia: 0ms. Costo: $0.</p>
          </div>
          <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-pink-400/40 transition-all">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="font-bold mb-2">Seguridad Imaginaria</h3>
            <p className="text-sm text-gray-400">Si no hay infraestructura, no hay brechas de seguridad. 100% invulnerable.</p>
          </div>
          <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-cyan-400/40 transition-all">
            <div className="text-3xl mb-3">🚀</div>
            <h3 className="font-bold mb-2">Deploy Instantáneo</h3>
            <p className="text-sm text-gray-400">Hacemos git push a /dev/null. Tu app nunca falla porque nunca existió.</p>
          </div>
        </div>

        <div className="bg-white/5 rounded-2xl p-8 border border-white/10 mb-16">
          <h2 className="text-2xl font-bold mb-4 text-purple-300">Nuestros Labs (simulados)</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {['Web OSINT', 'SSH Brute Force', 'WordPress', 'LFI', 'SQL Injection', 'PrivEsc'].map((lab, i) => (
              <span key={i} className="px-4 py-2 bg-white/10 rounded-full text-sm font-mono text-gray-300 border border-white/10">
                {lab}
              </span>
            ))}
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-500 text-xs mb-2">Hecho con 💜 por el equipo de ZeroInfra</p>
          <p className="text-gray-600 text-xs">Esta página es puramente ficticia. Cualquier similitud con la realidad es pura coincidencia.</p>
        </div>
      </div>
    </div>
  );
};
