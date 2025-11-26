import { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import './PDFReader.css';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PDFReaderProps {
  filePath: string;
  initialPage?: number;
  onProgressUpdate: (location: string, percentage: number) => void;
}

function PDFReader({ filePath, initialPage = 1, onProgressUpdate }: PDFReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load PDF document
  useEffect(() => {
    async function loadPdf() {
      try {
        setIsLoading(true);
        setError(null);
        
        const loadingTask = pdfjsLib.getDocument(`file://${filePath}`);
        const pdfDoc = await loadingTask.promise;
        
        setPdf(pdfDoc);
        setNumPages(pdfDoc.numPages);
        setCurrentPage(Math.min(initialPage, pdfDoc.numPages));
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load PDF:', err);
        setError('Failed to load PDF file');
        setIsLoading(false);
      }
    }

    loadPdf();

    return () => {
      if (pdf) {
        pdf.destroy();
      }
    };
  }, [filePath]);

  // Render current page
  useEffect(() => {
    async function renderPage() {
      if (!pdf || !canvasRef.current) return;

      try {
        const page = await pdf.getPage(currentPage);
        const viewport = page.getViewport({ scale });
        
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport,
          canvas,
        };
        
        await page.render(renderContext).promise;
      } catch (err) {
        console.error('Failed to render page:', err);
      }
    }

    renderPage();
  }, [pdf, currentPage, scale]);

  // Update progress when page changes
  useEffect(() => {
    if (numPages > 0) {
      const percentage = (currentPage / numPages) * 100;
      onProgressUpdate(currentPage.toString(), percentage);
    }
  }, [currentPage, numPages, onProgressUpdate]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, numPages)));
  }, [numPages]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const zoomIn = useCallback(() => {
    setScale((s) => Math.min(s + 0.25, 3));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((s) => Math.max(s - 0.25, 0.5));
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
        case '+':
        case '=':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            zoomIn();
          }
          break;
        case '-':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            zoomOut();
          }
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextPage, prevPage, zoomIn, zoomOut]);

  if (isLoading) {
    return (
      <div className="pdf-reader">
        <div className="pdf-loading">
          <div className="spinner" />
          <p>Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pdf-reader">
        <div className="pdf-error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pdf-reader">
      <div className="pdf-toolbar">
        <div className="pdf-navigation">
          <button 
            className="btn btn-ghost" 
            onClick={prevPage} 
            disabled={currentPage <= 1}
            title="Previous page"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <polyline points="15,18 9,12 15,6" />
            </svg>
          </button>
          <span className="page-info">
            <input
              type="number"
              value={currentPage}
              onChange={(e) => goToPage(parseInt(e.target.value, 10) || 1)}
              min={1}
              max={numPages}
              className="page-input"
              aria-label="Current page"
            />
            <span>/ {numPages}</span>
          </span>
          <button 
            className="btn btn-ghost" 
            onClick={nextPage} 
            disabled={currentPage >= numPages}
            title="Next page"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <polyline points="9,18 15,12 9,6" />
            </svg>
          </button>
        </div>
        
        <div className="pdf-zoom">
          <button className="btn btn-ghost" onClick={zoomOut} title="Zoom out">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>
          <span className="zoom-level">{Math.round(scale * 100)}%</span>
          <button className="btn btn-ghost" onClick={zoomIn} title="Zoom in">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>
        </div>
      </div>

      <div className="pdf-container" ref={containerRef}>
        <canvas ref={canvasRef} className="pdf-canvas" />
      </div>
    </div>
  );
}

export default PDFReader;
