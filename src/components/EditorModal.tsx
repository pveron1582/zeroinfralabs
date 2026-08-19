import { useState, useEffect, useRef, useCallback } from 'react';
import { computeCursorFromSelection, type Cursor } from './editorModal/cursor';
import { NanoStatusBar, type BarMode } from './editorModal/NanoStatusBar';
import { NanoFooter } from './editorModal/NanoFooter';

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

const HELP_TEXT = [
  'GNU nano 6.2                Help: ^G',
  '',
  'The following functions are available in GNU nano:',
  '',
  '^G  Help          ^O  Write Out    ^R  Read File    ^W  Where Is',
  '^\\  Replace       ^K  Cut          ^U  Paste        ^J  Justify',
  '^C  Cursor Pos     ^X  Exit         ^T  To Spell     ^_  Go To Line',
  '',
  'Press ^X to leave help and return to editing.',
];

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

  const doWrite = useCallback(
    (pathToSave: string): boolean => {
      const targetPath = pathToSave.trim() || filename || filePath;
      if (!targetPath) return false;
      const res = onSave(content, targetPath);
      if (res && !res.success) {
        setStatusMessage(res.error || 'Permission denied');
        return false;
      }
      const finalPath = res?.savedPath || targetPath;
      setFilename(finalPath);
      setDirty(false);
      const lines = content.split('\n').length;
      setStatusMessage(`[ Wrote ${lines} line${lines === 1 ? '' : 's'} to '${finalPath}' ]`);
      return true;
    },
    [content, filename, filePath, onSave]
  );

  const beginSaveAs = useCallback(() => {
    setBarMode('saveAs');
    setBarInput(filename || '');
    setTimeout(() => barInputRef.current?.focus(), 30);
  }, [filename]);

  const beginSearch = useCallback(() => {
    setBarMode('search');
    setBarInput('');
    setTimeout(() => barInputRef.current?.focus(), 30);
  }, []);

  const performSearch = useCallback((query: string) => {
    const ta = textareaRef.current;
    if (!ta || !query) {
      setBarMode('edit');
      setBarInput('');
      return;
    }
    const from = ta.selectionEnd;
    const found = content.indexOf(query, from);
    if (found !== -1) {
      ta.setSelectionRange(found, found + query.length);
      ta.focus();
      setCursor(computeCursorFromSelection(ta));
    } else {
      const wrapped = content.indexOf(query);
      if (wrapped !== -1) {
        ta.setSelectionRange(wrapped, wrapped + query.length);
        ta.focus();
        setCursor(computeCursorFromSelection(ta));
      }
    }
    setBarMode('edit');
    setBarInput('');
  }, [content]);

  const confirmSaveAs = useCallback(() => {
    const path = barInput.trim() || filename || filePath;
    if (!path) return;
    const success = doWrite(path);
    setBarMode('edit');
    setBarInput('');
    if (success && isExitingOnSave) {
      onClose();
    } else {
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  }, [barInput, filename, filePath, doWrite, isExitingOnSave, onClose]);

  // Prompt Y/N que aparece al salir con ^X con cambios sin guardar.
  // "Y" -> se pide el nombre del archivo (saveAs) y se guarda al confirmar.
  // "N" -> sale sin guardar (descarta los cambios).
  const confirmExit = useCallback(() => {
    const answer = barInput.trim().toLowerCase();
    if (answer.startsWith('y')) {
      setBarMode('saveAs');
      setBarInput(filename || '');
      setTimeout(() => barInputRef.current?.focus(), 30);
    } else if (answer.startsWith('n')) {
      setIsExitingOnSave(false);
      onClose();
    } else {
      setStatusMessage('Please answer Y or N');
      setBarInput('Y');
      setTimeout(() => barInputRef.current?.focus(), 30);
    }
  }, [barInput, filename, onClose]);

  const cancelBar = useCallback(() => {
    setBarMode('edit');
    setBarInput('');
    setHelpText([]);
    setIsExitingOnSave(false);
    setTimeout(() => textareaRef.current?.focus(), 30);
  }, []);

  const handleTextareaKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (barMode === 'help') {
        if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
          e.preventDefault();
          cancelBar();
        }
        return;
      }
      if (barMode !== 'edit') return;
      if (!(e.ctrlKey || e.metaKey)) return;
      const k = e.key.toLowerCase();
      if (k === 'o') {
        e.preventDefault();
        if (readOnly) {
          setStatusMessage('File is read-only');
          return;
        }
        beginSaveAs();
      } else if (k === 'x') {
        e.preventDefault();
        if (dirty && !readOnly) {
          setIsExitingOnSave(true);
          setBarMode('confirmExit');
          setBarInput('Y');
          setTimeout(() => barInputRef.current?.focus(), 30);
        } else {
          onClose();
        }
      } else if (k === 'w') {
        e.preventDefault();
        beginSearch();
      } else if (k === 'g') {
        e.preventDefault();
        setBarMode('help');
        setHelpText(HELP_TEXT);
      }
    },
    [barMode, cancelBar, dirty, readOnly, filePath, newFile, beginSaveAs, beginSearch, onClose]
  );

  const handleBarKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (barMode === 'saveAs') confirmSaveAs();
        else if (barMode === 'search') performSearch(barInput);
        else if (barMode === 'confirmExit') confirmExit();
      } else if (e.key === 'Escape' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c')) {
        e.preventDefault();
        cancelBar();
      }
    },
    [barMode, barInput, confirmSaveAs, performSearch, confirmExit, cancelBar]
  );

  const handleBarBlur = useCallback(() => {
    if (barMode === 'saveAs' || barMode === 'search' || barMode === 'confirmExit') {
      setTimeout(() => {
        const tag = (document.activeElement as HTMLElement | null)?.tagName;
        if (tag !== 'TEXTAREA' && tag !== 'INPUT') {
          textareaRef.current?.focus();
        }
      }, 0);
    }
  }, [barMode]);

  const syncCursor = useCallback(() => {
    const ta = textareaRef.current;
    if (ta) setCursor(computeCursorFromSelection(ta));
  }, []);

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
