import type { ViewMode } from '../../shared/types/book';
import './BookGridSkeleton.css';

interface BookGridSkeletonProps {
  viewMode: ViewMode;
  count?: number;
}

function BookGridSkeleton({ viewMode, count = 12 }: BookGridSkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (viewMode === 'list') {
    return (
      <div className="skeleton-list">
        {items.map((i) => (
          <div key={i} className="skeleton-list-item">
            <div className="skeleton skeleton-cover-list" />
            <div className="skeleton-info-list">
              <div className="skeleton skeleton-text title" />
              <div className="skeleton skeleton-text author" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="skeleton-grid">
      {items.map((i) => (
        <div key={i} className="skeleton-book-card">
          <div className="skeleton skeleton-card" />
          <div className="skeleton-book-info">
            <div className="skeleton skeleton-text title" />
            <div className="skeleton skeleton-text author" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default BookGridSkeleton;
