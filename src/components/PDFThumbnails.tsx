import { useEffect, useRef, useState, useCallback } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import './PDFThumbnails.css';

interface PDFThumbnailsProps {
  pdf: PDFDocumentProxy;
  currentPage: number;
  onPageSelect: (page: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface ThumbnailCache {
  [page: number]: string;
}

export function PDFThumbnails({
  pdf,
  currentPage,
  onPageSelect,
  isOpen,
  onClose,
}: PDFThumbnailsProps) {
  const [thumbnails, setThumbnails] = useState<ThumbnailCache>({});
  const [loading, setLoading] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const generatingRef = useRef<Set<number>>(new Set());

  const THUMBNAIL_SCALE = 0.25;

  // Generate thumbnail for a specific page
  const generateThumbnail = useCallback(async (pageNum: number) => {
    // Use ref to track in-progress thumbnails to avoid race conditions
    if (generatingRef.current.has(pageNum)) return;
    generatingRef.current.add(pageNum);

    setLoading(prev => new Set(prev).add(pageNum));

    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: THUMBNAIL_SCALE });

      const canvas = document.createElement('canvas');
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

      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setThumbnails(prev => ({ ...prev, [pageNum]: dataUrl }));
    } catch (err) {
      console.error(`Failed to generate thumbnail for page ${pageNum}:`, err);
    } finally {
      generatingRef.current.delete(pageNum);
      setLoading(prev => {
        const next = new Set(prev);
        next.delete(pageNum);
        return next;
      });
    }
  }, [pdf]);

  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (!isOpen) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const pageNum = parseInt(entry.target.getAttribute('data-page') || '0', 10);
            if (pageNum > 0) {
              generateThumbnail(pageNum);
            }
          }
        });
      },
      { root: containerRef.current, rootMargin: '100px' }
    );

    return () => {
      observerRef.current?.disconnect();
    };
  }, [isOpen, generateThumbnail]);

  // Observe thumbnail placeholders
  useEffect(() => {
    if (!isOpen || !containerRef.current || !observerRef.current) return;

    const placeholders = containerRef.current.querySelectorAll('.thumbnail-item');
    placeholders.forEach(el => observerRef.current?.observe(el));

    return () => {
      placeholders.forEach(el => observerRef.current?.unobserve(el));
    };
  }, [isOpen, pdf.numPages]);

  // Scroll to current page thumbnail
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const currentThumbnail = containerRef.current.querySelector(
      `[data-page="${currentPage}"]`
    );
    currentThumbnail?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [isOpen, currentPage]);

  if (!isOpen) return null;

  return (
    <div className="pdf-thumbnails">
      <div className="thumbnails-header">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
        <span>Pages</span>
        <button className="close-btn" onClick={onClose} title="Close thumbnails">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="thumbnails-list" ref={containerRef}>
        {Array.from({ length: pdf.numPages }, (_, i) => i + 1).map(pageNum => (
          <div
            key={pageNum}
            className={`thumbnail-item ${pageNum === currentPage ? 'active' : ''}`}
            data-page={pageNum}
            onClick={() => onPageSelect(pageNum)}
          >
            <div className="thumbnail-image">
              {thumbnails[pageNum] ? (
                <img src={thumbnails[pageNum]} alt={`Page ${pageNum}`} />
              ) : (
                <div className="thumbnail-placeholder">
                  {loading.has(pageNum) ? (
                    <div className="thumbnail-spinner" />
                  ) : (
                    <span>{pageNum}</span>
                  )}
                </div>
              )}
            </div>
            <span className="thumbnail-label">{pageNum}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
