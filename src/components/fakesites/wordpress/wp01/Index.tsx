import React from 'react';
// ── components/fakesites/wordpress/wp01/Index.tsx ─────────────────
export function WPIndex({ ip, onNavigate }: { ip: string; onNavigate: (url: string) => void }) {
  const today = Date.now();
  return (
    <div className="min-h-full bg-white text-gray-800 flex flex-col">
      <header className="bg-gray-900 text-white px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold text-sm shrink-0">W</div>
          <span className="font-semibold text-sm md:text-base">My WordPress Blog</span>
        </div>
        <nav className="flex gap-4 md:gap-6 text-xs md:text-sm text-gray-300">
          <button onClick={() => onNavigate(`http://${ip}/`)} className="hover:text-white">Home</button>
          <button onClick={() => onNavigate(`http://${ip}/wp-admin`)} className="hover:text-white">Admin</button>
        </nav>
      </header>
      <div className="bg-blue-600 text-white px-6 md:px-10 lg:px-16 py-8 md:py-12">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">Welcome to My Blog</h1>
        <p className="text-blue-200 text-sm md:text-base">Running WordPress 6.0 on Apache/2.4.41</p>
        <div className="mt-3 md:mt-4 text-xs md:text-sm text-blue-300 font-mono">Server: {ip}:80</div>
      </div>
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 xl:gap-10 p-4 md:p-6 lg:p-8 xl:p-10 w-full max-w-7xl mx-auto">
        <main className="flex-1 min-w-0 space-y-6 md:space-y-8">
          <article className="border border-gray-200 rounded p-4 md:p-5 lg:p-6">
            <h2 className="font-bold text-lg md:text-xl lg:text-2xl text-blue-600 mb-1">Claude 4: Anthropic&apos;s new AI generation revolutionizes the market</h2>
            <p className="text-xs md:text-sm text-gray-400 mb-2">Published on {new Date(today - 0 * 86400000).toLocaleDateString()}</p>
            <p className="text-sm md:text-base lg:text-lg text-gray-600 leading-relaxed">Anthropic has launched Claude 4, its most advanced artificial intelligence model to date. With improved reasoning capabilities, code analysis, and extended context processing, Claude 4 sets a new standard in AI assistants. The model stands out for its ability to handle complex programming tasks, security analysis, and technical content generation with greater precision and coherence than its predecessors.</p>
          </article>
          <article className="border border-gray-200 rounded p-4 md:p-5 lg:p-6">
            <h2 className="font-bold text-lg md:text-xl lg:text-2xl text-blue-600 mb-1">Cybersecurity and AI: How artificial intelligence is transforming digital defense</h2>
            <p className="text-xs md:text-sm text-gray-400 mb-2">Published on {new Date(today - 1 * 86400000).toLocaleDateString()}</p>
            <p className="text-sm md:text-base lg:text-lg text-gray-600 leading-relaxed">The integration of artificial intelligence in cybersecurity is marking a before and after in system protection. Companies are adopting AI-based solutions to detect threats in real time, analyze attack patterns, and automate incident responses. However, attackers also leverage these technologies to create more sophisticated malware and harder-to-detect phishing attacks, generating an unprecedented digital arms race.</p>
          </article>
          <article className="border border-gray-200 rounded p-4 md:p-5 lg:p-6">
            <h2 className="font-bold text-lg md:text-xl lg:text-2xl text-blue-600 mb-1">New critical vulnerability reported in WordPress affects millions of sites</h2>
            <p className="text-xs md:text-sm text-gray-400 mb-2">Published on {new Date(today - 2 * 86400000).toLocaleDateString()}</p>
            <p className="text-sm md:text-base lg:text-lg text-gray-600 leading-relaxed">Security researchers have discovered a remote code execution (RCE) vulnerability in WordPress that affects versions prior to 6.4.3. The flaw, cataloged as CVE-2024-XXXX, allows unauthenticated attackers to execute malicious code on affected servers. It is recommended to immediately update to the latest version and review server logs for suspicious activity. Security plugins like Wordfence have already released protection patches.</p>
          </article>
        </main>
        <aside className="w-full lg:w-56 xl:w-64 flex-shrink-0 space-y-4 text-sm">
          <div className="border border-gray-200 rounded p-3 md:p-4">
            <h3 className="font-bold mb-2 text-gray-700 text-sm md:text-base">Meta</h3>
            <ul className="space-y-1 text-xs md:text-sm">
              <li><button onClick={() => onNavigate(`http://${ip}/wp-admin`)} className="text-blue-600 hover:underline">Log In</button></li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
