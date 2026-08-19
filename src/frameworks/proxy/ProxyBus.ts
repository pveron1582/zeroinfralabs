// ── frameworks/proxy/ProxyBus.ts ───────────────────────────────────
// Bus de tráfico navegador → Burp Proxy (patrón pub/sub a nivel módulo,
// como ShellManager). El FakeBrowser publica cada navegación HTTP y BurpSuite
// se suscribe mientras está montado. Si no hay ningún proxy abierto, publish
// es un no-op (el tráfico llega directo, igual que sin proxy).

import type { HttpRequestData } from '../../types';

type ProxyListener = (req: HttpRequestData) => void;

let listeners: ProxyListener[] = [];

// Devuelve una función para desuscribirse (usar en el cleanup del useEffect).
export function subscribeProxy(listener: ProxyListener): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
}

export function publishProxyRequest(req: HttpRequestData): void {
  listeners.forEach(l => l(req));
}

// Expuesto para tests y para saber si hay un proxy escuchando.
export function hasProxyListener(): boolean {
  return listeners.length > 0;
}