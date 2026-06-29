// ── components/Terminal.tsx ───────────────────────────────────────
// Terminal UI component — solo render, lógica delegada a useCommandRunner

import React from 'react';
import { useCommandRunner, type CommandRunnerProps } from '../hooks/useCommandRunner';
import { getAutocompleteSuggestions } from '../utils/autocomplete';
import { renderKaliPrompt, renderKaliPromptSymbol } from './TerminalPrompt';
import { AutocompletePanel } from './AutocompletePanel';
import { StreamingOutput } from './StreamingOutput';

const promptColors = {
  user: '#7fffd4',
  at: '#7fffd4',
  host: '#7fffd4',
  colon: '#ffffff',
  path: '#ffffff',
  symbol: '#7fffd4',
  bracket: '#0000ff',
  line: '#0000ff',
};

export function Terminal(props: CommandRunnerProps & { fontSize?: number; opacity?: number; isWindowed?: boolean }) {
  const { fontSize, opacity = 1, isWindowed = false } = props;
  const {
    history, input, setInput, busy, prompt, color, isRoot,
    scrollRef, inputRef, ftpSession, sshSession, isMsfActive: isMsfActiveFn,
    blockingCommand, msfState, machine, currentDir,
    handleKeyDown, showSuggestions, suggestions, suggestionIdx,
    setShowSuggestions, setSuggestions, setSuggestionIdx,
  } = useCommandRunner(props);

  return (
    <div 
      className="flex flex-col h-full font-mono custom-term" 
      style={{ 
        backgroundColor: isWindowed ? 'transparent' : `rgba(3, 7, 18, ${opacity})`,
        '--term-font-size': fontSize ? `${fontSize}px` : 'inherit'
      } as React.CSSProperties}
      onClick={() => !busy && inputRef.current?.focus()}
    >
      {!isWindowed && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 border-b border-gray-800 select-none flex-shrink-0">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500/70" />
            <div className="w-2 h-2 rounded-full bg-yellow-500/70" />
            <div className="w-2 h-2 rounded-full bg-green-500/70" />
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-gray-800 border border-gray-700">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
            <span className="text-xs font-mono" style={{ color: '#6b7280' }}>{renderKaliPrompt(prompt, promptColors)}</span>
          </div>
          <div className="ml-auto flex items-center gap-1">
            {busy
              ? <><div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color }} /><span className="text-xs font-mono" style={{ color }}>running…</span></>
              : <><div className="w-1.5 h-1.5 rounded-full" style={{ background: color, opacity: 0.6 }} /><span className="text-xs font-mono" style={{ color, opacity: 0.5 }}>ready</span></>
            }
          </div>
        </div>
      )}

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-5 space-y-3 cursor-text select-text"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#374151 transparent' }}
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((entry, i) => (
          <div key={entry.timestamp + i} className="space-y-0.5" style={{ animation: 'fadeInEntry 0.12s ease-out' }}>
            {entry.command !== null && (
              <div className="flex flex-col gap-0.5">
                {entry.prompt?.includes('ftp') || entry.prompt?.includes('Name') || entry.prompt?.includes('Password') || entry.prompt?.includes("'s password") ? (
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs flex-shrink-0" style={{ color }}>
                      {entry.prompt?.trim() === 'ftp>' ? 'ftp> ' : entry.prompt}
                    </span>
                    <span className="text-sm" style={{ color }}>{entry.command}</span>
                  </div>
                ) : (
                  <>
                    <span className="font-bold text-xs flex-shrink-0">{renderKaliPrompt(entry.prompt || prompt, promptColors)}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs flex-shrink-0">{renderKaliPromptSymbol(entry.prompt, isRoot, promptColors)}</span>
                      <span className="text-sm" style={{ color }}>{entry.command}</span>
                    </div>
                  </>
                )}
              </div>
            )}
            {entry.streaming && entry.lines
              ? <StreamingOutput lines={entry.lines} color={color} delays={entry.lineDelays} />
              : <pre className="whitespace-pre-wrap text-xs leading-relaxed" style={{ color: entry.command === null ? color + '99' : color }}>
                  {entry.output}
                </pre>
            }
          </div>
        ))}

        {!busy && !blockingCommand && (
          <div className="relative">
            {ftpSession?.active ? (
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs flex-shrink-0" style={{ color }}>
                  {prompt?.trim() === 'ftp>' ? 'ftp> ' : prompt}
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent border-none outline-none text-sm min-w-[100px]"
                  style={{ color, caretColor: color, minWidth: '50px' }}
                  autoFocus
                  spellCheck={false}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                />
              </div>
            ) : sshSession?.active ? (
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs flex-shrink-0" style={{ color }}>
                  {prompt}
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent border-none outline-none text-sm min-w-[100px]"
                  style={{ color, caretColor: color, minWidth: '50px' }}
                  autoFocus
                  spellCheck={false}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                />
              </div>
            ) : isMsfActiveFn() ? (
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs flex-shrink-0">{renderKaliPrompt(prompt, promptColors)}</span>
                <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent border-none outline-none text-sm"
                  style={{ color, caretColor: color }}
                  autoFocus spellCheck={false} autoComplete="off" autoCorrect="off" autoCapitalize="off" />
              </div>
            ) : (
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-xs flex-shrink-0">{renderKaliPrompt(prompt, promptColors)}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs flex-shrink-0">{renderKaliPromptSymbol(undefined, isRoot, promptColors)}</span>
                  <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent border-none outline-none text-sm"
                    style={{ color, caretColor: color }}
                    autoFocus spellCheck={false} autoComplete="off" autoCorrect="off" autoCapitalize="off" />
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
                termColor={color}
              />
            )}
          </div>
        )}
        {busy && blockingCommand && (
          <>
            <div className="flex items-center gap-2 bg-blue-900/20 py-1 px-2 rounded -ml-2 border-l-2 border-blue-500">
              <span className="font-bold text-xs flex-shrink-0" style={{ color }}>⏳ </span>
              <span className="text-xs font-mono" style={{ color }}>{blockingCommand.message}</span>
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
              <span className="font-bold text-xs flex-shrink-0">{renderKaliPrompt(prompt, promptColors)}</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs flex-shrink-0">{renderKaliPromptSymbol(undefined, isRoot, promptColors)}</span>
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
      <style>{`
        @keyframes fadeInEntry{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:none}}
        .custom-term .text-xs,
        .custom-term .text-sm,
        .custom-term pre,
        .custom-term input,
        .custom-term span {
          font-size: var(--term-font-size, inherit) !important;
        }
      `}</style>
    </div>
  );
}