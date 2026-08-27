// ── components/editorModal/useNanoEditor.ts ──────────────────────
// Lógica del editor estilo GNU nano: escritura, save-as, búsqueda,
// confirmación de salida y atajos de teclado. Extraída de EditorModal.tsx
// para mantener el componente <300 líneas.

import { useCallback } from 'react';
import { computeCursorFromSelection, type Cursor } from './cursor';
import type { BarMode } from './NanoStatusBar';
import type { SaveResult } from '../EditorModal';

export const HELP_TEXT = [
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

export interface NanoEditorDeps {
  content: string;
  setContent: (c: string) => void;
  filename: string;
  setFilename: (f: string) => void;
  filePath: string;
  readOnly?: boolean;
  dirty: boolean;
  setDirty: (d: boolean) => void;
  barMode: BarMode;
  setBarMode: (m: BarMode) => void;
  barInput: string;
  setBarInput: (v: string) => void;
  setHelpText: (t: string[]) => void;
  setStatusMessage: (m: string | null) => void;
  isExitingOnSave: boolean;
  setIsExitingOnSave: (v: boolean) => void;
  setCursor: (c: Cursor) => void;
  onSave: (content: string, filename?: string) => SaveResult | void;
  onClose: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  barInputRef: React.RefObject<HTMLInputElement>;
}

export function useNanoEditor(deps: NanoEditorDeps) {
  const {
    content, filename, setFilename, filePath, readOnly,
    dirty, setDirty, barMode, setBarMode, barInput, setBarInput,
    setHelpText, setStatusMessage, isExitingOnSave, setIsExitingOnSave,
    setCursor, onSave, onClose, textareaRef, barInputRef,
  } = deps;

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
    [content, filename, filePath, onSave, setFilename, setDirty, setStatusMessage]
  );

  const beginSaveAs = useCallback(() => {
    setBarMode('saveAs');
    setBarInput(filename || '');
    setTimeout(() => barInputRef.current?.focus(), 30);
  }, [filename, setBarMode, setBarInput, barInputRef]);

  const beginSearch = useCallback(() => {
    setBarMode('search');
    setBarInput('');
    setTimeout(() => barInputRef.current?.focus(), 30);
  }, [setBarMode, setBarInput, barInputRef]);

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
  }, [content, setBarMode, setBarInput, setCursor, textareaRef]);

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
  }, [barInput, filename, filePath, doWrite, setBarMode, setBarInput, isExitingOnSave, onClose, textareaRef]);

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
  }, [barInput, filename, setBarMode, setBarInput, setIsExitingOnSave, setStatusMessage, onClose, barInputRef]);

  const cancelBar = useCallback(() => {
    setBarMode('edit');
    setBarInput('');
    setHelpText([]);
    setIsExitingOnSave(false);
    setTimeout(() => textareaRef.current?.focus(), 30);
  }, [setBarMode, setBarInput, setHelpText, setIsExitingOnSave, textareaRef]);

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
    [barMode, cancelBar, dirty, readOnly, beginSaveAs, beginSearch, onClose,
     setBarMode, setBarInput, setHelpText, setStatusMessage, setIsExitingOnSave, barInputRef]
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
  }, [barMode, textareaRef]);

  const syncCursor = useCallback(() => {
    const ta = textareaRef.current;
    if (ta) setCursor(computeCursorFromSelection(ta));
  }, [setCursor, textareaRef]);

  return {
    doWrite, beginSaveAs, beginSearch, performSearch, confirmSaveAs,
    confirmExit, cancelBar, handleTextareaKeyDown, handleBarKeyDown,
    handleBarBlur, syncCursor,
  };
}
