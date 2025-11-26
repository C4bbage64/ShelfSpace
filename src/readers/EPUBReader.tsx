import { useEffect, useRef, useState, useCallback } from 'react';
import ePub, { Book, Rendition } from 'epubjs';
import './EPUBReader.css';

interface EPUBReaderProps {
  fileData: string; // base64 encoded
  initialLocation?: string;
  onProgressUpdate: (location: string, percentage: number) => void;
}

function EPUBReader({ fileData, initialLocation, onProgressUpdate }: EPUBReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<Book | null>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentChapter, setCurrentChapter] = useState('');
  const [progress, setProgress] = useState(0);

  // Initialize EPUB
  useEffect(() => {
    if (!containerRef.current) return;

    async function loadBook() {
      try {
        setIsLoading(true);
        setError(null);

        // Decode base64 to ArrayBuffer
        const binaryString = atob(fileData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Create new book instance from ArrayBuffer
        const book = ePub(bytes.buffer as ArrayBuffer);
        bookRef.current = book;

        // Wait for book to be ready
        await book.ready;

        // Create rendition
        const rendition = book.renderTo(containerRef.current!, {
          width: '100%',
          height: '100%',
          spread: 'auto',
        });

        renditionRef.current = rendition;

        // Display initial location or start
        if (initialLocation) {
          await rendition.display(initialLocation);
        } else {
          await rendition.display();
        }

        // Set up location changed handler
        rendition.on('relocated', (location: { start: { cfi: string; percentage: number } }) => {
          const cfi = location.start.cfi;
          const percentage = location.start.percentage * 100;
          
          setProgress(percentage);
          onProgressUpdate(cfi, percentage);

          // Update current chapter
          const currentSection = book.spine.get(cfi);
          if (currentSection) {
            const navItem = book.navigation.get(currentSection.href);
            if (navItem) {
              setCurrentChapter(navItem.label);
            }
          }
        });

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load EPUB:', err);
        setError('Failed to load EPUB file');
        setIsLoading(false);
      }
    }

    loadBook();

    return () => {
      if (renditionRef.current) {
        renditionRef.current.destroy();
      }
      if (bookRef.current) {
        bookRef.current.destroy();
      }
    };
  }, [fileData]);

  const nextPage = useCallback(() => {
    renditionRef.current?.next();
  }, []);

  const prevPage = useCallback(() => {
    renditionRef.current?.prev();
  }, []);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
          nextPage();
          break;
        case 'ArrowLeft':
        case 'PageUp':
          prevPage();
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextPage, prevPage]);

  // Click navigation
  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    
    if (clickX < width * 0.3) {
      prevPage();
    } else if (clickX > width * 0.7) {
      nextPage();
    }
  }, [nextPage, prevPage]);

  if (isLoading) {
    return (
      <div className="epub-reader">
        <div className="epub-loading">
          <div className="spinner" />
          <p>Loading book...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="epub-reader">
        <div className="epub-error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="epub-reader">
      <div className="epub-toolbar">
        <div className="epub-navigation">
          <button className="btn btn-ghost" onClick={prevPage} title="Previous">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <polyline points="15,18 9,12 15,6" />
            </svg>
          </button>
          <span className="chapter-info">{currentChapter || 'Loading...'}</span>
          <button className="btn btn-ghost" onClick={nextPage} title="Next">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <polyline points="9,18 15,12 9,6" />
            </svg>
          </button>
        </div>
        <div className="progress-info">
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      <div 
        className="epub-container" 
        ref={containerRef}
        onClick={handleContainerClick}
      />

      <div className="epub-progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

export default EPUBReader;
