// ── components/tour/bubblePosition.ts ─────────────────────────────
// Cálculo de la posición de la burbuja de diálogo del tour Foxy.
// Lógica pura extraída de FoxyTour.tsx para mantener el componente <300 líneas.

export interface BubbleRect {
  top: number; left: number; width: number; height: number;
}

export interface BubblePosition {
  left: number; top: number; width: number;
  placement: 'below' | 'above' | 'right' | 'left' | 'bottom';
  arrowLeft: string;
}

export const BUBBLE_W = 400;

export function computeBubblePosition(
  rect: BubbleRect | null,
  align: string | undefined
): BubblePosition {
  const width = Math.min(BUBBLE_W, window.innerWidth - 24);
  const h = 200;
  const margin = 16;

  if (!rect) {
    const top = (window.innerHeight - h) / 2;
    const left = align === 'right'
      ? window.innerWidth - width - 48
      : (window.innerWidth - width) / 2;
    return { left, top, width, placement: 'bottom', arrowLeft: '50%' };
  }

  const spaceBelow = window.innerHeight - rect.top - rect.height;
  const spaceAbove = rect.top;
  const spaceRight = window.innerWidth - rect.left - rect.width;
  const spaceLeft = rect.left;

  let placement: 'below' | 'above' | 'right' | 'left';
  if (spaceBelow >= h + margin) placement = 'below';
  else if (spaceAbove >= h + margin) placement = 'above';
  else if (spaceRight >= width + margin) placement = 'right';
  else if (spaceLeft >= width + margin) placement = 'left';
  else placement = spaceBelow >= spaceAbove ? 'below' : 'above';

  let left: number;
  let top: number;
  if (placement === 'below') {
    top = rect.top + rect.height + 24;
    left = rect.left + rect.width / 2 - width / 2;
  } else if (placement === 'above') {
    top = rect.top - h - 24;
    left = rect.left + rect.width / 2 - width / 2;
  } else if (placement === 'right') {
    left = rect.left + rect.width + 24;
    top = rect.top + rect.height / 2 - h / 2;
  } else {
    left = rect.left - width - 24;
    top = rect.top + rect.height / 2 - h / 2;
  }

  left = Math.max(12, Math.min(left, window.innerWidth - width - 12));
  top = Math.max(12, Math.min(top, window.innerHeight - h - 12));
  const arrowLeft = `${Math.min(90, Math.max(10, rect.left + rect.width / 2 - left))}px`;
  return { left, top, width, placement, arrowLeft };
}