// ── components/AutocompletePanel.tsx ────────────────────────────────
import React from 'react';

interface AutocompletePanelProps {
  suggestions: string[];
  selectedIndex: number;
  onSelect: (suggestion: string) => void;
  termColor: string;
}

export function AutocompletePanel({ suggestions, selectedIndex, onSelect, termColor }: AutocompletePanelProps) {
  if (suggestions.length === 0) return null;

  return (
    <div
      className="absolute left-0 right-0 mt-1 py-1 bg-gray-900 border border-gray-700 rounded shadow-lg z-50 max-h-48 overflow-y-auto"
      style={{ scrollbarWidth: 'thin', scrollbarColor: '#374151 transparent' }}
    >
      {suggestions.map((suggestion, idx) => (
        <div
          key={suggestion}
          className={`px-3 py-1 text-xs cursor-pointer flex items-center gap-2 ${
            idx === selectedIndex
              ? 'bg-gray-700'
              : 'hover:bg-gray-800'
          }`}
          style={{ color: termColor }}
          onClick={() => onSelect(suggestion)}
        >
          {suggestion.endsWith('/') ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={termColor} strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
              <span>{suggestion}</span>
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={termColor} strokeWidth="2">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                <polyline points="13 2 13 9 20 9"/>
              </svg>
              <span>{suggestion}</span>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
