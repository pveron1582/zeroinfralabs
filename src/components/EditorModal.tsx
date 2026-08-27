import { useState, useEffect, useRef } from 'react';
import type { Cursor } from './editorModal/cursor';
import { NanoStatusBar, type BarMode } from './editorModal/NanoStatusBar';
import { NanoFooter } from './editorModal/NanoFooter';
import { useNanoEditor } from './editorModal/useNanoEditor';

export interface SaveResult {
  success: boolean;
  error?: string;
  savedPath?: string;
}

interface EditorModalProps {
  isOpen: boolean;
  filePath: string;
  initialContent: string;
  readOnly?: boolean;
  onSave: (content: string, filename?: string) => SaveResult | void;
  onClose: () => void;
}

export function EditorModal({ isOpen, filePath, initialContent, readOnly, onSave, onClose }: EditorModalProps) {
  const [content, setContent] = useState(initialContent);
  const [filename, setFilename] = useState(filePath);
  const [cursor, setCursor] = useState<Cursor>({ row: 1, col: 1 });
  const [dirty, setDirty] = useState(false);
  const [barMode, setBarMode] = useState<BarMode>('edit');
  const [barInput, setBarInput] = useState('');
  const [helpText, setHelpText] = useState<string[]>([]);
  const [blinkOn, setBlinkOn] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isExitingOnSave, setIsExitingOnSave] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const barInputRef = useRef<HTMLInputElement>(null);
  const newFile = !filePath;

  useEffect(() => {
    if (isOpen) {
      setContent(initialContent);
      setFilename(filePath);
      setDirty(false);
      setBarMode('edit');
      setBarInput('');
      setHelpText([]);
      setStatusMessage(null);
      setIsExitingOnSave(false);
      const t = setTimeout(() => textareaRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [isOpen, initialContent, filePath]);

  useEffect(() => {
    if (!isOpen) return;
    const id = setInterval(() => setBlinkOn(v => !v), 530);
    return () => clearInterval(id);
  }, [isOpen]);

  const lineCount = (content ?? '').split('\n').length;

  const {
    handleTextareaKeyDown, handleBarKeyDown, handleBarBlur, syncCursor,
  } = useNanoEditor({
    content, setContent, filename, setFilename, filePath, readOnly,
    dirty, setDirty, barMode, setBarMode, barInput, setBarInput,
    setHelpText, setStatusMessage, isExitingOnSave, setIsExitingOnSave,
    setCursor, onSave, onClose, textareaRef, barInputRef,
  });

  if (!isOpen) return null;

  const headerTitle = newFile
    ? (filename || 'New Buffer')
    : filePath;

  return (
    <div
      className="w-full h-full flex-1 flex flex-col font-mono text-[14px] leading-[1.35] select-none bg-black overflow-hidden"
    >
      {/* Header — línea superior GNU nano */}
        <div className="px-2 py-0.5 flex items-stretch bg-gray-50 text-black border-b border-gray-300 overflow-hidden">
          <span className="font-bold flex-shrink-0 pr-2 border-r border-gray-400">
            GNU nano 6.2
          </span>
          <span className="flex-1 min-w-0 text-center font-bold truncate px-2 text-[13px] self-center">
            {headerTitle}
          </span>
          <span className="font-bold whitespace-nowrap flex-shrink-0 pl-2 border-l border-gray-400 self-center text-[13px]">{dirty ? 'Modified' : newFile ? 'New Buffer' : ''}{readOnly ? ' [Read-only]' : ''}</span>
        </div>

        {/* Área de edición */}
        <div className="flex-1 relative bg-[#0a0a0a] overflow-hidden">
          {barMode === 'help' ? (
            <div className="absolute inset-0 px-3 py-2 overflow-auto">
              {helpText.map((line, i) => (
                <div key={i} className={i === 0 || i === 3 ? 'text-cyan-400' : 'text-gray-200'}>
                  {line || '\u00A0'}
                </div>
              ))}
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={content}
              readOnly={readOnly}
              onChange={(e) => {
                if (readOnly) return;
                setContent(e.target.value);
                setDirty(true);
                syncCursor();
              }}
              onKeyDown={handleTextareaKeyDown}
              onKeyUp={syncCursor}
              onClick={syncCursor}
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              className="absolute inset-0 w-full h-full p-2 bg-transparent text-gray-300 border-none outline-none resize-none overflow-auto"
              style={{
                caretColor: blinkOn ? '#22d3ee' : 'transparent',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
              }}
            />
          )}
        </div>

        {/* Cursor locator (estilo nano: "line X, col Y") */}
        <div className="px-2 py-0.5 bg-gray-50 text-black flex justify-between text-[13px]">
          <span>[ line {cursor.row}/{lineCount || 1} ({Math.round(((cursor.row - 1) / Math.max(lineCount, 1)) * 100)}%) ]</span>
          <span>[ col {cursor.col} ]</span>
        </div>

        {/* Barra inferior dinámica: edit / saveAs / search */}
        <NanoStatusBar
          barMode={barMode}
          barInput={barInput}
          setBarInput={setBarInput}
          handleBarKeyDown={handleBarKeyDown}
          handleBarBlur={handleBarBlur}
          statusMessage={statusMessage}
          newFile={newFile}
          barInputRef={barInputRef}
        />

        {/* Footer — dos filas de atajos estilo nano */}
        <NanoFooter />
      </div>
  );
}
