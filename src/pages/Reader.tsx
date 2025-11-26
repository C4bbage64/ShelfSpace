import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Book } from '../../shared/types/book';
import type { ReadingProgress } from '../../shared/types/progress';
import PDFReader from '../readers/PDFReader';
import EPUBReader from '../readers/EPUBReader';
import TXTReader from '../readers/TXTReader';
import './Reader.css';

function Reader() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [filePath, setFilePath] = useState<string | null>(null);
  const [progress, setProgress] = useState<ReadingProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBook() {
      if (!bookId) {
        setError('No book ID provided');
        setIsLoading(false);
        return;
      }

      try {
        const [bookData, pathData, progressData] = await Promise.all([
          window.api.getBook(bookId),
          window.api.getFilePath(bookId),
          window.api.getProgress(bookId),
        ]);

        if (!bookData) {
          setError('Book not found');
          setIsLoading(false);
          return;
        }

        setBook(bookData);
        setFilePath(pathData);
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

  const handleProgressUpdate = async (location: string, percentage: number) => {
    if (!bookId) return;
    
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

  if (error || !book || !filePath) {
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
          {/* Future: notes panel toggle, settings, etc. */}
        </div>
      </header>

      <div className="reader-content">
        {book.type === 'pdf' && (
          <PDFReader
            filePath={filePath}
            initialPage={progress?.location ? parseInt(progress.location, 10) : 1}
            onProgressUpdate={handleProgressUpdate}
          />
        )}
        {book.type === 'epub' && (
          <EPUBReader
            filePath={filePath}
            initialLocation={progress?.location}
            onProgressUpdate={handleProgressUpdate}
          />
        )}
        {book.type === 'txt' && (
          <TXTReader
            filePath={filePath}
            initialProgress={progress?.percentage || 0}
            onProgressUpdate={handleProgressUpdate}
          />
        )}
      </div>
    </div>
  );
}

export default Reader;
