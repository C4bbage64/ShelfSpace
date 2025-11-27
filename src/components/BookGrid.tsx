import type { Book, ViewMode } from '../../shared/types/book';
import BookCard from './BookCard';
import './BookGrid.css';

export interface BookGridProps {
  books: Book[];
  viewMode: ViewMode;
  onBookClick: (bookId: string) => void;
  onEditBook: (book: Book) => void;
  onDeleteBook: (bookId: string) => void;
  deleteLabel?: string;
  enableDragDrop?: boolean;
}

function BookGrid({ books, viewMode, onBookClick, onEditBook, onDeleteBook, enableDragDrop = true }: BookGridProps) {
  const handleDragStart = (bookId: string) => {
    // Drag data is set in BookCard component
    console.log('Dragging book:', bookId);
  };

  return (
    <div className={`book-grid ${viewMode}`}>
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          viewMode={viewMode}
          onClick={() => onBookClick(book.id)}
          onEdit={() => onEditBook(book)}
          onDelete={() => onDeleteBook(book.id)}
          onDragStart={enableDragDrop ? handleDragStart : undefined}
        />
      ))}
    </div>
  );
}

export { BookGrid };
export default BookGrid;
