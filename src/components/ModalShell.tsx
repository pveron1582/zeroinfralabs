// ── components/ModalShell.tsx ─────────────────────────────────────
// Contenedor de diálogo con foco atrapado (P1 3.8). Los modales del
// proyecto eran divs con `fixed inset-0` sin role="dialog", sin
// aria-modal y sin trampa de foco: con teclado el foco se escapaba al
// contenido de atrás.
//
// Envuelve el overlay + el panel; el contenido visual (colores, tamaños)
// queda del lado del modal, así que se puede usar en los que ya existen
// sin reescribirlos.

import type { ReactNode } from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface ModalShellProps {
  /** El modal está visible (muchos lo montan siempre y cortan con `open`). */
  open: boolean;
  /** Nombre accesible del diálogo. Sin esto, un lector de pantalla dice "dialog". */
  label: string;
  /** Cierre al hacer click en el fondo y al presionar Escape. */
  onClose?: () => void;
  /** Cierra al clickear el fondo (los modales de confirmación usan esto). */
  closeOnBackdrop?: boolean;
  className?: string;
  children: ReactNode;
}

export function ModalShell({
  open, label, onClose, closeOnBackdrop = true, className = '', children,
}: ModalShellProps) {
  const ref = useFocusTrap<HTMLDivElement>(open, onClose);
  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 ${className}`}
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
