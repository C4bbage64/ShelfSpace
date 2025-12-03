import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { TextLayer } from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.min.mjs';
import 'pdfjs-dist/web/pdf_viewer.css';
import { PDFThumbnails } from '../components/PDFThumbnails';
import { PDFOutline } from '../components/PDFOutline';
import { PDFSearch } from '../components/PDFSearch';
import './PDFReader.css';

// Set up PDF.js worker using the bundled worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface PDFReaderProps {
  fileData: string; // base64 encoded
  initialPage?: number;
  onProgressUpdate: (location: string, percentage: number) => void;
}

export interface PDFReaderRef {
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  search: () => void;
}

type ViewMode = 'single' | 'continuous';
type SidebarMode = 'none' | 'thumbnails' | 'outline';

const PDFReader = forwardRef<PDFReaderRef, PDFReaderProps>(function PDFReader(
  { fileData, initialPage = 1, onProgressUpdate },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const continuousContainerRef = useRef<HTMLDivElement>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // New features state
  const [viewMode, setViewMode] = useState<ViewMode>('single');
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('none');
  const [showSearch, setShowSearch] = useState(false);

  // Load PDF document
  useEffect(() => {
    async function loadPdf() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Decode base64 to Uint8Array
        const binaryString = atob(fileData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const loadingTask = pdfjsLib.getDocument({ data: bytes });
        const pdfDoc = await loadingTask.promise;
        
        setPdf(pdfDoc);
        setNumPages(pdfDoc.numPages);
        setCurrentPage(Math.min(initialPage, pdfDoc.numPages));
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load PDF:', err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(`Failed to load PDF: ${errorMessage}`);
        setIsLoading(false);
      }
    }

    if (fileData) {
      loadPdf();
    }

    return () => {
      if (pdf) {
        pdf.destroy();
      }
    };
  }, [fileData]);

  // Render single page (for single page mode)
  const renderSinglePage = useCallback(async () => {
    if (!pdf || !canvasRef.current || !textLayerRef.current || viewMode !== 'single') return;

    try {
      const page = await pdf.getPage(currentPage);
      const viewport = page.getViewport({ scale });
      
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        canvas: canvas as any,
      }).promise;
      
      // Render text layer for selection
      const textContent = await page.getTextContent();
      const textLayerDiv = textLayerRef.current;
      
      textLayerDiv.innerHTML = '';
      textLayerDiv.style.width = `${viewport.width}px`;
      textLayerDiv.style.height = `${viewport.height}px`;
      
      const textLayer = new TextLayer({
        textContentSource: textContent,
        container: textLayerDiv,
        viewport: viewport,
      });
      
      await textLayer.render();
    } catch (err) {
      console.error('Failed to render page:', err);
    }
  }, [pdf, currentPage, scale, viewMode]);

  useEffect(() => {
    if (viewMode === 'single') {
      renderSinglePage();
    }
  }, [renderSinglePage, viewMode]);

  // Render a page for continuous scroll mode
  const renderPageForContinuous = useCallback(async (pageNum: number, container: HTMLElement) => {
    if (!pdf) return;
    
    // Check if already rendered
    const existingPage = container.querySelector(`[data-page="${pageNum}"]`);
    if (existingPage) return;

    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      
      const pageContainer = document.createElement('div');
      pageContainer.className = 'pdf-page-continuous';
      pageContainer.setAttribute('data-page', pageNum.toString());
      
      const canvas = document.createElement('canvas');
      canvas.className = 'pdf-canvas';
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      const context = canvas.getContext('2d');
      if (!context) return;
      
      pageContainer.appendChild(canvas);
      
      // Text layer
      const textLayerDiv = document.createElement('div');
      textLayerDiv.className = 'textLayer';
      pageContainer.appendChild(textLayerDiv);
      
      // Page number label
      const pageLabel = document.createElement('div');
      pageLabel.className = 'page-label';
      pageLabel.textContent = `Page ${pageNum}`;
      pageContainer.appendChild(pageLabel);
      
      // Find the right position to insert
      const existingPages = container.querySelectorAll('.pdf-page-continuous');
      let insertBefore: Element | null = null;
      for (const existing of existingPages) {
        const existingPageNum = parseInt(existing.getAttribute('data-page') || '0', 10);
        if (existingPageNum > pageNum) {
          insertBefore = existing;
          break;
        }
      }
      
      if (insertBefore) {
        container.insertBefore(pageContainer, insertBefore);
      } else {
        container.appendChild(pageContainer);
      }
      
      // Render the page
      await page.render({
        canvasContext: context,
        viewport,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        canvas: canvas as any,
      }).promise;
      
      // Render text layer
      const textContent = await page.getTextContent();
      const textLayer = new TextLayer({
        textContentSource: textContent,
        container: textLayerDiv,
        viewport: viewport,
      });
      await textLayer.render();
    } catch (err) {
      console.error(`Failed to render page ${pageNum}:`, err);
    }
  }, [pdf, scale]);

  // Set up continuous scroll mode
  useEffect(() => {
    if (viewMode !== 'continuous' || !pdf || !continuousContainerRef.current) return;

    const container = continuousContainerRef.current;
    
    // Clear existing pages when switching to continuous mode or scale changes
    container.innerHTML = '';
    
    // Initially render visible pages
    const renderVisiblePages = () => {
      const containerRect = container.getBoundingClientRect();
      const scrollTop = container.scrollTop;
      const viewportHeight = containerRect.height;
      
      // Estimate which pages should be visible (use reasonable estimate)
      const estimatedPageHeight = Math.max(500, (containerRect.width * 0.6) * 1.3);
      const startPage = Math.max(1, Math.floor(scrollTop / estimatedPageHeight));
      const endPage = Math.min(pdf.numPages, Math.ceil((scrollTop + viewportHeight) / estimatedPageHeight) + 3);
      
      for (let i = startPage; i <= endPage; i++) {
        renderPageForContinuous(i, container);
      }
    };

    // Initial render - render first few pages
    for (let i = 1; i <= Math.min(3, pdf.numPages); i++) {
      renderPageForContinuous(i, container);
    }
    
    // Render more pages on scroll
    const handleScroll = () => {
      renderVisiblePages();
      
      // Update current page based on scroll position
      const pages = container.querySelectorAll('.pdf-page-continuous');
      const scrollTop = container.scrollTop;
      const viewportCenter = scrollTop + container.clientHeight / 2;
      
      let closestPage = 1;
      let closestDistance = Infinity;
      
      pages.forEach(page => {
        const rect = (page as HTMLElement).getBoundingClientRect();
        const pageTop = rect.top - container.getBoundingClientRect().top + scrollTop;
        const pageCenter = pageTop + rect.height / 2;
        const distance = Math.abs(viewportCenter - pageCenter);
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestPage = parseInt(page.getAttribute('data-page') || '1', 10);
        }
      });
      
      if (closestPage !== currentPage) {
        setCurrentPage(closestPage);
      }
    };
    
    container.addEventListener('scroll', handleScroll);
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [viewMode, pdf, scale, renderPageForContinuous, currentPage]);

  // Update progress when page changes
  useEffect(() => {
    if (numPages > 0) {
      const percentage = (currentPage / numPages) * 100;
      onProgressUpdate(currentPage.toString(), percentage);
    }
  }, [currentPage, numPages, onProgressUpdate]);

  const goToPage = useCallback(async (page: number) => {
    const targetPage = Math.max(1, Math.min(page, numPages));
    setCurrentPage(targetPage);
    
    // In continuous mode, ensure page is rendered then scroll to it
    if (viewMode === 'continuous' && continuousContainerRef.current && pdf) {
      const container = continuousContainerRef.current;
      
      // Render the target page if not already rendered
      await renderPageForContinuous(targetPage, container);
      
      // Wait a tick for DOM to update
      requestAnimationFrame(() => {
        const pageElement = container.querySelector(`[data-page="${targetPage}"]`);
        pageElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [numPages, viewMode, pdf, renderPageForContinuous]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const zoomIn = useCallback(() => {
    setScale((s) => Math.min(s + 0.25, 3));
    // Clear continuous scroll container to re-render at new scale
    if (continuousContainerRef.current) {
      continuousContainerRef.current.innerHTML = '';
    }
  }, []);

  const zoomOut = useCallback(() => {
    setScale((s) => Math.max(s - 0.25, 0.5));
    // Clear continuous scroll container to re-render at new scale
    if (continuousContainerRef.current) {
      continuousContainerRef.current.innerHTML = '';
    }
  }, []);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    goToPage,
    nextPage,
    prevPage,
    search: () => setShowSearch(true),
  }), [goToPage, nextPage, prevPage]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement) return;
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setShowSearch(true);
        return;
      }
      
      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
          if (viewMode === 'single') {
            nextPage();
          }
          break;
        case 'ArrowLeft':
        case 'PageUp':
          if (viewMode === 'single') {
            prevPage();
          }
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
  }, [nextPage, prevPage, zoomIn, zoomOut, viewMode]);

  const toggleSidebar = (mode: SidebarMode) => {
    setSidebarMode(prev => prev === mode ? 'none' : mode);
  };

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
        {/* Left side - sidebar toggles */}
        <div className="pdf-sidebar-toggles">
          <button
            className={`btn btn-ghost ${sidebarMode === 'thumbnails' ? 'active' : ''}`}
            onClick={() => toggleSidebar('thumbnails')}
            title="Page thumbnails"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </button>
          <button
            className={`btn btn-ghost ${sidebarMode === 'outline' ? 'active' : ''}`}
            onClick={() => toggleSidebar('outline')}
            title="Table of contents"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>

        {/* Center - navigation */}
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

        {/* Right side - zoom and view mode */}
        <div className="pdf-controls">
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

          <div className="pdf-view-mode">
            <button
              className={`btn btn-ghost ${viewMode === 'single' ? 'active' : ''}`}
              onClick={() => setViewMode('single')}
              title="Single page view"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <rect x="4" y="3" width="16" height="18" rx="2" />
              </svg>
            </button>
            <button
              className={`btn btn-ghost ${viewMode === 'continuous' ? 'active' : ''}`}
              onClick={() => setViewMode('continuous')}
              title="Continuous scroll"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <rect x="4" y="2" width="16" height="8" rx="1" />
                <rect x="4" y="14" width="16" height="8" rx="1" />
              </svg>
            </button>
          </div>

          <button
            className={`btn btn-ghost ${showSearch ? 'active' : ''}`}
            onClick={() => setShowSearch(!showSearch)}
            title="Search (Ctrl+F)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>
      </div>

      <div className="pdf-body">
        {/* Thumbnails sidebar */}
        {pdf && (
          <PDFThumbnails
            pdf={pdf}
            currentPage={currentPage}
            onPageSelect={goToPage}
            isOpen={sidebarMode === 'thumbnails'}
            onClose={() => setSidebarMode('none')}
          />
        )}

        {/* Outline sidebar */}
        {pdf && (
          <PDFOutline
            pdf={pdf}
            isOpen={sidebarMode === 'outline'}
            onClose={() => setSidebarMode('none')}
            onNavigate={goToPage}
          />
        )}

        {/* Main content area */}
        <div className="pdf-container" ref={containerRef}>
          {viewMode === 'single' ? (
            <div className="pdf-page-wrapper">
              <canvas ref={canvasRef} className="pdf-canvas" />
              <div ref={textLayerRef} className="textLayer" />
            </div>
          ) : (
            <div className="pdf-continuous-container" ref={continuousContainerRef} />
          )}

          {/* Search overlay - positioned within content area */}
          {pdf && (
            <PDFSearch
              pdf={pdf}
              isOpen={showSearch}
              onClose={() => setShowSearch(false)}
              onNavigate={goToPage}
            />
          )}
        </div>
      </div>
    </div>
  );
});

export default PDFReader;
