import React, { useEffect, useRef } from 'react';
// ── components/fakesites/wordpress/wp01/Dashboard.tsx ────────────
interface Props {
  ip: string;
  onNavigate: (url: string) => void;
  onLogout?: () => void;
  onCredentialsFound?: (user: string, pass: string, file?: string, service?: string) => void;
}

export function WPDashboard({ ip, onNavigate, onLogout, onCredentialsFound }: Props) {
  const credentialsDiscovered = useRef(false);
  
  useEffect(() => {
    if (onCredentialsFound && !credentialsDiscovered.current) {
      credentialsDiscovered.current = true;
      // Upon accessing the dashboard, we discover SSH root credentials
      onCredentialsFound('root', 'R00t@SSH2024!', '/wp-admin/wp-config.php', 'ssh');
    }
  }, [onCredentialsFound]);
  return (
    <div className="min-h-full bg-gray-100 flex">
      <div className="w-44 bg-gray-900 text-gray-300 flex flex-col flex-shrink-0">
        <div className="px-3 py-3 bg-gray-800 flex items-center gap-2 border-b border-gray-700">
          <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-white font-bold text-xs">W</div>
          <span className="font-semibold text-white text-xs">My Blog</span>
        </div>
        {['Dashboard', 'Posts', 'Pages', 'Comments', 'Appearance', 'Plugins', 'Users', 'Settings'].map(item => (
          <div key={item} className="px-3 py-2 text-xs hover:bg-gray-700 cursor-pointer border-b border-gray-800/50">{item}</div>
        ))}
      </div>
      <div className="flex-1 flex flex-col">
        <div className="bg-gray-800 text-white px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="text-blue-400">WordPress 6.0</span>
            <button onClick={() => onNavigate(`http://${ip}/`)} className="text-gray-400 hover:text-blue-300">View site</button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-green-400">● admin</span>
            {onLogout && (
              <button onClick={onLogout} className="text-red-400 hover:text-red-300 text-xs">
                Logout
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 p-5 space-y-4 overflow-auto">
          <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-green-800">
            <strong>🎉 Access granted.</strong> You have compromised the WordPress admin panel.
          </div>
          <h1 className="text-lg font-bold text-gray-800">Dashboard</h1>
          <div className="grid grid-cols-2 gap-3">
            {[{ label: 'Posts', value: '3' }, { label: 'Pages', value: '2' }, { label: 'Comments', value: '12' }, { label: 'Users', value: '1' }].map(s => (
              <div key={s.label} className="bg-white rounded border border-gray-200 p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-800 font-bold text-sm">{s.value}</div>
                <span className="text-sm text-gray-600">{s.label}</span>
              </div>
            ))}
          </div>
          {/* SSH credentials discovered in dashboard */}
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <h3 className="text-sm font-bold text-yellow-800 mb-2">🔑 SSH Credentials Found</h3>
            <div className="bg-gray-900 rounded p-2 font-mono text-xs">
              <div className="text-gray-400"># Development server - root access</div>
              <div className="text-green-400">SSH_USER = root</div>
              <div className="text-green-400">SSH_PASS = R00t@SSH2024!</div>
              <div className="text-gray-500"># File: /wp-admin/wp-config.php</div>
            </div>
          </div>

          {/* User flag */}
          <div className="bg-gray-900 rounded p-3 font-mono text-xs">
            <div className="text-white">ZIL&#123;WP_ADMIN_COMPROMISED_GG&#125;</div>
          </div>
        </div>
      </div>
    </div>
  );
}
