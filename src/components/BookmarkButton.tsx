import { useState, useRef, useEffect } from 'react';
import './BookmarkButton.css';

interface Bookmark {
  id: string;
  cfi: string;
  chapter: string;
  createdAt: string;
  label?: string;
}

interface BookmarkButtonProps {
  bookId: string;
  currentCfi: string;
  currentChapter: string;
  isBookmarked: boolean;
  onAddBookmark: () => void;
  onRemoveBookmark: (id: string) => void;
  onGoToBookmark: (cfi: string) => void;
  bookmarks: Bookmark[];
}

export function BookmarkButton({
  bookId,
  currentCfi,
  currentChapter,
  isBookmarked,
  onAddBookmark,
  onRemoveBookmark,
  onGoToBookmark,
  bookmarks,
}: BookmarkButtonProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const handleToggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isBookmarked) {
      const currentBookmark = bookmarks.find((b) => b.cfi === currentCfi);
      if (currentBookmark) {
        onRemoveBookmark(currentBookmark.id);
      }
    } else {
      onAddBookmark();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bookmark-container" ref={dropdownRef}>
      <div className="bookmark-buttons">
        <button
          className={`bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
          onClick={handleToggleBookmark}
          title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
        >
          <svg
            viewBox="0 0 24 24"
            fill={isBookmarked ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            width="20"
            height="20"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>
        <button
          className={`bookmark-dropdown-btn ${showDropdown ? 'active' : ''}`}
          onClick={() => setShowDropdown(!showDropdown)}
          title="View bookmarks"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {showDropdown && (
        <div className="bookmark-dropdown">
          <div className="dropdown-header">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            <span>Bookmarks ({bookmarks.length})</span>
          </div>

          {bookmarks.length === 0 ? (
            <div className="no-bookmarks">
              <p>No bookmarks yet</p>
              <span>Click the bookmark icon to save your place</span>
            </div>
          ) : (
            <div className="bookmark-list">
              {bookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className={`bookmark-item ${bookmark.cfi === currentCfi ? 'current' : ''}`}
                  onClick={() => {
                    onGoToBookmark(bookmark.cfi);
                    setShowDropdown(false);
                  }}
                >
                  <div className="bookmark-info">
                    <span className="bookmark-chapter">{bookmark.chapter || 'Unknown Chapter'}</span>
                    <span className="bookmark-date">{formatDate(bookmark.createdAt)}</span>
                  </div>
                  <button
                    className="remove-bookmark-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveBookmark(bookmark.id);
                    }}
                    title="Remove bookmark"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
