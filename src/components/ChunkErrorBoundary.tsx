// ── components/ChunkErrorBoundary.tsx ──────────────────────────────
// ErrorBoundary raíz: si un chunk lazy falla (p. ej. tab abierta antes
// de un reinicio del dev server o un deploy nuevo), recarga una vez;
// si persiste, muestra un aviso manual en lugar de pantalla en blanco.

import { Component, useEffect, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

const RELOAD_FLAG = 'zilabs-chunk-reload';

function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message || '';
  return error.name === 'ChunkLoadError'
    || /loading chunk|dynamically imported module|failed to fetch/i.test(msg);
}

// Limpia el flag de recarga automática cuando la app renderiza con éxito
function ClearReloadFlag() {
  useEffect(() => { sessionStorage.removeItem(RELOAD_FLAG); }, []);
  return null;
}

export class ChunkErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    if (import.meta.env.DEV) {
      console.error('[ChunkErrorBoundary]', error);
    }
    // Recarga automática una sola vez: si el error era un chunk viejo,
    // el reload levanta el index.html nuevo y todo vuelve a funcionar.
    if (isChunkLoadError(error) && !sessionStorage.getItem(RELOAD_FLAG)) {
      sessionStorage.setItem(RELOAD_FLAG, '1');
      window.location.reload();
      return;
    }
    sessionStorage.removeItem(RELOAD_FLAG);
  }

  render() {
    if (!this.state.hasError) {
      return (<><ClearReloadFlag />{this.props.children}</>);
    }
    const lang = typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('es') ? 'es' : 'en';
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '100vh', gap: 16, color: '#94a3b8', fontFamily: 'monospace', textAlign: 'center', padding: 24,
      }}>
        <div style={{ fontSize: 14 }}>
          {lang === 'es'
            ? 'No se pudo cargar la página (posible actualización del dev server).'
            : 'The page could not be loaded (possible dev server update).'}
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '8px 20px', borderRadius: 8, border: '1px solid #10b981',
            background: 'transparent', color: '#10b981', fontFamily: 'monospace',
            cursor: 'pointer', fontSize: 13,
          }}
        >
          {lang === 'es' ? 'Recargar' : 'Reload'}
        </button>
      </div>
    );
  }
}
