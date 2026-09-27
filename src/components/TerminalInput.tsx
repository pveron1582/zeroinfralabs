// ── components/TerminalInput.tsx ──────────────────────────────────
// Input de línea de comandos del Terminal (render puro).

interface TerminalInputProps {
  inputRef: React.Ref<HTMLInputElement>;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  color: string;
  className?: string;
  hideValue?: boolean;
}

export function TerminalInput({
  inputRef, value, onChange, onKeyDown, color, className = '', hideValue = false,
}: TerminalInputProps) {
  return (
    <input
      ref={inputRef}
      type={hideValue ? 'password' : 'text'}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      aria-label="Terminal command input"
      className={`flex-1 bg-transparent border-none outline-none text-sm ${className}`}
      style={{ color, caretColor: color, minWidth: '50px' }}
      autoFocus
      spellCheck={false}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      data-gramm="false"
      data-enable-grammarly="false"
    />
  );
}
