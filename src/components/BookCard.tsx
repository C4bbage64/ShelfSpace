import type { Book, ViewMode } from '../../shared/types/book';
import './BookCard.css';

interface BookCardProps {
  book: Book;
  viewMode: ViewMode;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function BookCard({ book, viewMode, onClick, onEdit, onDelete }: BookCardProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return '📄';
      case 'epub':
        return '📖';
      case 'txt':
        return '📝';
      default:
        return '📚';
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  };

  if (viewMode === 'list') {
    return (
      <div className="book-card list" onClick={onClick}>
        <div className="book-cover-list">
          {book.coverPath ? (
            <img src={`file://${book.coverPath}`} alt={book.title} />
          ) : (
            <div className="book-cover-placeholder">
              <span className="book-type-icon">{getTypeIcon(book.type)}</span>
            </div>
          )}
        </div>
        <div className="book-info-list">
          <h3 className="book-title">{book.title}</h3>
          <p className="book-author">{book.author}</p>
        </div>
        <div className="book-meta-list">
          <span className="book-type">{book.type.toUpperCase()}</span>
          <span className="book-date">Last opened: {formatDate(book.lastOpenedAt)}</span>
        </div>
        <div className="book-actions-list">
          <button className="book-edit" onClick={handleEditClick} title="Edit book">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button className="book-delete" onClick={handleDeleteClick} title="Delete book">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3,6 5,6 21,6" />
              <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="book-card grid" onClick={onClick}>
      <div className="book-cover">
        {book.coverPath ? (
          <img src={`file://${book.coverPath}`} alt={book.title} />
        ) : (
          <div className="book-cover-placeholder">
            <span className="book-type-icon">{getTypeIcon(book.type)}</span>
            <span className="book-title-preview">{book.title}</span>
          </div>
        )}
        <div className="book-overlay">
          <button className="book-edit" onClick={handleEditClick} title="Edit book">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button className="book-delete" onClick={handleDeleteClick} title="Delete book">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3,6 5,6 21,6" />
              <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6" />
            </svg>
          </button>
        </div>
      </div>
      <div className="book-info">
        <h3 className="book-title" title={book.title}>{book.title}</h3>
        <p className="book-author" title={book.author}>{book.author}</p>
      </div>
    </div>
  );
}

export default BookCard;
