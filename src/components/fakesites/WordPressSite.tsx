// ── components/fakesites/WordPressSite.tsx ─────────────────────────
import React, { useMemo } from 'react';
import { WPIndex }     from './wordpress/wp01/Index';
import { WPLogin }     from './wordpress/wp01/Login';
import { WPDashboard } from './wordpress/wp01/Dashboard';
import { WPUploads }   from './wordpress/wp01/Uploads';
import { WPConfigBak } from './wordpress/wp01/ConfigBak';
import type { Machine } from '../../types';

const parseWPConfig = (content: string) => {
  const lines = content.split('\n');
  let user = 'admin';
  let pass = 'P@ssw0rd123!';
  lines.forEach(line => {
    const cleanLine = line.trim();
    if (cleanLine.startsWith('#') || !cleanLine.includes('=')) return;
    const parts = cleanLine.split('=');
    const key = parts[0].trim().toUpperCase();
    const value = parts[1].trim().replace(/['"]/g, '');
    if (key.includes('USER') || key.includes('DB_USER')) user = value;
    if (key.includes('PASS') || key.includes('DB_PASS')) pass = value;
  });
  return { user, pass };
};

interface WordPressSiteProps {
  machine: Machine;
  currentUrl: string;
  browserIsLoggedIn: boolean;
  onNavigate: (url: string) => void;
  onLoginSuccess: (missionId: number) => void;
  onLogout: () => void;
  onCredentialsFound: (machineId: string, user: string, pass: string, file: string, service: string) => void;
  onVerifyCredentials: (machineId: string, service: string) => void;
  onMissionComplete: (id: number) => void;
}

export function WordPressSite({
  machine,
  currentUrl,
  browserIsLoggedIn,
  onNavigate,
  onLoginSuccess,
  onLogout,
  onCredentialsFound,
  onVerifyCredentials,
  onMissionComplete,
}: WordPressSiteProps) {
  const ip = machine.machine_info.ip;
  const path = currentUrl.replace(`http://${ip}`, '').split('?')[0] || '/';
  const level = machine.discovery_level ?? 0;

  const configFile = machine.files?.find(f => f.path === '/uploads/config.bak');
  const dynamicCreds = configFile ? parseWPConfig(configFile.content) : null;

  const doLogin = () => {
    onLoginSuccess(6);
    onVerifyCredentials(machine.id, 'wp-admin');
    onNavigate(`http://${ip}/wp-admin/dashboard`);
  };

  if (path === '/' || path === '') {
    return <WPIndex ip={ip} onNavigate={onNavigate} />;
  }

  if (path === '/wp-admin' || path === '/wp-admin/dashboard' || path === '/dashboard' || path === '/wp-login.php') {
    if (level < 2) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-10 text-center">
          ⏳ Realizá un escaneo nmap -sV {ip} primero.
        </div>
      );
    }
    if (browserIsLoggedIn) {
      return (
        <WPDashboard
          ip={ip}
          onNavigate={onNavigate}
          onLogout={onLogout}
          onCredentialsFound={(u, p, f, s) => onCredentialsFound(machine.id, u, p, f || '/wp-admin/wp-config.php', s || 'ssh')}
        />
      );
    }
    if (path.includes('dashboard')) {
      setTimeout(() => onNavigate(`http://${ip}/wp-admin`), 0);
      return null;
    }
    return (
      <WPLogin
        ip={ip}
        credentials={dynamicCreds}
        onNavigate={onNavigate}
        onLoginSuccess={doLogin}
      />
    );
  }

  if (path === '/uploads' || path === '/uploads/config.bak') {
    if (level < 3) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-10 text-center">
          🔒 Directorio no enumerado. Usá gobuster.
        </div>
      );
    }
    if (path === '/uploads') {
      return (
        <WPUploads
          ip={ip}
          onNavigate={onNavigate}
          onCredentialsFound={(u, p, f, s) => onCredentialsFound(machine.id, u, p, f || '/uploads/config.bak', s || 'wp-admin')}
          onMissionComplete={onMissionComplete}
        />
      );
    }
    return <WPConfigBak ip={ip} onNavigate={onNavigate} machine={machine} />;
  }

  return null;
}
