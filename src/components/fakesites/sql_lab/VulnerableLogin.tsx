// ── components/fakesites/sql_lab/VulnerableLogin.tsx ─────────────────
import React, { useState } from 'react';

interface VulnerableLoginProps {
  ip: string;
  onLoginSuccess: (missionId: number) => void;
  onMissionComplete: (id: number) => void;
}

export function VulnerableLogin({ ip, onLoginSuccess, onMissionComplete }: VulnerableLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Checking credentials...');

    // Simulate SQL injection vulnerability
    if (username.includes("' OR '1'='1") || username.includes("' OR 1=1--")) {
      setTimeout(() => {
        setMessage('Login successful! Welcome admin.');
        setIsLoggedIn(true);
        onLoginSuccess(3); // Mission 3: SQL Injection Found
        onMissionComplete(3);
      }, 1000);
    } else if (username === 'admin' && password === 'admin123') {
      setTimeout(() => {
        setMessage('Login successful! Welcome admin.');
        setIsLoggedIn(true);
      }, 1000);
    } else {
      setTimeout(() => {
        setMessage('Invalid credentials. Access denied.');
      }, 1000);
    }
  };

  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Admin Dashboard</h1>
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <strong>Success!</strong> SQL injection vulnerability exploited.
            </div>
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
              <strong>Next Step:</strong> Use UNION-based SQL injection to extract database information.
              <br />
              <code className="text-sm">curl -X POST http://{ip}/login -d "username=' UNION SELECT table_name FROM information_schema.tables--&password=x"</code>
            </div>
            <button
              onClick={() => {
                setIsLoggedIn(false);
                setUsername('');
                setPassword('');
                setMessage('');
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Secure Login</h1>
            <p className="text-gray-600">Please enter your credentials</p>
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded text-sm ${
              message.includes('successful') 
                ? 'bg-green-100 border border-green-400 text-green-700'
                : 'bg-red-100 border border-red-400 text-red-700'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter username"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Login
            </button>
          </form>

          <div className="mt-6 text-xs text-gray-500 text-center">
            <p>Hint: Try SQL injection payloads like ' OR '1'='1</p>
          </div>
        </div>
      </div>
    </div>
  );
}
