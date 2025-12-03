import { useState, useEffect, useRef, useCallback } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import './PDFSearch.css';

interface SearchResult {
  pageNum: number;
  matchIndex: number;
  text: string;
}

interface PDFSearchProps {
  pdf: PDFDocumentProxy;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (pageNum: number) => void;
}

export function PDFSearch({
  pdf,
  isOpen,
  onClose,
  onNavigate,
}: PDFSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchProgress, setSearchProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isOpen]);

  const searchInPdf = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    // Cancel any ongoing search
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsSearching(true);
    setSearchProgress(0);
    setResults([]);

    const searchResults: SearchResult[] = [];
    const searchLower = searchQuery.toLowerCase();

    try {
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        // Check if search was cancelled
        if (abortControllerRef.current.signal.aborted) {
          break;
        }

        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Combine all text items into a single string for searching
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        
        const pageTextLower = pageText.toLowerCase();
        let matchIndex = 0;
        let position = 0;
        
        while ((position = pageTextLower.indexOf(searchLower, position)) !== -1) {
          // Get context around the match
          const start = Math.max(0, position - 30);
          const end = Math.min(pageText.length, position + searchQuery.length + 30);
          const excerpt = (start > 0 ? '...' : '') + 
                         pageText.slice(start, end) + 
                         (end < pageText.length ? '...' : '');
          
          searchResults.push({
            pageNum,
            matchIndex: matchIndex++,
            text: excerpt,
          });
          
          position += 1;
        }

        setSearchProgress(Math.round((pageNum / pdf.numPages) * 100));
      }

      setResults(searchResults);
      setCurrentIndex(0);
      
      // Navigate to first result
      if (searchResults.length > 0) {
        onNavigate(searchResults[0].pageNum);
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Search failed:', err);
      }
    } finally {
      setIsSearching(false);
      setSearchProgress(100);
    }
  }, [pdf, onNavigate]);

  const handleSearch = useCallback(() => {
    searchInPdf(query);
  }, [query, searchInPdf]);

  const navigateToResult = useCallback((index: number) => {
    if (results.length === 0) return;
    
    const wrappedIndex = ((index % results.length) + results.length) % results.length;
    setCurrentIndex(wrappedIndex);
    onNavigate(results[wrappedIndex].pageNum);
  }, [results, onNavigate]);

  const navigateNext = useCallback(() => {
    navigateToResult(currentIndex + 1);
  }, [currentIndex, navigateToResult]);

  const navigatePrevious = useCallback(() => {
    navigateToResult(currentIndex - 1);
  }, [currentIndex, navigateToResult]);

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
  }, [isOpen, results, currentIndex, handleSearch, navigateNext, navigatePrevious, onClose]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const highlightMatch = (text: string) => {
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
    <div className="pdf-search">
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
          placeholder="Search in PDF..."
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && results.length === 0) {
              handleSearch();
            }
          }}
        />
        {query && (
          <button className="clear-btn" onClick={() => { setQuery(''); setResults([]); }} title="Clear search">
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
        <div className="search-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              data-progress={searchProgress}
              ref={(el) => {
                if (el) el.style.width = `${searchProgress}%`;
              }}
            />
          </div>
          <span>Searching page {Math.round(searchProgress * pdf.numPages / 100)} of {pdf.numPages}...</span>
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
              key={`${result.pageNum}-${result.matchIndex}`}
              className={`search-result ${index === currentIndex ? 'active' : ''}`}
              onClick={() => {
                setCurrentIndex(index);
                onNavigate(result.pageNum);
              }}
            >
              <span className="result-page">Page {result.pageNum}</span>
              <span className="result-text">{highlightMatch(result.text)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
