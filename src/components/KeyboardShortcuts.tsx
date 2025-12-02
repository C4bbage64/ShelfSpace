import { useEffect } from 'react';
import './KeyboardShortcuts.css';

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutActions {
  onNextPage: () => void;
  onPrevPage: () => void;
  onToggleBookmark: () => void;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  onToggleHighlightPanel: () => void;
  onToggleToc: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onGoBack: () => void;
}

export function useKeyboardShortcuts(actions: ShortcutActions, enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Navigation
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        if (e.key === ' ' && !e.shiftKey) {
          e.preventDefault();
          actions.onNextPage();
        } else if (e.key !== ' ') {
          actions.onNextPage();
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) {
        if (e.key === ' ') e.preventDefault();
        actions.onPrevPage();
      }

      // Bookmark (Ctrl+B or Cmd+B)
      else if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        actions.onToggleBookmark();
      }

      // Search (Ctrl+F or Cmd+F)
      else if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        actions.onOpenSearch();
      }

      // Settings (Ctrl+, or Cmd+,)
      else if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        actions.onOpenSettings();
      }

      // Toggle highlight panel (Ctrl+H or Cmd+H)
      else if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        actions.onToggleHighlightPanel();
      }

      // Toggle TOC (Ctrl+T or Cmd+T)
      else if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        actions.onToggleToc();
      }

      // Zoom In (Ctrl++ or Cmd++)
      else if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        actions.onZoomIn();
      }

      // Zoom Out (Ctrl+- or Cmd+-)
      else if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        actions.onZoomOut();
      }

      // Reset Zoom (Ctrl+0 or Cmd+0)
      else if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        actions.onResetZoom();
      }

      // Go back (Escape or Backspace when not in input)
      else if (e.key === 'Escape') {
        actions.onGoBack();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [actions, enabled]);
}

const SHORTCUTS = [
  { category: 'Navigation', shortcuts: [
    { keys: ['→', 'PageDown', 'Space'], description: 'Next page' },
    { keys: ['←', 'PageUp', 'Shift+Space'], description: 'Previous page' },
    { keys: ['Esc'], description: 'Go back to library' },
  ]},
  { category: 'Features', shortcuts: [
    { keys: ['Ctrl', 'F'], description: 'Search in book' },
    { keys: ['Ctrl', 'B'], description: 'Toggle bookmark' },
    { keys: ['Ctrl', 'H'], description: 'Toggle highlights' },
    { keys: ['Ctrl', 'T'], description: 'Toggle table of contents' },
    { keys: ['Ctrl', ','], description: 'Open settings' },
  ]},
  { category: 'Zoom', shortcuts: [
    { keys: ['Ctrl', '+'], description: 'Zoom in' },
    { keys: ['Ctrl', '-'], description: 'Zoom out' },
    { keys: ['Ctrl', '0'], description: 'Reset zoom' },
  ]},
];

export function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="shortcuts-overlay" onClick={onClose}>
      <div className="shortcuts-panel" onClick={(e) => e.stopPropagation()}>
        <div className="shortcuts-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <line x1="6" y1="8" x2="6" y2="8" />
            <line x1="10" y1="8" x2="14" y2="8" />
            <line x1="18" y1="8" x2="18" y2="8" />
            <line x1="6" y1="12" x2="6" y2="12" />
            <line x1="18" y1="12" x2="18" y2="12" />
            <line x1="8" y1="16" x2="16" y2="16" />
          </svg>
          <h3>Keyboard Shortcuts</h3>
          <button className="close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="shortcuts-content">
          {SHORTCUTS.map((category) => (
            <div key={category.category} className="shortcut-category">
              <h4>{category.category}</h4>
              <div className="shortcut-list">
                {category.shortcuts.map((shortcut, index) => (
                  <div key={index} className="shortcut-item">
                    <span className="shortcut-description">{shortcut.description}</span>
                    <div className="shortcut-keys">
                      {shortcut.keys.map((key, keyIndex) => (
                        <span key={keyIndex}>
                          <kbd>{key}</kbd>
                          {keyIndex < shortcut.keys.length - 1 && <span className="key-separator">+</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="shortcuts-footer">
          <span>Press <kbd>?</kbd> to toggle this help</span>
        </div>
      </div>
    </div>
  );
}
