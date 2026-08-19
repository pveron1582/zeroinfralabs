// ── components/editorModal/cursor.ts ─────────────────────────────
// Cálculo de posición del cursor a partir de la selección del textarea

export interface Cursor {
  row: number;
  col: number;
}

export function computeCursorFromSelection(textarea: HTMLTextAreaElement): Cursor {
  const value = textarea.value;
  const selStart = textarea.selectionStart;
  const before = value.slice(0, selStart);
  const row = before.split('\n').length - 1;
  const lastLineStart = before.lastIndexOf('\n');
  const col = lastLineStart === -1 ? selStart : selStart - lastLineStart - 1;
  const linesBefore = before.split('\n');
  const lineLen = linesBefore[row]?.length ?? 0;
  return {
    row: row + 1,
    col: Math.min(col + 1, lineLen) || 1,
  };
}
