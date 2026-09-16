// ── frameworks/python/stdlib.ts ─────────────────────────────────────
// Módulos stdlib simulados. socket es el importante: connect_ex/
// connect/recv consultan el callback `connect` que el comando python3
// construye con effectivePortState() y los banners reales del lab.
// Cada intento queda registrado en state.connections para la metadata
// scanResults del CommandResponse.

import type { PyValue, PySocket } from './values';
import { pyRepr, isPyObject } from './values';
import { PyError, typeError } from './errors';
import type { RunCtx, ConnectResult } from './context';

export function getModule(name: string, ctx: RunCtx, line: number): PyValue {
  switch (name) {
    case 'sys': return makeSys(ctx);
    case 'socket': return makeSocket();
    case 'time': return makeTime();
    default:
      throw new PyError('ModuleNotFoundError', `No module named '${name}' (el simulador soporta: sys, socket, time)`, line);
  }
}

const moduleOf = (name: string, attrs: Record<string, PyValue>): PyValue =>
  ({ kind: 'module', name, attrs: new Map(Object.entries(attrs)) });

function makeSys(ctx: RunCtx): PyValue {
  return moduleOf('sys', {
    argv: { kind: 'list', items: [...ctx.opts.argv] },
    platform: 'linux',
    version: '3.11.8 (simulador)',
    executable: '/usr/bin/python3',
  });
}

function makeTime(): PyValue {
  return moduleOf('time', {
    sleep: { kind: 'native', name: 'sleep', call: () => null },
    time: { kind: 'native', name: 'time', call: () => Date.now() / 1000 },
  });
}

function makeSocket(): PyValue {
  return moduleOf('socket', {
    socket: { kind: 'native', name: 'socket', call: () => newSocketObj() },
    AF_INET: 2,
    SOCK_STREAM: 1,
  });
}

function newSocketObj(): PySocket {
  return { kind: 'socket', host: null, port: null, connected: false, banner: '' };
}

// Métodos de la instancia de socket (resueltos por evalExpr en Attr).
export function getSocketMethod(
  sock: PySocket,
  name: string,
  ctx: RunCtx,
  line: number,
): PyValue | null {
  const doConnect = (arg: PyValue): ConnectResult => {
    if (!isPyObject(arg) || arg.kind !== 'tuple' || arg.items.length !== 2) {
      throw typeError('connect espera una tupla (host, puerto)', line);
    }
    const host = arg.items[0];
    const port = arg.items[1];
    if (typeof host !== 'string' || typeof port !== 'number') {
      throw typeError('connect espera (string, entero)', line);
    }
    const res = ctx.opts.connect?.(host, port) ?? { ok: false, errno: 113 };
    ctx.state.connections.push({ host, port, ok: res.ok, service: res.service, version: res.version });
    return res;
  };

  switch (name) {
    case 'settimeout':
      return { kind: 'native', name, call: () => null };
    case 'close':
      return { kind: 'native', name, call: () => { sock.connected = false; return null; } };
    case 'connect':
      return { kind: 'native', name, call: (_args, l) => {
        void l;
        const res = doConnect(_args[0] ?? null);
        if (!res.ok) {
          sock.connected = false;
          throw new PyError(
            res.errno === 110 ? 'socket.timeout' : 'ConnectionRefusedError',
            res.errno === 110 ? 'timed out' : `[Errno ${res.errno ?? 111}] Connection refused`,
            line,
          );
        }
        sock.connected = true;
        sock.banner = res.banner ?? '';
        return null;
      } };
    case 'connect_ex':
      return { kind: 'native', name, call: (args) => {
        const res = doConnect(args[0] ?? null);
        if (res.ok) {
          sock.connected = true;
          sock.banner = res.banner ?? '';
          return 0;
        }
        sock.connected = false;
        return res.errno ?? 111;
      } };
    case 'recv':
      return { kind: 'native', name, call: (_args, l) => {
        if (!sock.connected) {
          throw new PyError('OSError', '[Errno 107] Transport endpoint is not connected', l);
        }
        return sock.banner;
      } };
    default:
      return null;
  }
}

// KeyError con formato CPython (repr de la clave).
export const dictKeyError = (key: PyValue, line: number): PyError =>
  new PyError('KeyError', pyRepr(key), line);
