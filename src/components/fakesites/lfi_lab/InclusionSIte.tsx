import React, { useState, useMemo } from 'react';

// Props del componente: IP del servidor, URL actual, callbacks de navegación y subida
interface Props {
  ip: string; currentUrl: string; onNavigate: (url: string) => void;
  onUploadSuccess: () => void; attackerFiles?: Array<{ path: string; name: string }>;
  listeningPort?: number;
}

// Archivos del servidor que se pueden leer mediante LFI (Local File Inclusion)
const SERVER_FILES: Record<string, { content: string; contentType: string }> = {
  'etc/passwd': { content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nbin:x:2:2:bin:/bin:/usr/sbin/nologin\nsys:x:3:3:sys:/dev:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nadmin:x:1000:1000:admin,,,:/home/admin:/bin/bash', contentType: 'text/plain' },
  'etc/shadow': { content: 'root:$6$rounds=656000$abcdefghijklmnop$1234567890abcdefghijklmnop/1234567890123456:18000:0:99999:7:::\ndaemon:*:18000:0:99999:7:::\nwww-data:*:18000:0:99999:7:::', contentType: 'text/plain' },
  'etc/hosts': { content: '127.0.0.1 localhost\n127.0.1.1 dev-portal-backup\n::1 localhost ip6-localhost ip6-loopback', contentType: 'text/plain' },
  'etc/hostname': { content: 'dev-portal-backup', contentType: 'text/plain' },
  'etc/apache2/apache2.conf': { content: '# Apache2 Configuration File\nServerRoot "/etc/apache2"\nUser ${APACHE_RUN_USER}\nGroup ${APACHE_RUN_GROUP}\nErrorLog ${APACHE_LOG_DIR}/error.log\n<Directory /var/www/>\n  Options Indexes FollowSymLinks\n  AllowOverride All\n  Require all granted\n</Directory>', contentType: 'text/plain' },
  'proc/self/environ': { content: 'APACHE_RUN_DIR=/var/run/apache2\nAPACHE_RUN_USER=www-data\nAPACHE_RUN_GROUP=www-data\nAPACHE_LOG_DIR=/var/log/apache2\nPATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\nHOME=/var/www\nSERVER_SOFTWARE=Apache/2.4.52 (Debian)\nSERVER_NAME=dev-portal-backup\nSERVER_ADDR=192.168.20.11\nSERVER_PORT=80\nREMOTE_ADDR=192.168.20.10\nDOCUMENT_ROOT=/var/www/html\nQUERY_STRING=page=../../../../etc/passwd', contentType: 'text/plain' },
  'var/www/html/index.php': { content: '<?php\n$page = isset($_GET["page"]) ? $_GET["page"] : "home.php";\n// VULNERABLE: No sanitization of user input\ninclude($page);\n// ?page=../../../../etc/passwd\n// ?page=../../../../etc/shadow\n?>', contentType: 'text/plain' },
  'var/www/html/config.php': { content: '<?php\ndefine("DB_HOST", "localhost");\ndefine("DB_USER", "devportal");\ndefine("DB_PASS", "D3vP0rt@l2024!");\ndefine("DB_NAME", "devportal_db");\ndefine("ADMIN_USER", "admin");\ndefine("ADMIN_PASS", "admin123");\n?>', contentType: 'text/plain' },
  'var/log/apache2/access.log': { content: '192.168.20.10 - - [20/Mar/2026:10:15:23 -0300] "GET / HTTP/1.1" 200 1234 "-" "Mozilla/5.0"\n192.168.20.10 - - [20/Mar/2026:10:15:25 -0300] "GET /?page=home.php HTTP/1.1" 200 1234\n192.168.20.10 - - [20/Mar/2026:10:15:30 -0300] "GET /upload.php HTTP/1.1" 200 2345\n192.168.20.10 - - [20/Mar/2026:10:15:45 -0300] "GET /?page=../../../../etc/passwd HTTP/1.1" 200 1567', contentType: 'text/plain' },
  'var/log/apache2/error.log': { content: '[Wed Mar 20 10:15:23.456789 2026] [mpm_prefork:notice] [pid 1234] AH00163: Apache/2.4.52 (Debian) configured\n[Wed Mar 20 10:15:45.123456 2026] [php7:warn] [pid 1235] PHP Warning: include(): Filename cannot be empty\n[Wed Mar 20 10:16:01.234567 2026] [php7:warn] [pid 1236] PHP Warning: include(): Failed opening', contentType: 'text/plain' },
};

const PHP_PAGES: Record<string, React.ReactNode> = {
  'home.php': (
    <div>
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12 px-8 -mx-10 -mt-10 mb-8">
        <h1 className="text-3xl font-bold mb-2">Bienvenido a DevPortal</h1>
        <p className="text-blue-200">Portal de desarrollo y administración de servidores</p>
        <div className="mt-4 text-xs text-blue-300 font-mono">Apache/2.4.52 (Debian) | PHP 7.4.33</div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="font-bold text-gray-800 mb-2">📊 Estado del Servidor</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between"><span>Uptime:</span><span className="font-mono">45 días, 12:34:56</span></div>
            <div className="flex justify-between"><span>CPU:</span><span className="font-mono">23%</span></div>
            <div className="flex justify-between"><span>RAM:</span><span className="font-mono">1.2GB / 4GB</span></div>
            <div className="flex justify-between"><span>Disco:</span><span className="font-mono">45GB / 100GB</span></div>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="font-bold text-gray-800 mb-2">📁 Archivos Recientes</h3>
          <div className="space-y-2 text-sm text-gray-600 font-mono">
            <div>📄 index.php (2.3 KB)</div>
            <div>📄 config.php (890 bytes)</div>
            <div>📄 upload.php (1.1 KB)</div>
          </div>
        </div>
      </div>
      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h3 className="font-bold text-amber-800 mb-2">⚠️ Aviso de Seguridad</h3>
        <p className="text-sm text-amber-700">Este servidor está en modo de desarrollo. Algunas funciones de seguridad están deshabilitadas.</p>
      </div>
    </div>
  ),
  'about.php': (
    <div>
      <h1 className="text-2xl font-bold mb-6">Acerca de DevPortal</h1>
      <div className="prose text-gray-700">
        <p className="mb-4">DevPortal es una plataforma de desarrollo web creada por el equipo de TI.</p>
        <h3 className="font-bold mt-6 mb-2">Equipo de Desarrollo</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Carlos García - Desarrollador Backend (admin)</li>
          <li>María López - Diseñadora Frontend</li>
          <li>Pedro Martínez - Administrador de Sistemas</li>
        </ul>
        <h3 className="font-bold mt-6 mb-2">Contacto</h3>
        <p className="text-sm">Email: admin@devportal.local</p>
        <div className="mt-6 p-4 bg-gray-100 rounded font-mono text-xs text-gray-500">Versión: 2.0.4 | PHP 7.4.33</div>
      </div>
    </div>
  ),
  'contact.php': (
    <div>
      <h1 className="text-2xl font-bold mb-6">Contacto</h1>
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h3 className="font-bold mb-4">Envíanos un mensaje</h3>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label><input type="text" className="w-full px-3 py-2 border border-gray-300 rounded text-sm" placeholder="Tu nombre" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" className="w-full px-3 py-2 border border-gray-300 rounded text-sm" placeholder="tu@email.com" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label><textarea className="w-full px-3 py-2 border border-gray-300 rounded text-sm h-24" placeholder="Tu mensaje..." /></div>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Enviar</button>
          </form>
        </div>
        <div>
          <h3 className="font-bold mb-4">Información de Contacto</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center gap-2"><span>📍</span><span>Av. Corrientes 1234, CABA</span></div>
            <div className="flex items-center gap-2"><span>📞</span><span>+54 11 1234-5678</span></div>
            <div className="flex items-center gap-2"><span>✉️</span><span>admin@devportal.local</span></div>
          </div>
        </div>
      </div>
    </div>
  ),
};

export function InclusionSite({ ip, currentUrl, onNavigate, onUploadSuccess, attackerFiles = [], listeningPort }: Props) {
  const [uploadMsg, setUploadMsg] = useState('');
  const [selectedFile, setSelectedFile] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const availableFiles = useMemo(() => {
    if (attackerFiles.length > 0) return attackerFiles.map(f => ({ path: f.path, name: f.name }));
    return [
      { path: '/root/payload.php', name: 'payload.php' },
      { path: '/root/shell.php', name: 'shell.php' },
      { path: '/root/reverse.php', name: 'reverse.php' },
    ];
  }, [attackerFiles]);

  const page = useMemo(() => {
    try {
      const url = new URL(currentUrl);
      const rawPage = url.searchParams.get('page');
      if (!rawPage) return null;
      // FIX Bug #6: Remover sanitización que bloquea LFI educativo
      // Solo limpiar slashes iniciales, permitir ../ para que funcione el LFI
      const normalized = rawPage.replace(/^\/+/, '');
      return normalized || null;
    } catch { return null; }
  }, [currentUrl]);

  const handleFakeUpload = () => {
    if (!selectedFile) { setUploadMsg('❌ Por favor selecciona un archivo'); return; }
    setIsLoading(true);
    setUploadMsg('⏳ Subiendo archivo...');
    setTimeout(() => {
      const fileName = selectedFile.split('/').pop() || selectedFile;
      setUploadedFiles(prev => [...prev, fileName]);
      setUploadMsg(`✅ Archivo ${fileName} subido exitosamente a /uploads/${fileName}`);
      setIsLoading(false);
      onUploadSuccess();
      setSelectedFile('');
    }, 800);
  };

  if (currentUrl.includes('upload.php')) {
    return (
      <div className="min-h-full bg-white font-sans">
        <nav className="bg-slate-800 text-white px-6 py-3 flex items-center gap-6">
          <span className="font-bold text-lg border-r border-slate-600 pr-6">DevPortal</span>
          <button onClick={() => onNavigate(`http://${ip}/?page=home.php`)} className="text-sm hover:text-blue-300 transition-colors">🏠 Inicio</button>
          <button onClick={() => onNavigate(`http://${ip}/?page=about.php`)} className="text-sm hover:text-blue-300 transition-colors">ℹ️ Acerca de</button>
          <button onClick={() => onNavigate(`http://${ip}/?page=contact.php`)} className="text-sm hover:text-blue-300 transition-colors">✉️ Contacto</button>
          <button onClick={() => onNavigate(`http://${ip}/upload.php`)} className="text-sm text-blue-300 font-semibold">📤 Upload</button>
        </nav>
        <div className="p-8 max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">📤 Panel de Carga de Archivos</h1>
            <p className="text-sm text-gray-500">Sube scripts PHP para mantenimiento del servidor</p>
          </div>
          {uploadedFiles.length > 0 && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">✅ Archivos subidos:</h3>
              <div className="space-y-1">
                {uploadedFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm font-mono text-green-700">
                    <span>📄</span>
                    <button onClick={() => onNavigate(`http://${ip}/uploads/${f}`)} className="hover:underline text-blue-600">/uploads/{f}</button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 bg-gray-50">
            <div className="space-y-5">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="font-semibold text-blue-800 mb-2">📋 Instrucciones:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
                  <li>Lee el payload: <code className="bg-blue-100 px-1 rounded">cat /root/payload.php</code></li>
                  <li>Selecciona el archivo abajo</li>
                  <li>Haz clic en "Subir Archivo"</li>
                  <li>Accede via LFI: <code className="bg-blue-100 px-1 rounded">?page=uploads/payload.php</code></li>
                </ol>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Seleccionar archivo desde Kali:</label>
                <select value={selectedFile} onChange={(e) => setSelectedFile(e.target.value)} disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 text-sm">
                  <option value="">-- Elige un archivo --</option>
                  {availableFiles.map(file => (<option key={file.path} value={file.path}>{file.name}</option>))}
                </select>
              </div>
              <button onClick={handleFakeUpload} disabled={isLoading || !selectedFile}
                className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm">
                {isLoading ? '⏳ Subiendo...' : '📤 Subir Archivo'}
              </button>
              {uploadMsg && (
                <div className={`p-4 rounded-lg font-mono text-sm ${uploadMsg.includes('❌') ? 'bg-red-50 text-red-700 border border-red-200' : uploadMsg.includes('⏳') ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                  {uploadMsg}
                </div>
              )}
            </div>
          </div>
          <div className="mt-6 text-xs text-gray-400 font-mono">
            <div>Server: Apache/2.4.52 (Debian)</div>
            <div>X-Powered-By: PHP/7.4.33</div>
          </div>
        </div>
      </div>
    );
  }

  const phpPage = page && PHP_PAGES[page];
  if (phpPage) {
    return (
      <div className="min-h-full bg-white font-sans">
        <nav className="bg-slate-800 text-white px-6 py-3 flex items-center gap-6">
          <span className="font-bold text-lg border-r border-slate-600 pr-6">DevPortal</span>
          <button onClick={() => onNavigate(`http://${ip}/?page=home.php`)} className={`text-sm transition-colors ${page === 'home.php' ? 'text-blue-300 font-semibold' : 'hover:text-blue-300'}`}>🏠 Inicio</button>
          <button onClick={() => onNavigate(`http://${ip}/?page=about.php`)} className={`text-sm transition-colors ${page === 'about.php' ? 'text-blue-300 font-semibold' : 'hover:text-blue-300'}`}>ℹ️ Acerca de</button>
          <button onClick={() => onNavigate(`http://${ip}/?page=contact.php`)} className={`text-sm transition-colors ${page === 'contact.php' ? 'text-blue-300 font-semibold' : 'hover:text-blue-300'}`}>✉️ Contacto</button>
          <button onClick={() => onNavigate(`http://${ip}/upload.php`)} className="text-sm hover:text-blue-300 transition-colors">📤 Upload</button>
        </nav>
        <div className="p-10 max-w-4xl mx-auto">{phpPage}</div>
      </div>
    );
  }

  if (page) {
    // Normalizar path para buscar en SERVER_FILES: remover ../ y ./ para encontrar el archivo
    const normalizedPage = page.replace(/^(\.\.\/)*/, '').replace(/^\.\//, '');
    const serverFile = SERVER_FILES[normalizedPage];
    if (serverFile) {
      return (
        <div className="min-h-full bg-gray-900 text-green-400 font-mono text-sm">
          <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <span className="text-gray-400 text-xs ml-2">📄 {normalizedPage}</span>
            </div>
            <button onClick={() => onNavigate(`http://${ip}/?page=home.php`)} className="text-xs text-gray-500 hover:text-gray-300">← Volver al portal</button>
          </div>
          <div className="p-6">
            <div className="mb-4 text-gray-500 text-xs">
              <span className="text-yellow-400">⚠️ LFI DETECTADO</span> — Leyendo: <span className="text-green-400">/{normalizedPage}</span>
            </div>
            <pre className="whitespace-pre-wrap leading-relaxed text-green-300">{serverFile.content}</pre>
          </div>
          <div className="border-t border-gray-800 px-4 py-2 text-xs text-gray-600">
            <span>Content-Type: {serverFile.contentType}</span>
            <span className="mx-2">|</span>
            <span>Size: {serverFile.content.length} bytes</span>
            <span className="mx-2">|</span>
            <span>Server: Apache/2.4.52 (Debian)</span>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-full bg-white font-sans">
        <nav className="bg-slate-800 text-white px-6 py-3 flex items-center gap-6">
          <span className="font-bold text-lg">DevPortal</span>
          <button onClick={() => onNavigate(`http://${ip}/?page=home.php`)} className="text-sm hover:text-blue-300">🏠 Inicio</button>
        </nav>
        <div className="p-10 max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-800 mb-2">❌ Error 404 - Archivo no encontrado</h2>
            <p className="text-sm text-red-700 mb-4">El archivo <code className="bg-red-100 px-1 rounded">{normalizedPage}</code> no existe.</p>
            <div className="bg-gray-900 text-green-400 font-mono text-xs p-4 rounded">
              <div>PHP Warning: include({normalizedPage}): failed to open stream</div>
              <div>in /var/www/html/index.php on line 5</div>
            </div>
          </div>
          <div className="mt-6 text-sm text-gray-600">
            <p className="font-semibold mb-2">💡 Sugerencias:</p>
            <ul className="list-disc list-inside space-y-1 font-mono text-xs">
              <li>?page=../../../../etc/passwd</li>
              <li>?page=../../../../etc/shadow</li>
              <li>?page=/proc/self/environ</li>
              <li>?page=../../../../var/www/html/config.php</li>
              <li>?page=uploads/payload.php (después de subir)</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-white font-sans">
      <nav className="bg-slate-800 text-white px-6 py-3 flex items-center gap-6">
        <span className="font-bold text-lg border-r border-slate-600 pr-6">DevPortal</span>
        <button onClick={() => onNavigate(`http://${ip}/?page=home.php`)} className="text-sm hover:text-blue-300 transition-colors">🏠 Inicio</button>
        <button onClick={() => onNavigate(`http://${ip}/?page=about.php`)} className="text-sm hover:text-blue-300 transition-colors">ℹ️ Acerca de</button>
        <button onClick={() => onNavigate(`http://${ip}/?page=contact.php`)} className="text-sm hover:text-blue-300 transition-colors">✉️ Contacto</button>
        <button onClick={() => onNavigate(`http://${ip}/upload.php`)} className="text-sm hover:text-blue-300 transition-colors">📤 Upload</button>
      </nav>
      <div className="p-10 max-w-4xl mx-auto">{PHP_PAGES['home.php']}</div>
    </div>
  );
}