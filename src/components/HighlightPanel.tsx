import { useState, useEffect, useCallback } from 'react';
import type { Highlight } from '../../shared/types/notes';
import './HighlightPanel.css';

// Predefined highlight colors
export const HIGHLIGHT_COLORS = [
  { name: 'Yellow', value: '#fef08a' },
  { name: 'Green', value: '#bbf7d0' },
  { name: 'Blue', value: '#bfdbfe' },
  { name: 'Pink', value: '#fbcfe8' },
  { name: 'Orange', value: '#fed7aa' },
] as const;

interface HighlightPanelProps {
  bookId: string;
  isOpen: boolean;
  onClose: () => void;
  onHighlightClick?: (highlight: Highlight) => void;
  selectedText?: string;
  onCreateHighlight?: (color: string) => void;
}

export function HighlightPanel({
  bookId,
  isOpen,
  onClose,
  onHighlightClick,
  selectedText,
  onCreateHighlight,
}: HighlightPanelProps) {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadHighlights = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await window.api.getHighlights(bookId);
      setHighlights(data);
    } catch (error) {
      console.error('Failed to load highlights:', error);
    } finally {
      setIsLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    if (isOpen) {
      loadHighlights();
    }
  }, [isOpen, loadHighlights]);

  const handleDeleteHighlight = async (id: string) => {
    try {
      await window.api.deleteHighlight(id);
      setHighlights((prev) => prev.filter((h) => h.id !== id));
    } catch (error) {
      console.error('Failed to delete highlight:', error);
    }
  };

  const handleCreateHighlight = (color: string) => {
    if (onCreateHighlight) {
      onCreateHighlight(color);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="highlight-panel">
      <div className="highlight-panel-header">
        <h2>Highlights</h2>
        <button className="btn btn-ghost" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Quick highlight creator when text is selected */}
      {selectedText && (
        <div className="highlight-creator">
          <p className="selected-text-preview">"{selectedText.slice(0, 100)}{selectedText.length > 100 ? '...' : ''}"</p>
          <div className="color-picker">
            {HIGHLIGHT_COLORS.map((color) => (
              <button
                key={color.value}
                className="color-option"
                style={{ backgroundColor: color.value }}
                onClick={() => handleCreateHighlight(color.value)}
                title={color.name}
              />
            ))}
          </div>
        </div>
      )}

      <div className="highlight-panel-content">
        {isLoading ? (
          <div className="highlight-loading">
            <div className="spinner" />
            <p>Loading highlights...</p>
          </div>
        ) : highlights.length === 0 ? (
          <div className="highlight-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <p>No highlights yet</p>
            <span>Select text in the reader to create highlights</span>
          </div>
        ) : (
          <div className="highlight-list">
            {highlights.map((highlight) => (
              <div 
                key={highlight.id} 
                className="highlight-item"
                onClick={() => onHighlightClick?.(highlight)}
              >
                <div 
                  className="highlight-color-bar" 
                  style={{ backgroundColor: highlight.color }}
                />
                <div className="highlight-content">
                  <p className="highlight-text">{highlight.text}</p>
                  <div className="highlight-meta">
                    <span className="highlight-date">{formatDate(highlight.createdAt)}</span>
                    {highlight.location && (
                      <span className="highlight-location">Page {highlight.location}</span>
                    )}
                  </div>
                </div>
                <button
                  className="highlight-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteHighlight(highlight.id);
                  }}
                  title="Delete highlight"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <polyline points="3,6 5,6 21,6" />
                    <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HighlightPanel;
