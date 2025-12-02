import { useState, useEffect, useCallback, useRef } from 'react';
import './SelectionToolbar.css';

// Predefined highlight colors
const HIGHLIGHT_COLORS = [
  { name: 'Yellow', value: '#fef08a' },
  { name: 'Green', value: '#bbf7d0' },
  { name: 'Blue', value: '#bfdbfe' },
  { name: 'Pink', value: '#fbcfe8' },
  { name: 'Orange', value: '#fed7aa' },
] as const;

interface SelectionToolbarProps {
  onHighlight: (text: string, color: string) => void;
  containerRef?: React.RefObject<HTMLElement | null>;
}

interface Position {
  x: number;
  y: number;
}

export function SelectionToolbar({ onHighlight, containerRef }: SelectionToolbarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  const toolbarRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<number | null>(null);

  const clearHideTimeout = () => {
    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const handleSelection = useCallback(() => {
    clearHideTimeout();
    
    const selection = window.getSelection();
    const text = selection?.toString().trim() || '';

    if (text.length < 3) {
      // Delay hiding to allow for click on toolbar
      hideTimeoutRef.current = window.setTimeout(() => {
        setIsVisible(false);
        setSelectedText('');
      }, 200);
      return;
    }

    try {
      const range = selection?.getRangeAt(0);
      if (!range) {
        setIsVisible(false);
        return;
      }

      const rect = range.getBoundingClientRect();
      
      // Calculate position above the selection
      let x = rect.left + rect.width / 2;
      let y = rect.top - 10;

      // Adjust for container offset if provided
      if (containerRef?.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        // Make sure toolbar stays within container bounds
        x = Math.max(containerRect.left + 100, Math.min(x, containerRect.right - 100));
      }

      // Ensure toolbar doesn't go off screen
      const toolbarWidth = 200;
      x = Math.max(toolbarWidth / 2 + 10, Math.min(x, window.innerWidth - toolbarWidth / 2 - 10));
      y = Math.max(50, y);

      setPosition({ x, y });
      setSelectedText(text);
      setIsVisible(true);
    } catch {
      setIsVisible(false);
    }
  }, [containerRef]);

  const handleHighlight = useCallback((color: string) => {
    if (selectedText) {
      onHighlight(selectedText, color);
      setIsVisible(false);
      setSelectedText('');
      window.getSelection()?.removeAllRanges();
    }
  }, [selectedText, onHighlight]);

  const handleCopy = useCallback(() => {
    if (selectedText) {
      navigator.clipboard.writeText(selectedText);
      setIsVisible(false);
      setSelectedText('');
      window.getSelection()?.removeAllRanges();
    }
  }, [selectedText]);

  // Listen for selection changes
  useEffect(() => {
    const handleMouseUp = () => {
      // Small delay to ensure selection is complete
      setTimeout(handleSelection, 10);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Handle shift+arrow selection
      if (e.shiftKey) {
        setTimeout(handleSelection, 10);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      // Hide toolbar when clicking outside
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        // Don't hide immediately - let selection complete
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('mousedown', handleMouseDown);
      clearHideTimeout();
    };
  }, [handleSelection]);

  if (!isVisible) return null;

  return (
    <div
      ref={toolbarRef}
      className="selection-toolbar"
      style={{
        left: position.x,
        top: position.y,
      }}
      onMouseDown={(e) => e.preventDefault()} // Prevent losing selection
    >
      <div className="selection-toolbar-arrow" />
      <div className="selection-toolbar-content">
        <div className="highlight-colors">
          {HIGHLIGHT_COLORS.map((color) => (
            <button
              key={color.value}
              className="color-btn"
              style={{ backgroundColor: color.value }}
              onClick={() => handleHighlight(color.value)}
              title={`Highlight ${color.name}`}
              aria-label={`Highlight with ${color.name}`}
            />
          ))}
        </div>
        <div className="toolbar-divider" />
        <button className="toolbar-btn" onClick={handleCopy} title="Copy">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </button>
      </div>
    </div>
  );
}
