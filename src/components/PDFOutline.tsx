import { useEffect, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import './PDFOutline.css';

interface OutlineItem {
  title: string;
  dest: string | any[] | null;
  items: OutlineItem[];
}

interface PDFOutlineProps {
  pdf: PDFDocumentProxy;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (pageNum: number) => void;
}

export function PDFOutline({ pdf, isOpen, onClose, onNavigate }: PDFOutlineProps) {
  const [outline, setOutline] = useState<OutlineItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadOutline() {
      try {
        setLoading(true);
        const outlineData = await pdf.getOutline();
        setOutline(outlineData);
      } catch (err) {
        console.error('Failed to load PDF outline:', err);
        setOutline(null);
      } finally {
        setLoading(false);
      }
    }

    if (isOpen) {
      loadOutline();
    }
  }, [pdf, isOpen]);

  const handleItemClick = async (item: OutlineItem) => {
    if (!item.dest) return;

    try {
      let pageIndex: number;
      
      if (typeof item.dest === 'string') {
        // Named destination
        const dest = await pdf.getDestination(item.dest);
        if (dest) {
          const ref = dest[0];
          pageIndex = await pdf.getPageIndex(ref);
        } else {
          return;
        }
      } else if (Array.isArray(item.dest)) {
        // Explicit destination
        const ref = item.dest[0];
        pageIndex = await pdf.getPageIndex(ref);
      } else {
        return;
      }

      onNavigate(pageIndex + 1); // Convert 0-indexed to 1-indexed
    } catch (err) {
      console.error('Failed to navigate to destination:', err);
    }
  };

  const toggleExpanded = (title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  };

  const renderOutlineItem = (item: OutlineItem, depth: number = 0): React.ReactNode => {
    const hasChildren = item.items && item.items.length > 0;
    const isExpanded = expandedItems.has(item.title);
    const itemKey = `${depth}-${item.title}`;

    return (
      <div key={itemKey} className="outline-item-wrapper">
        <div
          className={`outline-item outline-depth-${Math.min(depth, 5)}`}
          onClick={() => handleItemClick(item)}
        >
          {hasChildren && (
            <button
              className="expand-btn"
              onClick={(e) => toggleExpanded(item.title, e)}
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                width="14"
                height="14"
                className={isExpanded ? 'expanded' : ''}
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
          <span className="outline-title">{item.title}</span>
        </div>
        {hasChildren && isExpanded && (
          <div className="outline-children">
            {item.items.map((child) => renderOutlineItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="pdf-outline">
      <div className="outline-header">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
        <span>Contents</span>
        <button className="close-btn" onClick={onClose} title="Close outline">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="outline-content">
        {loading ? (
          <div className="outline-loading">
            <div className="spinner" />
            <span>Loading contents...</span>
          </div>
        ) : outline && outline.length > 0 ? (
          <div className="outline-list">
            {outline.map((item) => renderOutlineItem(item, 0))}
          </div>
        ) : (
          <div className="outline-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <p>No table of contents</p>
            <span>This PDF doesn't have a built-in outline</span>
          </div>
        )}
      </div>
    </div>
  );
}
