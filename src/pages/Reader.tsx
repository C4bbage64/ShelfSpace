import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Book } from '../../shared/types/book';
import type { ReadingProgress } from '../../shared/types/progress';
import type { ReadingSession } from '../../shared/types/stats';
import PDFReader from '../readers/PDFReader';
import EPUBReader from '../readers/EPUBReader';
import TXTReader from '../readers/TXTReader';
import { HighlightPanel } from '../components/HighlightPanel';
import './Reader.css';

function Reader() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [fileData, setFileData] = useState<string | null>(null);
  const [progress, setProgress] = useState<ReadingProgress | null>(null);
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHighlights, setShowHighlights] = useState(false);
  const [selectedText, setSelectedText] = useState<string>('');
  
  // Reading session tracking
  const sessionRef = useRef<ReadingSession | null>(null);

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

  const handleProgressUpdate = async (location: string, percentage: number) => {
    if (!bookId) return;
    
    setCurrentLocation(location);
    
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

  // Handle text selection for highlighting
  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim() || '';
    setSelectedText(text);
  }, []);

  // Create highlight from selected text
  const handleCreateHighlight = useCallback(async (color: string) => {
    if (!bookId || !selectedText) return;
    
    try {
      await window.api.saveHighlight({
        bookId,
        text: selectedText,
        location: currentLocation,
        color,
      });
      setSelectedText('');
      window.getSelection()?.removeAllRanges();
    } catch (err) {
      console.error('Failed to create highlight:', err);
    }
  }, [bookId, selectedText, currentLocation]);

  // Listen for text selection
  useEffect(() => {
    document.addEventListener('mouseup', handleTextSelection);
    return () => document.removeEventListener('mouseup', handleTextSelection);
  }, [handleTextSelection]);

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
          <button
            className={`btn btn-ghost ${showHighlights ? 'active' : ''}`}
            onClick={() => setShowHighlights(!showHighlights)}
            title="Toggle highlights"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        </div>
      </header>

      <div className="reader-content">
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
            selectedText={selectedText}
            onCreateHighlight={handleCreateHighlight}
          />
        )}
      </div>
    </div>
  );
}

export default Reader;
