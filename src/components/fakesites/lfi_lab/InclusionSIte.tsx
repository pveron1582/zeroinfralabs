import React, { useState, useMemo, useEffect } from 'react';

// Props del componente: IP del servidor, URL actual, callbacks de navegación y subida
interface Props {
  ip: string; 
  currentUrl: string; 
  onNavigate: (url: string) => void;
  onFileUpload: (fileName: string) => void; 
  attackerFiles?: Array<{ path: string; name: string }>;
  listeningPort?: number;
  victimFiles?: Array<{ path: string; content: string; type: string }>;
}

// Archivos del servidor que se pueden leer mediante LFI
const SERVER_FILES: Record<string, { content: string; contentType: string }> = {
  'etc/passwd': { content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nbin:x:2:2:bin:/bin:/usr/sbin/nologin\nsys:x:3:3:sys:/dev:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nadmin:x:1000:1000:admin,,,:/home/admin:/bin/bash', contentType: 'text/plain' },
  'etc/shadow': { content: 'root:$6$rounds=656000$abcdefghijklmnop$1234567890abcdefghijklmnop/1234567890123456:18000:0:99999:7:::\ndaemon:*:18000:0:99999:7:::\nwww-data:*:18000:0:99999:7:::', contentType: 'text/plain' },
  'etc/hosts': { content: '127.0.0.1 localhost\n127.0.1.1 dev-portal-backup\n::1 localhost ip6-localhost ip6-loopback', contentType: 'text/plain' },
  'etc/hostname': { content: 'dev-portal-backup', contentType: 'text/plain' },
  'etc/apache2/apache2.conf': { content: '# Apache2 Configuration File\nServerRoot "/etc/apache2"\nUser ${APACHE_RUN_USER}\nGroup ${APACHE_RUN_GROUP}\nErrorLog ${APACHE_LOG_DIR}/error.log\n<Directory /var/www/>\n  Options Indexes FollowSymLinks\n  AllowOverride All\n  Require all granted\n</Directory>', contentType: 'text/plain' },
  'proc/self/environ': { content: 'APACHE_RUN_DIR=/var/run/apache2\nAPACHE_RUN_USER=www-data\nAPACHE_RUN_GROUP=www-data\nAPACHE_LOG_DIR=/var/log/apache2\nPATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\nHOME=/var/www\nSERVER_SOFTWARE=Apache/2.4.52 (Debian)\nSERVER_NAME=dev-portal-backup\nSERVER_ADDR=192.168.20.11\nSERVER_PORT=80\nREMOTE_ADDR=192.168.20.10\nDOCUMENT_ROOT=/var/www/html\nQUERY_STRING=page=../../../../etc/passwd', contentType: 'text/plain' },
  'var/www/html/index.php': { content: '<?php\n$page = isset($_GET["page"]) ? $_GET["page"] : "home.php";\ninclude($page);\n?>', contentType: 'text/plain' },
  'var/www/html/config.php': { content: '<?php\ndefine("DB_HOST", "localhost");\ndefine("DB_USER", "devportal");\ndefine("DB_PASS", "D3vP0rt@l2024!");\ndefine("DB_NAME", "devportal_db");\ndefine("ADMIN_USER", "admin");\ndefine("ADMIN_PASS", "admin123");\n?>', contentType: 'text/plain' },
  'var/log/apache2/access.log': { content: '192.168.20.10 - - [20/Mar/2026:10:15:23 -0300] "GET / HTTP/1.1" 200 1234 "-" "Mozilla/5.0"\n192.168.20.10 - - [20/Mar/2026:10:15:25 -0300] "GET /?page=home.php HTTP/1.1" 200 1234\n192.168.20.10 - - [20/Mar/2026:10:15:30 -0300] "GET /upload.php HTTP/1.1" 200 2345\n192.168.20.10 - - [20/Mar/2026:10:15:45 -0300] "GET /?page=../../../../etc/passwd HTTP/1.1" 200 1567', contentType: 'text/plain' },
  'var/log/apache2/error.log': { content: '[Wed Mar 20 10:15:23.456789 2026] [mpm_prefork:notice] [pid 1234] AH00163: Apache/2.4.52 (Debian) configured\n[Wed Mar 20 10:15:45.123456 2026] [php7:warn] [pid 1235] PHP Warning: include(): Filename cannot be empty\n[Wed Mar 20 10:16:01.234567 2026] [php7:warn] [pid 1236] PHP Warning: include(): Failed opening', contentType: 'text/plain' },
};

export function InclusionSite({ ip, currentUrl, onNavigate, onFileUpload, attackerFiles = [], listeningPort, victimFiles = [] }: Props) {
  const [selectedFile, setSelectedFile] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');

  // Páginas PHP simuladas
  const PHP_PAGES: Record<string, React.ReactNode> = useMemo(() => ({
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
              <div className="flex justify-between"><span>Uptime:</span><span className="font-mono">45 días</span></div>
              <div className="flex justify-between"><span>CPU:</span><span className="font-mono">23%</span></div>
              <div className="flex justify-between"><span>RAM:</span><span className="font-mono">1.2GB/4GB</span></div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-2">📁 Mantenimiento</h3>
            <p className="text-sm text-gray-600 mb-4">Usa el panel de carga para subir utilidades de diagnóstico.</p>
            <button onClick={() => onNavigate(`http://${ip}/upload.php`)} className="px-3 py-1 bg-blue-600 text-white rounded text-xs transition-colors hover:bg-blue-700">Ir a Upload</button>
          </div>
        </div>
      </div>
    ),
    'about.php': (
      <div>
        <h1 className="text-2xl font-bold mb-6">Acerca de DevPortal</h1>
        <div className="prose text-gray-700 max-w-none">
          <p className="mb-4">DevPortal es una plataforma de desarrollo web creada por el equipo de TI para la gestión de respaldos internos.</p>
          <h3 className="font-bold mt-6 mb-2">Equipo de Desarrollo</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Carlos García - Desarrollador Backend (admin)</li>
            <li>María López - Diseñadora Frontend</li>
            <li>Pedro Martínez - Administrador de Sistemas</li>
          </ul>
          <h3 className="font-bold mt-6 mb-2">Contacto Administrativo</h3>
          <p className="text-sm">Email: admin@devportal.local</p>
          <div className="mt-6 p-4 bg-gray-100 rounded font-mono text-xs text-gray-500">Versión: 2.0.4 | PHP 7.4.33 (Internal Build)</div>
        </div>
      </div>
    ),
    'contact.php': (
      <div>
        <h1 className="text-2xl font-bold mb-6">Contacto Directo</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-700">
          <div>
            <h3 className="font-bold mb-4">Envíanos un reporte</h3>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div><label className="block text-xs font-bold uppercase text-gray-500 mb-1">Nombre</label><input type="text" className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:border-blue-500 outline-none" placeholder="Tu nombre" /></div>
              <div><label className="block text-xs font-bold uppercase text-gray-500 mb-1">Email</label><input type="email" className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:border-blue-500 outline-none" placeholder="tu@email.com" /></div>
              <div><label className="block text-xs font-bold uppercase text-gray-500 mb-1">Mensaje</label><textarea className="w-full px-3 py-2 border border-gray-200 rounded text-sm h-24 focus:border-blue-500 outline-none" placeholder="Tu reporte..." /></div>
              <button type="submit" className="px-5 py-2 bg-slate-800 text-white rounded text-sm font-semibold hover:bg-slate-700 transition-colors">Enviar Reporte</button>
            </form>
          </div>
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h3 className="font-bold mb-4">Soporte Técnico</h3>
            <div className="space-y-4 text-sm text-gray-600">
              <div className="flex items-start gap-3"><span className="text-blue-500">📍</span><span>Sede Central: Av. Corrientes 1234, CABA</span></div>
              <div className="flex items-start gap-3"><span className="text-blue-500">📞</span><span>Interno: +54 11 1234-5678 (Ext 404)</span></div>
              <div className="flex items-start gap-3"><span className="text-blue-500">✉️</span><span>helpdesk@devportal.local</span></div>
              <div className="mt-6 pt-4 border-t border-gray-200 text-xs italic">
                Horario de atención: Lunes a Viernes de 09:00 a 18:00 hs.
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  }), [ip, onNavigate]);

  const availableFiles = useMemo(() => {
    if (attackerFiles && attackerFiles.length > 0) {
      return attackerFiles
        .filter(f => f.path.startsWith('/root/'))
        .map(f => ({ path: f.path, name: f.path.split('/').pop() || f.name }));
    }
    return [{ path: '/root/payload.php', name: 'payload.php' }];
  }, [attackerFiles]);

  const page = useMemo(() => {
    try {
      const url = new URL(currentUrl);
      const rawPage = url.searchParams.get('page');
      return rawPage ? rawPage.replace(/^\/+/, '') : null;
    } catch { return null; }
  }, [currentUrl]);

  const handleFakeUpload = () => {
    if (!selectedFile) { setUploadMsg('❌ Selecciona un archivo'); return; }
    setIsLoading(true);
    setUploadMsg('⏳ Subiendo...');
    setTimeout(() => {
      const fileName = selectedFile.split('/').pop() || selectedFile;
      setUploadMsg(`✅ Archivo ${fileName} subido a /uploads/`);
      setIsLoading(false);
      onFileUpload(fileName);
      setSelectedFile('');
    }, 800);
  };

  // Enrutamiento
  const isUploadPath = currentUrl && (currentUrl.includes('/upload.php') || currentUrl.endsWith('/upload'));
  const isFilesPath = currentUrl && (currentUrl.includes('/files.php') || (currentUrl.includes('/files') && !currentUrl.includes('?page=')));

  // RCE Detection
  useEffect(() => {
    // Only trigger RCE if the user explicitly navigates to the payload
    // and the listening port is already established. 
    // We intentionally omit listeningPort from deps to avoid triggering retroactively.
    if (page && page.includes('payload.php') && listeningPort === 4444) {
      onFileUpload('CHECKPOINT_RCE');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, onFileUpload]);

  const Nav = ({ active }: { active?: string }) => (
    <nav className="bg-slate-800 text-white px-6 py-3 flex items-center gap-6">
      <span className="font-bold text-lg border-r border-slate-600 pr-6">DevPortal</span>
      <button onClick={() => onNavigate(`http://${ip}/?page=home.php`)} className={`text-sm ${active === 'home' ? 'text-blue-300 font-bold' : 'hover:text-blue-300'}`}>🏠 Inicio</button>
      <button onClick={() => onNavigate(`http://${ip || ''}/?page=about.php`)} className={`text-sm ${active === 'about' ? 'text-blue-300 font-bold' : 'hover:text-blue-300'}`}>ℹ️ Acerca de</button>
      <button onClick={() => onNavigate(`http://${ip || ''}/?page=contact.php`)} className={`text-sm ${active === 'contact' ? 'text-blue-300 font-bold' : 'hover:text-blue-300'}`}>✉️ Contacto</button>
      <button onClick={() => onNavigate(`http://${ip}/upload.php`)} className={`text-sm ${active === 'upload' ? 'text-blue-300 font-bold' : 'hover:text-blue-300'}`}>📤 Upload</button>
      <button onClick={() => onNavigate(`http://${ip}/files`)} className={`text-sm ${active === 'files' ? 'text-blue-300 font-bold' : 'hover:text-blue-300'}`}>📁 Files</button>
    </nav>
  );

  if (isUploadPath) {
    return (
      <div className="min-h-full bg-white font-sans text-gray-800">
        <Nav active="upload" />
        <div className="p-8 max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">📤 Carga de Scripts de Mantenimiento</h1>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 text-sm text-blue-800 rounded">
            Sube herramientas desde tu máquina Kali para realizar diagnósticos locales en el servidor.
          </div>
          <div className="border border-gray-200 rounded-xl p-6 bg-gray-50 shadow-sm">
            <label className="block text-sm font-semibold mb-2">Archivo en Kali Linux (/root/):</label>
            <select value={selectedFile} onChange={(e) => setSelectedFile(e.target.value)} 
              className="w-full p-2.5 mb-4 border border-gray-300 rounded bg-white text-sm outline-none focus:border-blue-500">
              <option value="">-- Seleccionar archivo --</option>
              {availableFiles.map(f => <option key={f.path} value={f.path}>{f.name}</option>)}
            </select>
            <button onClick={handleFakeUpload} disabled={isLoading || !selectedFile}
              className="w-full py-2.5 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 disabled:bg-gray-400 transition-all">
              {isLoading ? 'Subiendo...' : 'Subir Archivo'}
            </button>
            {uploadMsg && (
              <div className={`mt-4 p-3 rounded text-xs font-mono border ${uploadMsg.includes('✅') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                {uploadMsg}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isFilesPath) {
    const uploadedOnServer = victimFiles.filter(f => f.path.startsWith('/var/www/html/uploads/'));
    return (
      <div className="min-h-full bg-white font-sans text-gray-800">
        <Nav active="files" />
        <div className="p-10 max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
             Archivos en /var/www/html/uploads/
          </h1>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 font-bold text-gray-600">Nombre</th>
                  <th className="p-4 font-bold text-gray-600">Tamaño</th>
                  <th className="p-4 font-bold text-gray-600">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {uploadedOnServer.length === 0 ? (
                  <tr><td colSpan={3} className="p-10 text-center text-gray-400 italic">No hay archivos en este directorio</td></tr>
                ) : (
                  uploadedOnServer.map((f, i) => {
                    const name = f.path.split('/').pop() || '';
                    const size = f.content.length > 1024 ? (f.content.length / 1024).toFixed(1) + ' KB' : f.content.length + ' B';
                    const date = new Date().toLocaleDateString('es-AR');
                    return (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <button onClick={() => onNavigate(`http://${ip}/?page=files/${name}`)}
                            className="text-blue-600 font-bold hover:underline flex items-center gap-2">
                            <span>📄</span>
                            {name}
                          </button>
                        </td>
                        <td className="p-4 text-gray-500 font-mono text-xs">{size}</td>
                        <td className="p-4 text-gray-500 font-mono text-xs">{date}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <p className="mt-8 p-4 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-800">
            <strong>Tip:</strong> Haz clic en el nombre de un archivo para ejecutarlo mediante el motor PHP. 
            Si es un script de reverse shell y tienes un listener en Kali, se establecerá la conexión.
          </p>
        </div>
      </div>
    );
  }

  const activeSection = page && page.includes('about') ? 'about' : page && page.includes('contact') ? 'contact' : 'home';
  const phpPage = page && PHP_PAGES[page];
  
  if (phpPage) {
    return (
      <div className="min-h-full bg-white font-sans text-gray-800">
        <Nav active={activeSection} />
        <div className="p-10 max-w-4xl mx-auto">{phpPage}</div>
      </div>
    );
  }

  if (page) {
    const normalized = page.replace(/^(\.\.\/)*/, '').replace(/^\.\//, '');
    const serverFile = SERVER_FILES[normalized];
    if (serverFile) {
      return (
        <div className="min-h-screen bg-gray-950 text-emerald-400 font-mono p-6 overflow-auto">
          <div className="mb-4 text-xs border-b border-emerald-900/50 pb-2 flex justify-between items-center">
            <span className="bg-emerald-950 px-2 py-1 rounded">LFI OUTPUT: /{normalized}</span>
            <button onClick={() => onNavigate(`http://${ip}/?page=home.php`)} className="bg-emerald-900/30 px-3 py-1 rounded hover:bg-emerald-900/50 transition-colors">[ CERRAR ]</button>
          </div>
          <pre className="text-sm leading-relaxed whitespace-pre-wrap">{serverFile.content}</pre>
        </div>
      );
    }
    // Fallback if page is not found but was requested via ?page=
    return (
      <div className="min-h-full bg-white font-sans text-gray-800">
        <Nav />
        <div className="p-10 max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-800 mb-2 font-mono">❌ 404 NOT FOUND</h2>
            <p className="text-sm text-red-700 mb-4 font-mono">File: {normalized}</p>
            <div className="bg-gray-900 text-green-400 font-mono text-xs p-4 rounded shadow-inner">
              <div>PHP Warning: include({normalized}): failed to open stream</div>
              <div>in /var/www/html/index.php on line 5</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-white font-sans text-gray-800">
      <Nav active="home" />
      <div className="p-10 max-w-4xl mx-auto">{PHP_PAGES['home.php']}</div>
    </div>
  );
}