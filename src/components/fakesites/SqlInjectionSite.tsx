// ── components/fakesites/SqlInjectionSite.tsx ───────────────────────
import React from 'react';
import { VulnerableLogin } from './sql_lab/VulnerableLogin';
import type { Machine } from '../../types';

interface SqlInjectionSiteProps {
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

export function SqlInjectionSite({
  machine,
  currentUrl,
  onNavigate,
  onLoginSuccess,
  onLogout,
  onCredentialsFound,
  onVerifyCredentials,
  onMissionComplete,
}: SqlInjectionSiteProps) {
  const ip = machine.machine_info.ip;
  const path = currentUrl.replace(`http://${ip}`, '').split('?')[0] || '/';

  // Handle different routes
  if (path === '/login') {
    return (
      <VulnerableLogin
        ip={ip}
        onLoginSuccess={onLoginSuccess}
        onMissionComplete={onMissionComplete}
      />
    );
  }

  if (path === '/admin') {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <strong>403 Forbidden:</strong> You don't have permission to access this page.
              <br />
              Please login first.
            </div>
            <button
              onClick={() => onNavigate(`http://${ip}/login`)}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (path === '/backup') {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Backup Directory</h1>
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
              <strong>Warning:</strong> This directory contains sensitive backup files.
            </div>
            <div className="space-y-2">
              <div className="border rounded p-3 bg-gray-50">
                <span className="text-sm font-mono">database_dump.sql</span>
                <span className="ml-2 text-xs text-gray-500">(2.5 MB)</span>
              </div>
              <div className="border rounded p-3 bg-gray-50">
                <span className="text-sm font-mono">config_backup.tar.gz</span>
                <span className="ml-2 text-xs text-gray-500">(1.1 MB)</span>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p><strong>Next Step:</strong> Access FTP to download these files.</p>
              <p><code>ftp {ip}</code></p>
              <p>Username: <code>ftpuser</code></p>
              <p>Password: <code>ftp_dump_2024</code></p>
            </div>
            <button
              onClick={() => onNavigate(`http://${ip}/`)}
              className="mt-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default home page
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Secure Web Application</h1>
            <p className="text-gray-600">Welcome to our secure login portal</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-6 bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">User Login</h2>
              <p className="text-gray-600 mb-4">Access your secure account</p>
              <button
                onClick={() => onNavigate(`http://${ip}/login`)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                Login Now
              </button>
            </div>

            <div className="border rounded-lg p-6 bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Admin Panel</h2>
              <p className="text-gray-600 mb-4">Administrator access (restricted)</p>
              <button
                onClick={() => onNavigate(`http://${ip}/admin`)}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
              >
                Admin Access
              </button>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 className="font-semibold text-blue-800 mb-2">System Information</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Server:</strong> Apache/2.4.29</p>
              <p><strong>Platform:</strong> PHP 7.2</p>
              <p><strong>Database:</strong> MySQL 5.7</p>
              <p><strong>Status:</strong> <span className="text-green-600 font-semibold">Online</span></p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => onNavigate(`http://${ip}/backup`)}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              View Backup Directory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
