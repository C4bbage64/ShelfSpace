import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Book } from '../../shared/types/book';
import type { ReadingProgress } from '../../shared/types/progress';
import type { ReadingSession } from '../../shared/types/stats';
import PDFReader from '../readers/PDFReader';
import EPUBReader, { type EPUBReaderRef } from '../readers/EPUBReader';
import TXTReader from '../readers/TXTReader';
import { HighlightPanel } from '../components/HighlightPanel';
import { SelectionToolbar } from '../components/SelectionToolbar';
import { ReaderSettings, getDefaultPreferences, type ReaderPreferences } from '../components/ReaderSettings';
import { BookmarkButton } from '../components/BookmarkButton';
import { SearchInBook } from '../components/SearchInBook';
import { KeyboardShortcuts, useKeyboardShortcuts } from '../components/KeyboardShortcuts';
import './Reader.css';

function Reader() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [fileData, setFileData] = useState<string | null>(null);
  const [progress, setProgress] = useState<ReadingProgress | null>(null);
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [currentChapter, setCurrentChapter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHighlights, setShowHighlights] = useState(false);
  
  // New feature states
  const [showSettings, setShowSettings] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [preferences, setPreferences] = useState<ReaderPreferences>(getDefaultPreferences);
  const [bookmarks, setBookmarks] = useState<Array<{
    id: string;
    cfi: string;
    chapter: string;
    createdAt: string;
  }>>([]);
  
  // Reader ref for controlling navigation
  const epubReaderRef = useRef<EPUBReaderRef | null>(null);
  
  // Reading session tracking
  const sessionRef = useRef<ReadingSession | null>(null);
  const readerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadBook() {
      if (!bookId) {
        setError('No book ID provided');
        setIsLoading(false);
        return;
      }

      try {
        const [bookData, data, progressData] = await Promise.all([
          window.api.getBook(bookId),
          window.api.readFile(bookId),
          window.api.getProgress(bookId),
        ]);

        if (!bookData) {
          setError('Book not found');
          setIsLoading(false);
          return;
        }

        if (!data) {
          setError('Could not read book file');
          setIsLoading(false);
          return;
        }

        setBook(bookData);
        setFileData(data);
        setProgress(progressData);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load book:', err);
        setError('Failed to load book');
        setIsLoading(false);
      }
    }

    loadBook();
  }, [bookId]);

  // Start reading session when book is loaded
  useEffect(() => {
    if (!bookId || !book) return;
    
    async function startSession() {
      try {
        const session = await window.api.startReadingSession(bookId!);
        sessionRef.current = session;
        console.log('Started reading session:', session.id);
      } catch (err) {
        console.error('Failed to start reading session:', err);
      }
    }
    
    startSession();
    
    // End session when leaving the reader
    return () => {
      if (sessionRef.current) {
        window.api.endReadingSession(sessionRef.current.id).then((ended) => {
          if (ended) {
            console.log(`Reading session ended: ${ended.durationMinutes} minutes`);
          }
        });
      }
    };
  }, [bookId, book]);

  const handleProgressUpdate = async (location: string, percentage: number, chapter?: string) => {
    if (!bookId) return;
    
    setCurrentLocation(location);
    if (chapter) {
      setCurrentChapter(chapter);
    }
    
    try {
      await window.api.saveProgress({
        bookId,
        location,
        percentage,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to save progress:', err);
    }
  };

  // Create highlight from selected text (called from SelectionToolbar)
  const handleCreateHighlight = useCallback(async (text: string, color: string) => {
    if (!bookId || !text) return;
    
    try {
      await window.api.saveHighlight({
        bookId,
        text,
        location: currentLocation,
        color,
      });
    } catch (err) {
      console.error('Failed to create highlight:', err);
    }
  }, [bookId, currentLocation]);

  // Bookmark handlers
  const handleAddBookmark = useCallback(async () => {
    if (!bookId || !currentLocation) return;
    
    const newBookmark = {
      id: `${Date.now()}`,
      cfi: currentLocation,
      chapter: currentChapter || 'Unknown Chapter',
      createdAt: new Date().toISOString(),
    };
    
    setBookmarks(prev => [...prev, newBookmark]);
    // TODO: Persist bookmarks to database when API is available
  }, [bookId, currentLocation, currentChapter]);

  const handleRemoveBookmark = useCallback((id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
  }, []);

  const handleGoToBookmark = useCallback((cfi: string) => {
    if (epubReaderRef.current) {
      epubReaderRef.current.goTo(cfi);
    }
  }, []);

  const isCurrentLocationBookmarked = bookmarks.some(b => b.cfi === currentLocation);

  // Search handler for EPUB books
  const handleSearchInBook = useCallback(async (query: string) => {
    if (epubReaderRef.current) {
      try {
        const results = await epubReaderRef.current.search(query);
        return results || [];
      } catch (err) {
        console.error('Search failed:', err);
        return [];
      }
    }
    return [];
  }, []);

  const handleNavigateToSearchResult = useCallback((cfi: string) => {
    if (epubReaderRef.current) {
      epubReaderRef.current.goTo(cfi);
    }
  }, []);

  // Keyboard shortcuts
  const shortcutActions = useMemo(() => ({
    onNextPage: () => epubReaderRef.current?.goNext(),
    onPrevPage: () => epubReaderRef.current?.goPrev(),
    onToggleBookmark: handleAddBookmark,
    onOpenSearch: () => setShowSearch(true),
    onOpenSettings: () => setShowSettings(true),
    onToggleHighlightPanel: () => setShowHighlights(prev => !prev),
    onToggleToc: () => {}, // TODO: Implement TOC toggle
    onZoomIn: () => setPreferences(prev => ({
      ...prev,
      fontSize: Math.min(32, prev.fontSize + 2)
    })),
    onZoomOut: () => setPreferences(prev => ({
      ...prev,
      fontSize: Math.max(12, prev.fontSize - 2)
    })),
    onResetZoom: () => setPreferences(prev => ({ ...prev, fontSize: 18 })),
    onGoBack: () => {
      if (showSettings) setShowSettings(false);
      else if (showSearch) setShowSearch(false);
      else if (showShortcuts) setShowShortcuts(false);
      else if (showHighlights) setShowHighlights(false);
      else handleBack();
    },
  }), [handleAddBookmark, showSettings, showSearch, showShortcuts, showHighlights]);

  useKeyboardShortcuts(shortcutActions, !isLoading && !error);

  // Handle ? key for shortcuts help
  useEffect(() => {
    const handleHelpKey = (e: KeyboardEvent) => {
      if (e.key === '?' && !(e.target instanceof HTMLInputElement)) {
        setShowShortcuts(prev => !prev);
      }
    };
    document.addEventListener('keydown', handleHelpKey);
    return () => document.removeEventListener('keydown', handleHelpKey);
  }, []);

  const handleBack = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="reader-page">
        <div className="reader-loading">
          <div className="spinner" />
          <p>Loading book...</p>
        </div>
      </div>
    );
  }

  if (error || !book || !fileData) {
    return (
      <div className="reader-page">
        <div className="reader-error">
          <h2>Error</h2>
          <p>{error || 'Could not load book'}</p>
          <button className="btn btn-primary" onClick={handleBack}>
            Back to Library
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reader-page">
      <header className="reader-header">
        <button className="btn btn-ghost" onClick={handleBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12,19 5,12 12,5" />
          </svg>
          Back
        </button>
        <div className="reader-title">
          <h1>{book.title}</h1>
          <span>{book.author}</span>
        </div>
        <div className="reader-actions">
          {/* Search button - only for EPUB */}
          {book.type === 'epub' && (
            <button
              className={`btn btn-ghost ${showSearch ? 'active' : ''}`}
              onClick={() => setShowSearch(!showSearch)}
              title="Search in book (Ctrl+F)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          )}

          {/* Bookmark button - only for EPUB */}
          {book.type === 'epub' && (
            <BookmarkButton
              bookId={bookId!}
              currentCfi={currentLocation}
              currentChapter={currentChapter}
              isBookmarked={isCurrentLocationBookmarked}
              onAddBookmark={handleAddBookmark}
              onRemoveBookmark={handleRemoveBookmark}
              onGoToBookmark={handleGoToBookmark}
              bookmarks={bookmarks}
            />
          )}

          {/* Highlights toggle */}
          <button
            className={`btn btn-ghost ${showHighlights ? 'active' : ''}`}
            onClick={() => setShowHighlights(!showHighlights)}
            title="Toggle highlights (Ctrl+H)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>

          {/* Settings button */}
          <button
            className={`btn btn-ghost ${showSettings ? 'active' : ''}`}
            onClick={() => setShowSettings(!showSettings)}
            title="Reading settings (Ctrl+,)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>

          {/* Help button */}
          <button
            className="btn btn-ghost"
            onClick={() => setShowShortcuts(true)}
            title="Keyboard shortcuts (?)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </button>
        </div>
      </header>

      <div className="reader-content" ref={readerContainerRef}>
        <div className="reader-main">
          {book.type === 'pdf' && (
            <PDFReader
              fileData={fileData}
              initialPage={progress?.location ? parseInt(progress.location, 10) : 1}
              onProgressUpdate={handleProgressUpdate}
            />
          )}
          {book.type === 'epub' && (
            <EPUBReader
              ref={epubReaderRef}
              fileData={fileData}
              initialLocation={progress?.location}
              onProgressUpdate={handleProgressUpdate}
            />
          )}
          {book.type === 'txt' && (
            <TXTReader
              fileData={fileData}
              initialProgress={progress?.percentage || 0}
              onProgressUpdate={handleProgressUpdate}
            />
          )}
        </div>

        {showHighlights && bookId && (
          <HighlightPanel
            bookId={bookId}
            isOpen={showHighlights}
            onClose={() => setShowHighlights(false)}
          />
        )}
      </div>

      {/* Floating selection toolbar for quick highlighting */}
      <SelectionToolbar
        onHighlight={handleCreateHighlight}
        containerRef={readerContainerRef}
      />

      {/* Search modal - EPUB only */}
      {book.type === 'epub' && (
        <SearchInBook
          isOpen={showSearch}
          onClose={() => setShowSearch(false)}
          onSearch={handleSearchInBook}
          onNavigateToResult={handleNavigateToSearchResult}
        />
      )}

      {/* Reader settings modal */}
      <ReaderSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        preferences={preferences}
        onPreferencesChange={setPreferences}
      />

      {/* Keyboard shortcuts help modal */}
      <KeyboardShortcuts
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  );
}

export default Reader;
