import type { Book, ViewMode } from '../../shared/types/book';
import BookCard from './BookCard';
import './BookGrid.css';

export interface BookGridProps {
  books: Book[];
  viewMode: ViewMode;
  onBookClick: (bookId: string) => void;
  onEditBook: (book: Book) => void;
  onDeleteBook: (bookId: string) => void;
}

function BookGrid({ books, viewMode, onBookClick, onEditBook, onDeleteBook }: BookGridProps) {
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
        />
      ))}
    </div>
  );
}

export default BookGrid;
