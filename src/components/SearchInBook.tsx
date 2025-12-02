import { useState, useEffect, useRef } from 'react';
import './SearchInBook.css';

interface SearchResult {
  cfi: string;
  excerpt: string;
  chapter?: string;
}

interface SearchInBookProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => Promise<SearchResult[]>;
  onNavigateToResult: (cfi: string) => void;
}

export function SearchInBook({
  isOpen,
  onClose,
  onSearch,
  onNavigateToResult,
}: SearchInBookProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter') {
        if (e.shiftKey) {
          navigatePrevious();
        } else if (results.length > 0) {
          navigateNext();
        } else {
          handleSearch();
        }
      } else if (e.key === 'F3' || (e.ctrlKey && e.key === 'g')) {
        e.preventDefault();
        if (e.shiftKey) {
          navigatePrevious();
        } else {
          navigateNext();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, currentIndex]);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const searchResults = await onSearch(query);
      setResults(searchResults);
      setCurrentIndex(0);
      if (searchResults.length > 0) {
        onNavigateToResult(searchResults[0].cfi);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const navigateNext = () => {
    if (results.length === 0) return;
    const nextIndex = (currentIndex + 1) % results.length;
    setCurrentIndex(nextIndex);
    onNavigateToResult(results[nextIndex].cfi);
  };

  const navigatePrevious = () => {
    if (results.length === 0) return;
    const prevIndex = (currentIndex - 1 + results.length) % results.length;
    setCurrentIndex(prevIndex);
    onNavigateToResult(results[prevIndex].cfi);
  };

  const highlightQuery = (text: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i}>{part}</mark>
      ) : (
        part
      )
    );
  };

  if (!isOpen) return null;

  return (
    <div className="search-in-book">
      <div className="search-bar">
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search in book..."
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && results.length === 0) {
              handleSearch();
            }
          }}
        />
        {query && (
          <button className="clear-btn" onClick={() => { setQuery(''); setResults([]); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
        <div className="search-actions">
          {results.length > 0 && (
            <span className="result-count">
              {currentIndex + 1} / {results.length}
            </span>
          )}
          <button
            className="nav-btn"
            onClick={navigatePrevious}
            disabled={results.length === 0}
            title="Previous (Shift+Enter)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </button>
          <button
            className="nav-btn"
            onClick={navigateNext}
            disabled={results.length === 0}
            title="Next (Enter)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <button className="close-btn" onClick={onClose} title="Close (Esc)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {isSearching && (
        <div className="search-status">
          <div className="spinner"></div>
          <span>Searching...</span>
        </div>
      )}

      {!isSearching && query && results.length === 0 && (
        <div className="search-status no-results">
          <span>No results found</span>
        </div>
      )}

      {results.length > 0 && (
        <div className="search-results">
          {results.map((result, index) => (
            <div
              key={result.cfi}
              className={`search-result ${index === currentIndex ? 'active' : ''}`}
              onClick={() => {
                setCurrentIndex(index);
                onNavigateToResult(result.cfi);
              }}
            >
              {result.chapter && <span className="result-chapter">{result.chapter}</span>}
              <span className="result-excerpt">{highlightQuery(result.excerpt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
