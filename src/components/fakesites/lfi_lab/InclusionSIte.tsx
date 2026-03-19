import React, { useState } from 'react';

interface Props {
  ip: string;
  currentUrl: string;
  onNavigate: (url: string) => void;
  onUploadSuccess: () => void;
}

export function InclusionSite({ ip, currentUrl, onNavigate, onUploadSuccess }: Props) {
  const [uploadMsg, setUploadMsg] = useState('');
  const urlParams = new URLSearchParams(currentUrl.split('?')[1]);
  const page = urlParams.get('page');

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.php')) {
      setUploadMsg(`Archivo ${file.name} subido a /uploads/${file.name}`);
      onUploadSuccess();
    }
  };

  if (page?.includes('etc/passwd')) {
    return <div className="bg-black text-green-500 font-mono p-4 h-full">root:x:0:0:root:/root:/bin/bash<br/>www-data:x:33:33:www-data:/var/www</div>;
  }

  return (
    <div className="min-h-full bg-white font-sans">
      <nav className="bg-slate-800 text-white p-4 flex gap-6">
        <span className="font-bold border-r pr-6">DevPortal v2.0</span>
        <button onClick={() => onNavigate(`http://${ip}/?page=home.php`)} className="text-sm hover:text-blue-400">Inicio</button>
        <button onClick={() => onNavigate(`http://${ip}/upload.php`)} className="text-sm hover:text-blue-400">Mantenimiento</button>
      </nav>
      <div className="p-10 max-w-2xl mx-auto">
        {currentUrl.includes('upload.php') ? (
          <div className="border-2 border-dashed border-slate-200 p-10 text-center rounded-xl">
            <h2 className="text-xl font-bold mb-4">Subir Script PHP</h2>
            <input type="file" onChange={handleUpload} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200" />
            {uploadMsg && <p className="mt-4 text-green-600 font-mono text-sm">{uploadMsg}</p>}
          </div>
        ) : (
          <div>
            <h1 className="text-3xl font-bold mb-4">Panel de Control de Archivos</h1>
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 text-amber-800 text-sm font-mono">
              DEBUG: Cargando componente: {page || 'home.php'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
