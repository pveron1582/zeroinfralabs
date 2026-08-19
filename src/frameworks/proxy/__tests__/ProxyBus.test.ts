// ── frameworks/proxy/__tests__/ProxyBus.test.ts ────────────────────
// ProxyBus: pub/sub del tráfico navegador → Burp Proxy (patrón ShellManager).

import { describe, it, expect, afterEach, vi } from 'vitest';
import { subscribeProxy, publishProxyRequest, hasProxyListener } from '../ProxyBus';
import type { HttpRequestData } from '../../../types';

const unsubs: Array<() => void> = [];

afterEach(() => {
  unsubs.splice(0).forEach(u => u());
});

function req(url = 'http://192.168.1.10/login'): HttpRequestData {
  return { method: 'GET', url, headers: { Host: '192.168.1.10' }, body: '' };
}

describe('frameworks/proxy — ProxyBus', () => {
  it('debe notificar a los suscriptores al publicar', () => {
    const handler = vi.fn();
    unsubs.push(subscribeProxy(handler));

    publishProxyRequest(req('http://192.168.1.10/'));
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0]).toEqual(req('http://192.168.1.10/'));
  });

  it('debe notificar a todos los suscriptores (multicast)', () => {
    const a = vi.fn();
    const b = vi.fn();
    unsubs.push(subscribeProxy(a), subscribeProxy(b));

    publishProxyRequest(req());
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });

  it('debe dejar de notificar tras desuscribirse', () => {
    const handler = vi.fn();
    const unsub = subscribeProxy(handler);
    publishProxyRequest(req());
    expect(handler).toHaveBeenCalledTimes(1);

    unsub();
    publishProxyRequest(req());
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('publish sin suscriptores debe ser un no-op', () => {
    expect(hasProxyListener()).toBe(false);
    expect(() => publishProxyRequest(req())).not.toThrow();
  });

  it('hasProxyListener debe reflejar la presencia de suscriptores', () => {
    expect(hasProxyListener()).toBe(false);
    unsubs.push(subscribeProxy(() => {}));
    expect(hasProxyListener()).toBe(true);
  });
});