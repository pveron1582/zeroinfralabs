// ── components/editorModal/NanoStatusBar.tsx ─────────────────────
// Barra inferior dinámica del editor nano: confirmExit / saveAs / search / edit

import type { RefObject } from 'react';

export type BarMode = 'edit' | 'confirmExit' | 'saveAs' | 'search' | 'help';

interface Props {
  barMode: BarMode;
  barInput: string;
  setBarInput: (v: string) => void;
  handleBarKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleBarBlur: () => void;
  statusMessage: string | null;
  newFile: boolean;
  barInputRef: RefObject<HTMLInputElement>;
}

function BarInput(props: {
  inputRef: RefObject<HTMLInputElement>;
  value: string;
  onChange: (v: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  className: string;
}) {
  return (
    <input
      ref={props.inputRef}
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      onKeyDown={props.onKeyDown}
      onBlur={props.onBlur}
      spellCheck={false}
      autoComplete="off"
      className={props.className}
    />
  );
}

export function NanoStatusBar({ barMode, barInput, setBarInput, handleBarKeyDown, handleBarBlur, statusMessage, newFile, barInputRef }: Props) {
  const commonInputProps = {
    inputRef: barInputRef,
    value: barInput,
    onChange: setBarInput,
    onKeyDown: handleBarKeyDown,
    onBlur: handleBarBlur,
  };

  return (
    <div className="px-2 py-0.5 bg-gray-50 text-black text-[13px] min-h-[28px] whitespace-nowrap overflow-hidden">
      {barMode === 'confirmExit' && (
        <div className="flex items-center gap-2">
          <span className="font-bold text-red-700">Save modified buffer?</span>
          <BarInput {...commonInputProps} className="bg-white border border-gray-400 px-1 outline-none text-black w-10 text-center" />
          <span className="text-gray-600 text-[11px]">(ANSWERING "No" WILL DISCARD CHANGES) [ Enter=accept ^C=cancel ]</span>
        </div>
      )}
      {barMode === 'saveAs' && (
        <div className="flex items-center gap-2">
          <span className="font-bold">File Name to Write:</span>
          <BarInput {...commonInputProps} className="flex-1 bg-white border border-gray-400 px-1 outline-none text-black" />
          <span className="text-gray-600 text-[11px]">[ Enter=accept ^C=cancel ]</span>
        </div>
      )}
      {barMode === 'search' && (
        <div className="flex items-center gap-2">
          <span className="font-bold">Search:</span>
          <BarInput {...commonInputProps} className="flex-1 bg-white border border-gray-400 px-1 outline-none text-black" />
          <span className="text-gray-600 text-[11px]">[ Enter=next Esc=cancel ]</span>
        </div>
      )}
      {barMode === 'edit' && (
        <span className={statusMessage?.includes('Permission denied') || statusMessage?.includes('No such file') ? 'text-red-600 font-bold' : 'text-gray-700'}>
          {statusMessage || (newFile
            ? 'Use ^O to save the file, ^X to exit without saving.'
            : 'Use ^O to save, ^X to exit (will prompt for save if modified).')}
        </span>
      )}
    </div>
  );
}
