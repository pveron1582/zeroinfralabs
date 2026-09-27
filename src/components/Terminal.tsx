// ── components/Terminal.tsx ───────────────────────────────────────
// Terminal UI component — solo render, lógica delegada a useCommandRunner

import { useEffect } from 'react';
import { useCommandRunner, type CommandRunnerProps } from '../hooks/useCommandRunner';
import { getAutocompleteSuggestions } from '../utils/autocomplete';
import { renderKaliPrompt, renderKaliPromptSymbol, isPsPromptText, isOneLinePrompt } from './TerminalPrompt';
import { AutocompletePanel } from './AutocompletePanel';
import { StreamingOutput } from './StreamingOutput';
import { EditorModal } from './EditorModal';
import { TerminalInput } from './TerminalInput';
import {
  promptColors, PS_PROMPT_COLORS, PS_BG, CMD_BG, PS_TEXT,
} from './terminalTheme';

export function Terminal(props: CommandRunnerProps & { fontSize?: number; opacity?: number; isWindowed?: boolean; isMobileKey?: string | null; compactHeader?: boolean }) {
  const { fontSize, opacity = 1, isWindowed = false, isMobileKey = null, compactHeader = false } = props;
  const {
    history, input, setInput, busy, prompt, color, isRoot,
    scrollRef, inputRef, ftpSession, sshSession, rdpSession, isMsfActive: isMsfActiveFn,
    isPsActive: isPsActiveFn,
    blockingCommand, msfState, machine, currentDir, nanoFile,
    handleKeyDown, showSuggestions, suggestions, suggestionIdx,
    setShowSuggestions, setSuggestions, setSuggestionIdx,
    setNanoFile, setBusy, handleNanoSave,
    pendingSu,
  } = useCommandRunner(props);

  // PowerShell: fondo azul clásico + texto/blanco (prompt y salida).
  const isPsMode = isPsActiveFn() || isPsPromptText(prompt) || prompt.startsWith('PS ');
  const activePromptColors = isPsMode ? PS_PROMPT_COLORS : promptColors;
  const displayColor = isPsMode ? PS_TEXT : color;
  // compactHeader = terminal cmd/PS del escritorio Windows (siempre oscuro).
  const backgroundColor = isPsMode
    ? PS_BG
    : compactHeader
      ? CMD_BG
      : isWindowed
        ? 'transparent'
        : `rgba(3, 7, 18, ${opacity})`;

  // Mobile KeyRow injection
  useEffect(() => {
    if (!isMobileKey) return;
    if (isMobileKey === '__CTRL_C__') {
      const e = { key: 'c', ctrlKey: true, preventDefault: () => {} } as unknown as React.KeyboardEvent<HTMLInputElement>;
      handleKeyDown(e);
      return;
    }
    if (isMobileKey === '__ARROW_UP__') {
      const e = { key: 'ArrowUp', preventDefault: () => {} } as unknown as React.KeyboardEvent<HTMLInputElement>;
      handleKeyDown(e);
      return;
    }
    if (isMobileKey === '\t') {
      const e = { key: 'Tab', preventDefault: () => {} } as unknown as React.KeyboardEvent<HTMLInputElement>;
      handleKeyDown(e);
      return;
    }
    setInput(prev => prev + isMobileKey);
    inputRef.current?.focus();
  }, [isMobileKey]);

  return (
    <div 
      className={`flex flex-col font-mono custom-term ${compactHeader ? 'flex-1 min-h-0 overflow-hidden' : 'h-full min-h-0'}`} 
      role="application"
      aria-label="Terminal"
      style={{ 
        backgroundColor,
        '--term-font-size': fontSize ? `${fontSize}px` : 'inherit'
      } as React.CSSProperties}
      onClick={() => !busy && inputRef.current?.focus()}
    >
      {!isWindowed && (
        compactHeader ? (
          <div className="flex items-center px-3 py-2 bg-gray-900 border-b border-gray-800 select-none flex-shrink-0">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
          </div>
        ) : (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 border-b border-gray-800 select-none flex-shrink-0">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500/70" />
            <div className="w-2 h-2 rounded-full bg-yellow-500/70" />
            <div className="w-2 h-2 rounded-full bg-green-500/70" />
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-gray-800 border border-gray-700">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={displayColor} strokeWidth="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
            <span className="text-xs font-mono" style={{ color: '#6b7280' }}>{renderKaliPrompt(prompt, activePromptColors)}</span>
          </div>
          <div className="ml-auto flex items-center gap-1">
            {busy
              ? <><div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: displayColor }} /><span className="text-xs font-mono" style={{ color: displayColor }}>running…</span></>
              : <><div className="w-1.5 h-1.5 rounded-full" style={{ background: displayColor, opacity: 0.6 }} /><span className="text-xs font-mono" style={{ color: displayColor, opacity: 0.5 }}>ready</span></>
            }
          </div>
        </div>
        )
      )}

      {nanoFile ? (
        <EditorModal
          isOpen={true}
          filePath={nanoFile.path}
          initialContent={nanoFile.content}
          readOnly={nanoFile.readOnly}
          onSave={handleNanoSave}
          onClose={() => {
            setNanoFile(null);
            setBusy(false);
          }}
        />
      ) : (
        <div
          ref={scrollRef}
          role="log"
          aria-label="Terminal output"
          className={`flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-3 cursor-text select-text ${fontSize && fontSize <= 13 ? 'p-3' : 'p-5'}`}
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#9ca3af rgba(0,0,0,0.35)' }}
          onClick={() => inputRef.current?.focus()}
        >
          {history.map((entry, i) => (
            <div key={entry.timestamp + i} className="space-y-0.5" style={{ animation: 'fadeInEntry 0.12s ease-out' }}>
              {entry.command !== null && (
                <div className="flex flex-col gap-0.5">
                  {isOneLinePrompt(entry.prompt) ? (
                    // PowerShell / cmd.exe: prompt y comando en el MISMO renglón
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs flex-shrink-0" style={{ color: displayColor }}>{entry.prompt}</span>
                      <span className="text-sm" style={{ color: displayColor }}>{entry.command}</span>
                    </div>
                  ) : entry.prompt?.includes('ftp') || entry.prompt?.includes('Name') || entry.prompt?.includes('Password') || entry.prompt?.includes("'s password") ? (
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs flex-shrink-0" style={{ color: displayColor }}>
                        {entry.prompt?.trim() === 'ftp>' ? 'ftp> ' : entry.prompt}
                      </span>
                      <span className="text-sm" style={{ color: displayColor }}>{entry.command}</span>
                    </div>
                  ) : (
                    <>
                      <span className="font-bold text-xs flex-shrink-0">{renderKaliPrompt(entry.prompt || prompt, activePromptColors)}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs flex-shrink-0">{renderKaliPromptSymbol(entry.prompt, isRoot, activePromptColors)}</span>
                        <span className="text-sm" style={{ color: displayColor }}>{entry.command}</span>
                      </div>
                    </>
                  )}
                </div>
              )}
              {entry.streaming && entry.lines
                ? <StreamingOutput lines={entry.lines} color={displayColor} delays={entry.lineDelays} />
                : <pre className="whitespace-pre-wrap text-xs leading-relaxed" style={{ color: entry.command === null ? displayColor + '99' : displayColor }}>
                    {entry.output}
                  </pre>
              }
            </div>
          ))}

          {!busy && !blockingCommand && (
            <div className="relative">
              {pendingSu ? (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs flex-shrink-0" style={{ color: displayColor }}>{prompt}</span>
                  <TerminalInput
                    inputRef={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    color={displayColor}
                    hideValue
                  />
                </div>
              ) : ftpSession?.active ? (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs flex-shrink-0" style={{ color: displayColor }}>
                    {prompt?.trim() === 'ftp>' ? 'ftp> ' : prompt}
                  </span>
                  <TerminalInput
                    inputRef={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    color={displayColor}
                    hideValue={!!pendingSu}
                  />
                </div>
              ) : sshSession?.active ? (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs flex-shrink-0" style={{ color: displayColor }}>
                    {prompt}
                  </span>
                  <TerminalInput
                    inputRef={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    color={displayColor}
                    hideValue={!!pendingSu}
                  />
                </div>
              ) : rdpSession?.active ? (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs flex-shrink-0" style={{ color: displayColor }}>
                    {prompt}
                  </span>
                  <TerminalInput
                    inputRef={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    color={displayColor}
                    hideValue={rdpSession.step === 'password'}
                  />
                </div>
              ) : isOneLinePrompt(prompt) ? (
                // PowerShell / cmd.exe: el prompt ya incluye el símbolo y la
                // línea editable va pegada a él (un solo renglón).
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs flex-shrink-0" style={{ color: displayColor }}>{prompt}</span>
                  <TerminalInput
                    inputRef={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    color={displayColor}
                    hideValue={!!pendingSu}
                  />
                </div>
              ) : isMsfActiveFn() ? (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs flex-shrink-0">{renderKaliPrompt(prompt, activePromptColors)}</span>
                  <TerminalInput
                    inputRef={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    color={displayColor}
                    hideValue={!!pendingSu}
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-xs flex-shrink-0">{renderKaliPrompt(prompt, activePromptColors)}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs flex-shrink-0">{renderKaliPromptSymbol(prompt, isRoot, activePromptColors)}</span>
                    <TerminalInput
                      inputRef={inputRef}
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      color={displayColor}
                      hideValue={!!pendingSu}
                    />
                  </div>
                </div>
              )}
              {showSuggestions && suggestions.length > 0 && (
                <AutocompletePanel
                  suggestions={suggestions}
                  selectedIndex={suggestionIdx}
                  onSelect={(suggestion) => {
                    const result = getAutocompleteSuggestions(input, input.length, machine, currentDir, msfState);
                    const textBeforeCursor = input.slice(0, result.replaceStart);
                    setInput(textBeforeCursor + suggestion);
                    setShowSuggestions(false);
                    setSuggestions([]);
                    setSuggestionIdx(-1);
                    inputRef.current?.focus();
                  }}
                  termColor={displayColor}
                />
              )}
            </div>
          )}
          {busy && blockingCommand && (
            <>
              <div className="flex items-center gap-2 bg-blue-900/20 py-1 px-2 rounded -ml-2 border-l-2 border-blue-500">
                <span className="font-bold text-xs flex-shrink-0" style={{ color: displayColor }}>⏳ </span>
                <span className="text-xs font-mono" style={{ color: displayColor }}>{blockingCommand.message}</span>
              </div>
              <input ref={inputRef} type="text" value={''} onChange={() => {}}
                onKeyDown={handleKeyDown}
                className="opacity-0 w-[1px] h-[1px] p-0 border-none outline-none"
                autoFocus spellCheck={false} autoComplete="off" />
            </>
          )}
          {busy && !blockingCommand && (
            <>
              <div className="flex flex-col gap-0.5 opacity-40">
                <span className="font-bold text-xs flex-shrink-0">{renderKaliPrompt(prompt, activePromptColors)}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs flex-shrink-0">{renderKaliPromptSymbol(prompt, isRoot, activePromptColors)}</span>
                  <span className="text-sm animate-pulse">_</span>
                </div>
              </div>
              <input ref={inputRef} type="text" value={''} onChange={() => {}}
                onKeyDown={handleKeyDown}
                className="opacity-0 w-[1px] h-[1px] p-0 border-none outline-none"
                autoFocus spellCheck={false} autoComplete="off" />
            </>
          )}
        </div>
      )}
      <style>{`
        .custom-term .text-xs,
        .custom-term .text-sm,
        .custom-term pre,
        .custom-term input,
        .custom-term textarea,
        .custom-term span {
          font-size: var(--term-font-size, inherit) !important;
        }
        /* Scrollbar visible para poder repasar la salida anterior: la regla
           global del workspace deja 4px gris oscuro sobre fondo azul de PS
           (prácticamente invisible). Va scoped para ganarle en especificidad. */
        .custom-term ::-webkit-scrollbar { width: 10px; height: 10px; }
        .custom-term ::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.3); }
        .custom-term ::-webkit-scrollbar-thumb {
          background: #9ca3af;
          background-clip: padding-box;
          border: 2px solid transparent;
          border-radius: 6px;
        }
        .custom-term ::-webkit-scrollbar-thumb:hover { background: #d1d5db; background-clip: padding-box; }
        .custom-term ::-webkit-scrollbar-corner { background: transparent; }
      `}</style>
    </div>
  );
}